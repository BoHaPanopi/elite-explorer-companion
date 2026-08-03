class TacticalAlarmService {
  private context: AudioContext | null = null;

  async play(): Promise<void> {
    if (!this.context) {
      this.context = new AudioContext();
    }

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    const now = this.context.currentTime;

    this.pulse(now, 0.22);
    this.pulse(now + 0.34, 0.22);
    this.pulse(now + 0.68, 0.3);
  }

  private pulse(start: number, duration: number): void {
    if (!this.context) return;

    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(520, start);
    oscillator.frequency.exponentialRampToValueAtTime(
      330,
      start + duration,
    );

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
      0.16,
      start + 0.025,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      start + duration,
    );

    oscillator.connect(gain);
    gain.connect(this.context.destination);

    oscillator.start(start);
    oscillator.stop(start + duration);
  }
}

export const tacticalAlarmService = new TacticalAlarmService();
