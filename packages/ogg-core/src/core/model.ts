export type OggFlightState = "supercruise" | "normalSpace" | "docked" | "landed" | "airborne" | "unknown";

export type CoreCommander = {
  name: string;
  normalizedName: string;
  fid?: string;
};

export type CoreShip = {
  shipType?: string;
  shipId?: number;
  shipName?: string;
  shipIdent?: string;
  fuelCapacity?: number;
  cargoCapacity?: number;
  maxJumpRange?: number;
};

export type CoreSystem = {
  systemName?: string;
  systemAddress?: string;
  starPosition?: readonly [number, number, number];
  jumpDistance?: number;
  fuelUsed?: number;
  fuelLevel?: number;
};

export type CoreSystemScan = {
  systemName?: string;
  systemAddress?: string;
  bodyCount?: number;
  nonBodyCount?: number;
};

export type CoreSignalType = {
  type: string;
  count: number;
};

export type CoreBodySignals = {
  systemAddress?: string;
  bodyId?: number;
  bodyName?: string;
  signalTypes: readonly CoreSignalType[];
};

export type CoreFlightContext = {
  stationName?: string;
  bodyName?: string;
};

export type OggCoreEvent =
  | { type: "CommanderIdentified"; commander: CoreCommander }
  | { type: "ShipStateChanged"; ship: CoreShip }
  | { type: "SystemEntered"; system: CoreSystem }
  | { type: "SystemScanCompleted"; scan: CoreSystemScan }
  | { type: "BodySignalsDetected"; signals: CoreBodySignals }
  | { type: "FlightStateChanged"; flightState: OggFlightState; context?: CoreFlightContext };

export type OggCoreState = {
  commander: CoreCommander | null;
  ship: CoreShip | null;
  system: CoreSystem | null;
  flightState: OggFlightState;
  flightContext: CoreFlightContext | null;
  currentSystemScan: CoreSystemScan | null;
  bodySignals: readonly CoreBodySignals[];
};

export const initialOggCoreState: OggCoreState = {
  commander: null,
  ship: null,
  system: null,
  flightState: "unknown",
  flightContext: null,
  currentSystemScan: null,
  bodySignals: [],
};
