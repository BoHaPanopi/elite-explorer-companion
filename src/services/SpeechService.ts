import { invoke } from "@tauri-apps/api/core";
import { getCrewVoiceProfile, normalizeVoiceLocale, type CrewVoiceGender, type SupportedVoiceLocale } from "../voices/crewVoiceProfiles.ts";
import { OGG_VOICE_CONFIG } from "../voices/voiceConfig.ts";

export type SpeechOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  voice?: string;
  preRollMs?: number;
  speaker?: string;
  locale?: string;
  style?: string;
  voiceGender?: CrewVoiceGender;
};

export type LocalVoiceResolutionRequest = {
  locale: SupportedVoiceLocale;
  baseVoiceName?: string;
  gender?: CrewVoiceGender;
};

export function resolveLocalVoice(
  voices: LocalVoice[],
  request: LocalVoiceResolutionRequest,
): LocalVoice | null {
  const normalizedLocale = request.locale.toLocaleLowerCase();
  const normalizedName = request.baseVoiceName?.trim().toLocaleLowerCase();
  return voices
    .filter((voice) => voice.available && voice.locale.toLocaleLowerCase() === normalizedLocale)
    .filter((voice) => !request.gender || voice.gender === request.gender)
    .filter((voice) => !normalizedName || voice.displayName.trim().toLocaleLowerCase() === normalizedName)
    .sort((left, right) => left.displayName.localeCompare(right.displayName) || left.id.localeCompare(right.id))[0] ?? null;
}

export type LocalVoice = {
  id: string;
  displayName: string;
  locale: string;
  gender: "male" | "female" | "unknown";
  api: string;
  available: boolean;
};

export type LocalVoiceAvailability = {
  locale: SupportedVoiceLocale;
  available: boolean;
  voice: LocalVoice | null;
  reason: "available" | "locale_missing" | "voice_missing";
};

export class LocalVoiceUnavailableError extends Error {
  readonly locale: SupportedVoiceLocale;
  readonly reason: LocalVoiceAvailability["reason"];

  constructor(
    locale: SupportedVoiceLocale,
    reason: LocalVoiceAvailability["reason"],
  ) {
    super(`Local Windows text-to-speech voice is unavailable for ${locale} (${reason}).`);
    this.name = "LocalVoiceUnavailableError";
    this.locale = locale;
    this.reason = reason;
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

function logAudio(event: string, technical?: string): void {
  void invoke("log_audio_event", { event, technical: technical ?? null }).catch(() => undefined);
}

function logDiagnostic(kind: string, payload: Record<string, unknown>): void {
  void invoke("log_diagnostic_event", { kind, payload }).catch(() => undefined);
}

class SpeechService {
  private queueToken = 0;
  private voiceSequence = 0;
  private voiceCache: Promise<LocalVoice[]> | null = null;

  async listLocalVoices(refresh = false): Promise<LocalVoice[]> {
    if (refresh || !this.voiceCache) {
      this.voiceCache = invoke<LocalVoice[]>("list_local_voices").catch((error) => {
        this.voiceCache = null;
        throw error;
      });
    }
    return this.voiceCache;
  }

  async getAvailability(
    localeInput: string,
    requestedVoice?: string,
    requestedGender?: CrewVoiceGender,
  ): Promise<LocalVoiceAvailability> {
    const locale = normalizeVoiceLocale(localeInput);
    if (!locale) {
      throw new Error(`Unsupported OGG voice locale: ${localeInput}`);
    }
    const voices = await this.listLocalVoices();
    const localeVoices = voices.filter((voice) => voice.available && voice.locale.toLowerCase() === locale.toLowerCase());
    if (!localeVoices.length) {
      return { locale, available: false, voice: null, reason: "locale_missing" };
    }
    const voice = resolveLocalVoice(voices, { locale, baseVoiceName: requestedVoice, gender: requestedGender });
    return voice
      ? { locale, available: true, voice, reason: "available" }
      : { locale, available: false, voice: null, reason: "voice_missing" };
  }

  async isSupported(): Promise<boolean> {
    try {
      return (await this.listLocalVoices()).length > 0;
    } catch {
      return false;
    }
  }

  async waitUntilReady(timeoutMs = 30_000): Promise<boolean> {
    void timeoutMs;
    try {
      const availability = await this.getAvailability(
        OGG_VOICE_CONFIG.locale,
        OGG_VOICE_CONFIG.voice,
      );
      return availability.available;
    } catch {
      return false;
    }
  }

  logTestButtonClick(): void {
    logAudio("test_button_clicked");
  }

  stop(): void {
    this.queueToken += 1;
    void invoke("stop_local_speech").catch((error) =>
      logAudio("stop_error", errorMessage(error)),
    );
  }

  pause(): void {
    this.stop();
  }

  resume(): void {
    logAudio("resume_unavailable", "local Windows speech must be started again");
  }

  async playLocalTestTone(): Promise<void> {
    logAudio("local_test_tone_started");
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 660;
    gain.gain.value = 0.16;
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.25);
    await new Promise<void>((resolve) => {
      oscillator.onended = () => resolve();
    });
    await context.close();
    logAudio("local_test_tone_ended");
  }

  private async playSilentPreRoll(durationMs: number): Promise<void> {
    if (durationMs <= 0) return;
    await new Promise<void>((resolve) => window.setTimeout(resolve, durationMs));
  }

  async speak(text: string, options: SpeechOptions = {}): Promise<void> {
    const cleanedText = String(text ?? "").trim();
    const speaker = options.speaker ?? "OGG";
    const id = `voice-${Date.now()}-${(this.voiceSequence += 1)}`;
    const frontendStartedAt = performance.now();
    if (!cleanedText) throw new Error("OGG hat keinen Text erhalten.");

    const requestedLocale = options.locale
      ?? options.lang
      ?? (speaker === "OGG" ? OGG_VOICE_CONFIG.locale : localStorage.getItem("ogg.language"))
      ?? "de-DE";
    const locale = normalizeVoiceLocale(requestedLocale);
    if (!locale) throw new Error(`Unsupported OGG voice locale: ${requestedLocale}`);
    logDiagnostic("VOICE_FRONTEND_START", { id, speaker, locale, localProcessing: true });
    const profile = speaker === "OGG"
      ? getCrewVoiceProfile(locale, "M1")
      : undefined;
    const requestedVoice = options.voice ?? profile?.baseVoiceName
      ?? (normalizeVoiceLocale(OGG_VOICE_CONFIG.locale) === locale ? OGG_VOICE_CONFIG.voice : undefined);
    const requestedGender = options.voiceGender ?? profile?.gender;
    const availability = await this.getAvailability(locale, requestedVoice, requestedGender);
    if (!availability.available || !availability.voice) {
      logDiagnostic("VOICE_UNAVAILABLE", {
        id,
        speaker,
        locale,
        requestedVoice: requestedVoice ?? null,
        requestedGender: requestedGender ?? null,
        reason: availability.reason,
        localProcessing: true,
      });
      throw new LocalVoiceUnavailableError(locale, availability.reason);
    }

    const rate = options.rate ?? OGG_VOICE_CONFIG.rate;
    const pitch = options.pitch ?? OGG_VOICE_CONFIG.pitch;
    const volume = Math.max(0, Math.min(1, options.volume ?? OGG_VOICE_CONFIG.volume));
    const startedAt = performance.now();
    logDiagnostic("VOICE_CREATED", {
      id,
      speaker,
      voiceId: availability.voice.id,
      voiceName: availability.voice.displayName,
      locale,
      rate,
      pitch,
      volume,
      localProcessing: true,
      text: cleanedText,
      textLength: cleanedText.length,
    });
    logDiagnostic("VOICE_QUEUED", {
      id,
      speaker,
      locale,
      localProcessing: true,
    });

    try {
      await this.playSilentPreRoll(Math.max(0, options.preRollMs ?? 0));
      logAudio("local_tts_started", `locale=${locale} voice=${availability.voice.displayName}`);
      logDiagnostic("VOICE_START", {
        id,
        speaker,
        locale,
        localProcessing: true,
      });
      await invoke("speak_local", {
        request: {
          voiceId: availability.voice.id,
          text: cleanedText,
          rate,
          pitch,
          volume,
        },
      });
      logDiagnostic("VOICE_END", {
        id,
        speaker,
        locale,
        localProcessing: true,
        playbackDurationMs: Math.max(0, Math.round(performance.now() - startedAt)),
      });
      logDiagnostic("VOICE_FRONTEND_END", {
        id,
        speaker,
        locale,
        durationMs: Math.max(0, Math.round(performance.now() - frontendStartedAt)),
        localProcessing: true,
      });
    } catch (error) {
      logDiagnostic("VOICE_ERROR", {
        id,
        speaker,
        locale,
        localProcessing: true,
        error: errorMessage(error),
      });
      logDiagnostic("VOICE_FRONTEND_END", {
        id,
        speaker,
        locale,
        durationMs: Math.max(0, Math.round(performance.now() - frontendStartedAt)),
        error: errorMessage(error),
        localProcessing: true,
      });
      throw error;
    }
  }

  async speakSequence(messages: string[], pauseMs = 0, options: SpeechOptions = {}): Promise<void> {
    this.stop();
    const token = this.queueToken;
    for (let index = 0; index < messages.length; index += 1) {
      if (token !== this.queueToken) return;
      const message = String(messages[index] ?? "").trim();
      if (!message) continue;
      await this.speak(message, options);
      if (index < messages.length - 1) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, pauseMs));
      }
    }
  }
}

export const speechService = new SpeechService();
