import { invoke } from "@tauri-apps/api/core";
import { OGG_VOICE_CONFIG } from "../voices/voiceConfig";

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
};

const VOICE_SERVER = "http://127.0.0.1:8765";

function errorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    return `${error.name}: ${error.message}`;
  }
  return error instanceof Error
    ? `${error.name}: ${error.message}${error.stack ? ` | ${error.stack}` : ""}`
    : String(error);
}

function logAudio(event: string, technical?: string): void {
  void invoke("log_audio_event", {
    event,
    technical: technical ?? null,
  }).catch(() => undefined);
}

function logDiagnostic(kind: string, payload: Record<string, unknown>): void {
  void invoke("log_diagnostic_event", {
    kind,
    payload,
  }).catch(() => undefined);
}

class SpeechService {
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private queueToken = 0;
  private pendingVoices = 0;
  private voiceSequence = 0;

  async isSupported(): Promise<boolean> {
    return true;
  }

  logTestButtonClick(): void {
    logAudio("test_button_clicked");
  }

  private async serverIsOnline(): Promise<boolean> {
    try {
      const response = await fetch(`${VOICE_SERVER}/health`, {
        method: "GET",
        cache: "no-store",
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async waitUntilReady(timeoutMs = 30_000): Promise<boolean> {
    const attempts = Math.max(1, Math.ceil(timeoutMs / 250));
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      if (await this.serverIsOnline()) return true;
      await new Promise<void>((resolve) => window.setTimeout(resolve, 250));
    }
    return false;
  }

  private release(audio: HTMLAudioElement, audioUrl: string): void {
    if (this.currentAudio === audio) this.currentAudio = null;
    if (this.currentAudioUrl === audioUrl) this.currentAudioUrl = null;
    URL.revokeObjectURL(audioUrl);
  }

  stop(): void {
    this.queueToken += 1;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio.removeAttribute("src");
      this.currentAudio.load();
      this.currentAudio = null;
    }
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
  }

  pause(): void {
    this.currentAudio?.pause();
  }

  resume(): void {
    if (this.currentAudio) {
      logAudio("play_called", "resume=true");
      void this.currentAudio.play().then(
        () => logAudio("play_succeeded", "resume=true"),
        (error) => logAudio("error", errorMessage(error)),
      );
    }
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

    const context = new AudioContext();
    const frameCount = Math.max(1, Math.round(context.sampleRate * durationMs / 1000));
    const source = context.createBufferSource();
    source.buffer = context.createBuffer(1, frameCount, context.sampleRate);
    source.connect(context.destination);
    logAudio("silent_pre_roll_started", `durationMs=${durationMs}`);
    source.start();
    await new Promise<void>((resolve) => {
      source.onended = () => resolve();
    });
    await context.close();
    logAudio("silent_pre_roll_ended", `durationMs=${durationMs}`);
  }

  async speak(text: string, options: SpeechOptions = {}): Promise<void> {
    const cleanedText = String(text ?? "").trim();
    const speaker = options.speaker ?? "OGG";
    const voiceId = `voice-${Date.now()}-${(this.voiceSequence += 1)}`;

    if (!cleanedText) {
      logDiagnostic("VOICE_SKIPPED", {
        id: voiceId,
        speaker,
        reason: "empty_text",
      });
      throw new Error("OGG hat keinen Text erhalten.");
    }

    if (!(await this.waitUntilReady())) {
      logDiagnostic("VOICE_ERROR", {
        id: voiceId,
        speaker,
        reason: "voice_server_not_ready",
      });
      throw new Error(
        localStorage.getItem("ogg.language") === "en"
          ? "The OGG voice server could not be started. Please verify the installation."
          : "OGG-Sprachserver konnte nicht gestartet werden. Bitte die Installation überprüfen.",
      );
    }

    const voice = options.voice ?? OGG_VOICE_CONFIG.voice;
    const rate = options.rate ?? OGG_VOICE_CONFIG.rate;
    const pitch = options.pitch ?? OGG_VOICE_CONFIG.pitch;
    const volume = options.volume ?? OGG_VOICE_CONFIG.volume;
    const preRollMs = Math.max(0, options.preRollMs ?? 0);
    const locale = options.locale ?? options.lang ?? localStorage.getItem("ogg.language") ?? "de";

    logDiagnostic("VOICE_CREATED", {
      id: voiceId,
      speaker,
      voice: voice,
      locale,
      rate,
      pitch,
      volume,
      style: options.style ?? null,
      text: cleanedText,
      textLength: cleanedText.length,
    });

    this.pendingVoices += 1;
    const queueLength = this.pendingVoices;
    const queuedAt = performance.now();
    let queueSlotReleased = false;
    let errorAlreadyLogged = false;
    logDiagnostic("VOICE_QUEUED", {
      id: voiceId,
      speaker,
      queueLength,
      voice,
      locale,
      text: cleanedText,
    });

    try {
      const url = new URL(`${VOICE_SERVER}/speak`);
      url.searchParams.set("text", cleanedText);
      url.searchParams.set("voice", voice);
      url.searchParams.set("rate", String(rate));
      url.searchParams.set("pitch", String(pitch));
      url.searchParams.set("volume", String(volume));

      logAudio("tts_request_started", `textLength=${cleanedText.length}`);
      const ttsStartedAt = performance.now();
      const response = await fetch(url.toString(), {
        method: "POST",
        cache: "no-store",
        headers: { Accept: "audio/mpeg" },
      });
      const contentType = response.headers.get("content-type")?.split(";")[0].trim() || "audio/mpeg";
      logAudio("http_status", String(response.status));
      logAudio("mime_type", contentType);

      if (!response.ok) {
        const message = await response.text();
        logAudio("error", `HTTP ${response.status}: ${message}`);
        if (!queueSlotReleased) {
          this.pendingVoices = Math.max(0, this.pendingVoices - 1);
          queueSlotReleased = true;
        }
        logDiagnostic("VOICE_ERROR", {
          id: voiceId,
          speaker,
          voice,
          locale,
          text: cleanedText,
          error: `HTTP ${response.status}: ${message}`,
        });
        errorAlreadyLogged = true;
        throw new Error(`OGG-Spracherzeugung fehlgeschlagen: ${message}`);
      }

      const bytes = await response.arrayBuffer();
      const ttsGenerationMs = Math.max(0, Math.round(performance.now() - ttsStartedAt));
      logAudio("received_bytes", String(bytes.byteLength));
      if (!bytes.byteLength) throw new Error("Leere Audiodatei erhalten.");

      const audioBlob = new Blob([bytes], { type: contentType });
      logAudio("blob_created", `bytes=${audioBlob.size} type=${audioBlob.type}`);
      const audioUrl = URL.createObjectURL(audioBlob);
      logAudio("object_url_created", `scheme=${audioUrl.split(":", 1)[0]}`);

      const audio = new Audio();
      audio.preload = "auto";
      audio.muted = false;
      audio.volume = Math.max(0.01, Math.min(1, volume));
      audio.src = audioUrl;
      this.currentAudio = audio;
      this.currentAudioUrl = audioUrl;
      logAudio("audio_object_created", `muted=${audio.muted} volume=${audio.volume}`);

      await new Promise<void>((resolve, reject) => {
      let settled = false;
      let playbackStartedAt = 0;
      const fail = (error: unknown) => {
        if (settled) return;
        settled = true;
        const message = errorMessage(error);
        logAudio("error", message);
        if (!queueSlotReleased) {
          this.pendingVoices = Math.max(0, this.pendingVoices - 1);
          queueSlotReleased = true;
        }
        logDiagnostic("VOICE_ERROR", {
          id: voiceId,
          speaker,
          voice,
          locale,
          text: cleanedText,
          ttsGenerationMs,
          queueToStartMs: playbackStartedAt > 0 ? Math.max(0, Math.round(playbackStartedAt - queuedAt)) : null,
          error: message,
        });
        errorAlreadyLogged = true;
        this.release(audio, audioUrl);
        reject(error instanceof Error ? error : new Error(message));
      };

      audio.onplaying = () => {
        playbackStartedAt = performance.now();
        logAudio("playing");
        logDiagnostic("VOICE_START", {
          id: voiceId,
          speaker,
          voice,
          locale,
          text: cleanedText,
          queueLength,
          queueToStartMs: Math.max(0, Math.round(playbackStartedAt - queuedAt)),
          ttsGenerationMs,
        });
      };
      audio.onended = () => {
        if (settled) return;
        settled = true;
        logAudio("ended");
        const endedAt = performance.now();
        if (!queueSlotReleased) {
          this.pendingVoices = Math.max(0, this.pendingVoices - 1);
          queueSlotReleased = true;
        }
        logDiagnostic("VOICE_END", {
          id: voiceId,
          speaker,
          voice,
          locale,
          text: cleanedText,
          queueLength,
          queueToStartMs: playbackStartedAt > 0 ? Math.max(0, Math.round(playbackStartedAt - queuedAt)) : null,
          playbackDurationMs: playbackStartedAt > 0 ? Math.max(0, Math.round(endedAt - playbackStartedAt)) : null,
        });
        this.release(audio, audioUrl);
        resolve();
      };
      audio.onerror = () => {
        const mediaError = audio.error;
        fail(new Error(`MediaError code=${mediaError?.code ?? "unknown"} message=${mediaError?.message ?? "unknown"}`));
      };

      audio.load();
      const startPlayback = async () => {
        await this.playSilentPreRoll(preRollMs);
        logAudio("play_called");
        await audio.play();
        logAudio("play_succeeded");
      };
      void startPlayback().catch(fail);
      });
    } catch (error) {
      if (!queueSlotReleased) {
        this.pendingVoices = Math.max(0, this.pendingVoices - 1);
        queueSlotReleased = true;
      }
      if (!errorAlreadyLogged) {
        const message = errorMessage(error);
        logDiagnostic("VOICE_ERROR", {
          id: voiceId,
          speaker,
          voice,
          locale,
          text: cleanedText,
          error: message,
        });
      }
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
