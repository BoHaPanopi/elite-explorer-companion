export type TelemetryShipState = "supercruise" | "normal_space" | "docked" | "landed";

export type TelemetrySnapshot = {
  system: string | null;
  docked: boolean | null;
  shipState: TelemetryShipState | null;
  stationName: string | null;
  planetName: string | null;
  eliteConnected: boolean;
  currentTelemetryConfirmed: boolean;
};

export type LastKnownTelemetry = Omit<TelemetrySnapshot, "eliteConnected" | "currentTelemetryConfirmed">;

export const LAST_KNOWN_TELEMETRY_KEY = "eec.lastKnownTelemetry";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function hasCurrentTelemetry(snapshot: TelemetrySnapshot | null): boolean {
  return snapshot?.eliteConnected === true
    && snapshot.currentTelemetryConfirmed === true
    && Boolean(snapshot.system);
}

export function updateLastKnownTelemetry(previous: LastKnownTelemetry | null, snapshot: TelemetrySnapshot | null): LastKnownTelemetry | null {
  if (!hasCurrentTelemetry(snapshot)) return previous;
  if (!snapshot) return previous;

  const hasConfirmedShipStatus = snapshot.shipState !== null || snapshot.docked !== null;
  return {
    system: snapshot.system,
    docked: hasConfirmedShipStatus ? snapshot.docked : previous?.docked ?? null,
    shipState: hasConfirmedShipStatus ? snapshot.shipState : previous?.shipState ?? null,
    stationName: snapshot.shipState === "docked" || snapshot.docked === true ? snapshot.stationName : null,
    planetName: snapshot.shipState === "landed" ? snapshot.planetName : null,
  };
}

export function readLastKnownTelemetry(storage: Pick<Storage, "getItem">): LastKnownTelemetry | null {
  try {
    const raw = storage.getItem(LAST_KNOWN_TELEMETRY_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const telemetry = value as Record<string, unknown>;
    return {
      system: typeof telemetry.system === "string" ? telemetry.system : null,
      docked: typeof telemetry.docked === "boolean" ? telemetry.docked : null,
      shipState: isShipState(telemetry.shipState) ? telemetry.shipState : null,
      stationName: typeof telemetry.stationName === "string" ? telemetry.stationName : null,
      planetName: typeof telemetry.planetName === "string" ? telemetry.planetName : null,
    };
  } catch {
    return null;
  }
}

export function persistLastKnownTelemetry(storage: StorageLike, telemetry: LastKnownTelemetry): void {
  storage.setItem(LAST_KNOWN_TELEMETRY_KEY, JSON.stringify(telemetry));
}

export function sameLastKnownTelemetry(left: LastKnownTelemetry | null, right: LastKnownTelemetry | null): boolean {
  return left?.system === right?.system
    && left?.docked === right?.docked
    && left?.shipState === right?.shipState
    && left?.stationName === right?.stationName
    && left?.planetName === right?.planetName;
}

function isShipState(value: unknown): value is TelemetryShipState {
  return value === "supercruise" || value === "normal_space" || value === "docked" || value === "landed";
}
