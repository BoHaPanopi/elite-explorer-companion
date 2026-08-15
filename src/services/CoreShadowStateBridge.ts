import {
  adaptEliteJournalEvent,
  CoreStateStore,
  evaluateExploration,
  type EliteJournalFact,
  type ExplorationDecision,
  type OggCoreEvent,
  type OggCoreState,
} from "ogg-core";

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

  getState(): Readonly<OggCoreState> {
    return this.store.getState();
  }
}
