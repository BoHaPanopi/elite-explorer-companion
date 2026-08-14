import type { AnnaLivePrediction } from "ogg-core";

type SpeechPort = {
  speak(text: string, options: { speaker: string; locale: string }): Promise<void>;
};

export class AnnaLivePredictionAnnouncer {
  private announcedRevisions = new Set<number>();

  async announce(predictions: readonly AnnaLivePrediction[], locale: string, speech: SpeechPort): Promise<number[]> {
    const announced: number[] = [];
    for (const prediction of predictions) {
      if (this.announcedRevisions.has(prediction.revision) || !prediction.result.candidates.length) continue;
      this.announcedRevisions.add(prediction.revision);
      const candidates = prediction.result.candidates.map((candidate) => candidate.displayName).join(", ");
      const text = locale === "en"
        ? `Anna prediction for ${prediction.input.bodyName}: possible biology: ${candidates}.`
        : `Anna-Prognose für ${prediction.input.bodyName}: mögliche Biologie: ${candidates}.`;
      await speech.speak(text, { speaker: "Anna", locale });
      announced.push(prediction.revision);
    }
    return announced;
  }
}
