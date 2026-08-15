import {
  adaptEliteJournalEvent,
  annaBacteriumKnowledgePhase2B,
  CoreStateStore,
  evaluateExobio,
  evaluatePrediction,
  evaluateExploration,
  type EliteJournalFact,
  type ExobioDecision,
  type ExplorationDecision,
  type OggCoreEvent,
  type OggCoreState,
  type PredictionDecision,
} from "ogg-core";

export type CoreShadowRuntimeResult = {
  explorationDecisions: readonly ExplorationDecision[];
  exobioDecisions: readonly ExobioDecision[];
  predictionDecisions: readonly PredictionDecision[];
};

export class CoreShadowStateBridge {
  private readonly store: CoreStateStore;

  constructor(store: CoreStateStore = new CoreStateStore()) {
    this.store = store;
  }

  ingest(event: EliteJournalFact): readonly OggCoreEvent[] {
    const coreEvents = adaptEliteJournalEvent(event);
    for (const coreEvent of coreEvents) this.store.dispatch(coreEvent);
    return coreEvents;
  }

  ingestExplorationDecisions(event: EliteJournalFact): readonly ExplorationDecision[] {
    const decisions: ExplorationDecision[] = [];
    for (const coreEvent of adaptEliteJournalEvent(event)) {
      const previous = this.store.getState();
      const state = this.store.dispatch(coreEvent);
      const decision = evaluateExploration(coreEvent, previous, state);
      if (decision) decisions.push(decision);
    }
    return decisions;
  }

  ingestRuntimeDecisions(
    event: EliteJournalFact,
  ): CoreShadowRuntimeResult {
    const explorationDecisions: ExplorationDecision[] = [];
    const exobioDecisions: ExobioDecision[] = [];
    const predictionDecisions: PredictionDecision[] = [];
    for (const coreEvent of adaptEliteJournalEvent(event)) {
      const previous = this.store.getState();
      const state = this.store.dispatch(coreEvent);
      const explorationDecision = evaluateExploration(coreEvent, previous, state);
      if (explorationDecision) explorationDecisions.push(explorationDecision);
      exobioDecisions.push(...evaluateExobio(coreEvent, previous, state));
      if (coreEvent.type.startsWith("Prediction")) {
        const body = state.predictionBodies.at(-1);
        const decision = body ? evaluatePrediction(body, annaBacteriumKnowledgePhase2B) : null;
        if (decision) predictionDecisions.push(decision);
      }
    }
    return { explorationDecisions, exobioDecisions, predictionDecisions };
  }

  getState(): Readonly<OggCoreState> {
    return this.store.getState();
  }

}
