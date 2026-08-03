export type SpeechOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
};

const VOICE_SERVER = "http://127.0.0.1:8765";

class SpeechService {
  private currentAudio: HTMLAudioElement | null = null;
  private queueToken = 0;

  async isSupported(): Promise<boolean> {
    return true;
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

  async speak(text: string, options: SpeechOptions = {}): Promise<void> {
    const cleanedText = String(text ?? "").trim();

    if (!cleanedText) {
      throw new Error("OGG hat keinen Text erhalten.");
    }

    if (!(await this.serverIsOnline())) {
      throw new Error(
        "OGG-Sprachserver läuft nicht. Bitte START_OGG_STIMME.bat starten.",
      );
    }

    const rate = options.rate ?? 0.92;
    const volume = options.volume ?? 1;

    // V3: Text vollständig als URL-Parameter übertragen.
    // Dadurch umgehen wir den leeren POST-Body der Windows-WebView.
    const url = new URL(`${VOICE_SERVER}/speak`);
    url.searchParams.set("text", cleanedText);
    url.searchParams.set("rate", String(rate));
    url.searchParams.set("volume", String(volume));

    const response = await fetch(url.toString(), {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "audio/mpeg",
      },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`OGG-Spracherzeugung fehlgeschlagen: ${message}`);
    }

    const audioBlob = await response.blob();

    if (!audioBlob.size) {
      throw new Error("Leere Audiodatei erhalten.");
    }

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.volume = Math.max(0, Math.min(1, volume));
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
        reject(new Error("OGG-Audio konnte nicht abgespielt werden."));
      };

      void audio.play().catch((error: unknown) => {
        cleanup();
        reject(
          error instanceof Error
            ? error
            : new Error("OGG-Audio konnte nicht gestartet werden."),
        );
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

    for (let index = 0; index < messages.length; index += 1) {
      if (token !== this.queueToken) {
        return;
      }

      const message = String(messages[index] ?? "").trim();

      if (!message) {
        continue;
      }

      await this.speak(message, options);

      if (index < messages.length - 1) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, pauseMs);
        });
      }
    }
  }
}

export const speechService = new SpeechService();
