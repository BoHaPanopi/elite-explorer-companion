import {
  adaptEliteJournalEvent,
  CoreStateStore,
  type EliteJournalFact,
  type OggCoreEvent,
  type OggCoreState,
} from "ogg-core";

export type CoreShadowRuntimeState = {
  system?: string | null;
  flightState?: string | null;
  systemScanCompleted?: boolean | null;
  bodySignalsDetected?: boolean | null;
};

export type CoreStateMismatch = {
  area: "system" | "flightState" | "systemScan" | "bodySignals";
  runtimeValue: unknown;
  coreValue: unknown;
  sourceEvent: string;
};

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function compareCoreShadowState(runtime: CoreShadowRuntimeState, core: Readonly<OggCoreState>, sourceEvent: string): readonly CoreStateMismatch[] {
  const comparisons: ReadonlyArray<[CoreStateMismatch["area"], unknown, unknown]> = [
    ["system", runtime.system, core.system?.systemName ?? null],
    ["flightState", runtime.flightState, core.flightState],
    ["systemScan", runtime.systemScanCompleted, core.currentSystemScan !== null],
    ["bodySignals", runtime.bodySignalsDetected, core.bodySignals.length > 0],
  ];
  return comparisons
    .filter(([, runtimeValue]) => runtimeValue !== undefined && runtimeValue !== null)
    .flatMap(([area, runtimeValue, coreValue]) => sameValue(runtimeValue, coreValue) ? [] : [{ area, runtimeValue, coreValue, sourceEvent }]);
}

export class CoreShadowStateBridge {
  private lastMismatchFingerprint = "";
  private readonly store: CoreStateStore;
  private readonly onMismatch?: (mismatch: CoreStateMismatch) => void;

  constructor(
    store: CoreStateStore = new CoreStateStore(),
    onMismatch?: (mismatch: CoreStateMismatch) => void,
  ) {
    this.store = store;
    this.onMismatch = onMismatch;
  }

  ingest(event: EliteJournalFact): readonly OggCoreEvent[] {
    const coreEvents = adaptEliteJournalEvent(event);
    for (const coreEvent of coreEvents) this.store.dispatch(coreEvent);
    return coreEvents;
  }

  compare(runtime: CoreShadowRuntimeState, sourceEvent: string): readonly CoreStateMismatch[] {
    const mismatches = compareCoreShadowState(runtime, this.store.getState(), sourceEvent);
    const fingerprint = JSON.stringify(mismatches);
    if (fingerprint !== this.lastMismatchFingerprint) {
      this.lastMismatchFingerprint = fingerprint;
      for (const mismatch of mismatches) this.onMismatch?.(mismatch);
    }
    return mismatches;
  }

  getState(): Readonly<OggCoreState> {
    return this.store.getState();
  }
}
