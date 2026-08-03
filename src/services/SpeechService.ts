export type SpeechOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
};

type VoiceHealth = {
  ok: boolean;
  engine?: string;
  voice?: string;
};

const VOICE_SERVER = "http://127.0.0.1:8765";
const DEFAULT_OPTIONS: Required<SpeechOptions> = {
  rate: 0.92,
  pitch: 1,
  volume: 1,
  lang: "de-DE",
};

class SpeechService {
  private queueToken = 0;
  private currentAudio: HTMLAudioElement | null = null;

  async isSupported(): Promise<boolean> {
    try {
      const response = await fetch(`${VOICE_SERVER}/health`, {
        method: "GET",
      });

      if (!response.ok) {
        return false;
      }

      const health = (await response.json()) as VoiceHealth;
      return health.ok === true;
    } catch {
      return false;
    }
  }

  stop(): void {
    this.queueToken += 1;

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio.src = "";
      this.currentAudio = null;
    }
  }

  pause(): void {
    this.currentAudio?.pause();
  }

  resume(): void {
    if (this.currentAudio) {
      void this.currentAudio.play();
    }
  }

  async speak(
    text: string,
    options: SpeechOptions = {},
  ): Promise<void> {
    const cleanedText = text.trim();

    if (!cleanedText) {
      return;
    }

    const settings = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    const response = await fetch(`${VOICE_SERVER}/speak`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: cleanedText,
        rate: settings.rate,
        volume: settings.volume,
        lang: settings.lang,
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `OGG-Sprachserver nicht erreichbar: ${message}`,
      );
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.volume = Math.max(
      0,
      Math.min(1, settings.volume),
    );

    this.currentAudio = audio;

    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        URL.revokeObjectURL(audioUrl);

        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
      };

      audio.onended = () => {
        cleanup();
        resolve();
      };

      audio.onerror = () => {
        cleanup();
        reject(
          new Error("Die OGG-Sprachausgabe konnte nicht abgespielt werden."),
        );
      };

      void audio.play().catch((error) => {
        cleanup();
        reject(error);
      });
    });
  }

  async speakSequence(
    messages: string[],
    pauseMs = 650,
    options: SpeechOptions = {},
  ): Promise<void> {
    this.stop();
    const token = this.queueToken;

    for (
      let index = 0;
      index < messages.length;
      index += 1
    ) {
      if (token !== this.queueToken) {
        return;
      }

      await this.speak(messages[index], options);

      if (index < messages.length - 1) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, pauseMs);
        });
      }
    }
  }
}

export const speechService = new SpeechService();
