import {
  adaptEliteJournalEvent,
  CoreStateStore,
  type EliteJournalFact,
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

  getState(): Readonly<OggCoreState> {
    return this.store.getState();
  }
}
