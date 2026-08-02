export type SpeechOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
};

const DEFAULT_OPTIONS: Required<SpeechOptions> = {
  rate: 0.95,
  pitch: 1,
  volume: 1,
  lang: "de-DE",
};

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  return window.speechSynthesis;
}

function findGermanVoice(voices: SpeechSynthesisVoice[]) {
  return (
    voices.find((voice) => voice.lang.toLowerCase() === "de-de") ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("de")) ??
    null
  );
}

class SpeechService {
  private queueToken = 0;

  isSupported(): boolean {
    return getSpeechSynthesis() !== null;
  }

  stop(): void {
    this.queueToken += 1;
    getSpeechSynthesis()?.cancel();
  }

  pause(): void {
    getSpeechSynthesis()?.pause();
  }

  resume(): void {
    getSpeechSynthesis()?.resume();
  }

  speak(text: string, options: SpeechOptions = {}): Promise<void> {
    const synthesis = getSpeechSynthesis();

    if (!synthesis || !text.trim()) {
      return Promise.resolve();
    }

    const settings = { ...DEFAULT_OPTIONS, ...options };
    const utterance = new SpeechSynthesisUtterance(text.trim());
    const voice = findGermanVoice(synthesis.getVoices());

    utterance.lang = settings.lang;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    if (voice) {
      utterance.voice = voice;
    }

    return new Promise((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);
      synthesis.speak(utterance);
    });
  }

  async speakSequence(
    messages: string[],
    pauseMs = 650,
    options: SpeechOptions = {},
  ): Promise<void> {
    this.stop();
    const token = this.queueToken;

    for (let index = 0; index < messages.length; index += 1) {
      if (token !== this.queueToken) return;
      await this.speak(messages[index], options);

      if (index < messages.length - 1) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, pauseMs));
      }
    }
  }
}

export const speechService = new SpeechService();
