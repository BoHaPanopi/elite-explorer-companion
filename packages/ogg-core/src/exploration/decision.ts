import type { CoreBodySignals, CoreSystem, OggCoreEvent, OggCoreState } from "../core/model.ts";

export type ExplorationDecision =
  | { kind: "scanIncomplete"; system: CoreSystem | null }
  | {
      kind: "scanCompleted";
      systemName?: string;
      systemAddress?: string;
      bodyCount?: number;
      nonBodyCount?: number;
      observedSignalBodies: number;
    }
  | {
      kind: "bodySignalsDetected";
      systemAddress?: string;
      bodyId?: number;
      bodyName?: string;
      signalTypes: CoreBodySignals["signalTypes"];
    }
  | {
      kind: "biologicalTargetWorthConsidering";
      systemAddress?: string;
      bodyId?: number;
      bodyName?: string;
      biologicalSignalCount: number;
      signalTypes: CoreBodySignals["signalTypes"];
    };

function sameSignals(left: CoreBodySignals | undefined, right: CoreBodySignals): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function bodySignalsForEvent(event: OggCoreEvent): CoreBodySignals | null {
  return event.type === "BodySignalsDetected" ? event.signals : null;
}

function previousSignals(state: Readonly<OggCoreState>, signals: CoreBodySignals): CoreBodySignals | undefined {
  return state.bodySignals.find((current) => current.systemAddress === signals.systemAddress && current.bodyId === signals.bodyId);
}

export function evaluateExploration(
  event: Readonly<OggCoreEvent>,
  previousState: Readonly<OggCoreState>,
  state: Readonly<OggCoreState>,
): ExplorationDecision | null {
  if (event.type === "SystemEntered") return { kind: "scanIncomplete", system: state.system };

  if (event.type === "SystemScanCompleted") {
    const scan = state.currentSystemScan;
    if (!scan || JSON.stringify(previousState.currentSystemScan) === JSON.stringify(scan)) return null;
    return {
      kind: "scanCompleted",
      ...(scan.systemName === undefined ? {} : { systemName: scan.systemName }),
      ...(scan.systemAddress === undefined ? {} : { systemAddress: scan.systemAddress }),
      ...(scan.bodyCount === undefined ? {} : { bodyCount: scan.bodyCount }),
      ...(scan.nonBodyCount === undefined ? {} : { nonBodyCount: scan.nonBodyCount }),
      observedSignalBodies: state.bodySignals.length,
    };
  }

  const signals = bodySignalsForEvent(event);
  if (!signals || sameSignals(previousSignals(previousState, signals), signals)) return null;

  const biologicalSignalCount = signals.signalTypes
    .filter((signal) => signal.type.includes("biological"))
    .reduce((total, signal) => total + signal.count, 0);
  const common = {
    ...(signals.systemAddress === undefined ? {} : { systemAddress: signals.systemAddress }),
    ...(signals.bodyId === undefined ? {} : { bodyId: signals.bodyId }),
    ...(signals.bodyName === undefined ? {} : { bodyName: signals.bodyName }),
    signalTypes: signals.signalTypes,
  };
  return biologicalSignalCount > 0
    ? { kind: "biologicalTargetWorthConsidering", ...common, biologicalSignalCount }
    : { kind: "bodySignalsDetected", ...common };
}
