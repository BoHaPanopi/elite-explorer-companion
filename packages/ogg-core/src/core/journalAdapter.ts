import type { CoreBodySignals, CoreFlightContext, CoreShip, CoreSystem, CoreSystemScan, OggCoreEvent, OggFlightState } from "./model.ts";

export type EliteJournalFact = Readonly<Record<string, unknown>>;

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function address(value: unknown): string | undefined {
  return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}

function optionalField<T>(value: T | undefined, key: string): Partial<Record<string, T>> {
  return value === undefined ? {} : { [key]: value };
}

function shipFrom(event: EliteJournalFact): CoreShip {
  const fuelCapacity = event.FuelCapacity && typeof event.FuelCapacity === "object"
    ? finiteNumber((event.FuelCapacity as Record<string, unknown>).Main)
    : undefined;
  return {
    ...optionalField(nonEmptyString(event.Ship), "shipType"),
    ...optionalField(finiteNumber(event.ShipID), "shipId"),
    ...optionalField(nonEmptyString(event.ShipName), "shipName"),
    ...optionalField(nonEmptyString(event.ShipIdent), "shipIdent"),
    ...optionalField(fuelCapacity, "fuelCapacity"),
    ...optionalField(finiteNumber(event.CargoCapacity), "cargoCapacity"),
    ...optionalField(finiteNumber(event.MaxJumpRange), "maxJumpRange"),
  };
}

function systemFrom(event: EliteJournalFact): CoreSystem {
  const starPosition = Array.isArray(event.StarPos) && event.StarPos.length === 3 && event.StarPos.every((value) => finiteNumber(value) !== undefined)
    ? event.StarPos as [number, number, number]
    : undefined;
  const fuelLevel = event.FuelLevel && typeof event.FuelLevel === "object"
    ? finiteNumber((event.FuelLevel as Record<string, unknown>).FuelMain)
    : finiteNumber(event.FuelLevel);
  return {
    ...optionalField(nonEmptyString(event.StarSystem), "systemName"),
    ...optionalField(address(event.SystemAddress), "systemAddress"),
    ...optionalField(starPosition, "starPosition"),
    ...optionalField(finiteNumber(event.JumpDist), "jumpDistance"),
    ...optionalField(finiteNumber(event.FuelUsed), "fuelUsed"),
    ...optionalField(fuelLevel, "fuelLevel"),
  };
}

function scanFrom(event: EliteJournalFact): CoreSystemScan {
  return {
    ...optionalField(nonEmptyString(event.StarSystem), "systemName"),
    ...optionalField(address(event.SystemAddress), "systemAddress"),
    ...optionalField(finiteNumber(event.BodyCount), "bodyCount"),
    ...optionalField(finiteNumber(event.NonBodyCount), "nonBodyCount"),
  };
}

function signalsFrom(event: EliteJournalFact): CoreBodySignals {
  const signalTypes = Array.isArray(event.Signals)
    ? event.Signals.flatMap((signal) => {
      if (!signal || typeof signal !== "object") return [];
      const source = signal as Record<string, unknown>;
      const type = nonEmptyString(source.Type)?.toLocaleLowerCase("en-US");
      const count = finiteNumber(source.Count);
      return type && count !== undefined ? [{ type, count }] : [];
    })
    : [];
  return {
    ...optionalField(address(event.SystemAddress), "systemAddress"),
    ...optionalField(finiteNumber(event.BodyID), "bodyId"),
    ...optionalField(nonEmptyString(event.BodyName), "bodyName"),
    signalTypes,
  };
}

function flightEvent(flightState: OggFlightState, context?: CoreFlightContext): OggCoreEvent {
  return { type: "FlightStateChanged", flightState, ...(context ? { context } : {}) };
}

export function adaptEliteJournalEvent(event: EliteJournalFact): readonly OggCoreEvent[] {
  const eventName = nonEmptyString(event.event);
  if (!eventName) return [];

  if (eventName === "Commander" || eventName === "LoadGame") {
    const name = nonEmptyString(eventName === "Commander" ? event.Name : event.Commander ?? event.Name);
    const commander = name ? [{ type: "CommanderIdentified" as const, commander: { name, normalizedName: name.toLocaleLowerCase("en-US"), ...optionalField(nonEmptyString(event.FID), "fid") } }] : [];
    if (eventName === "Commander") return commander;
    const ship = shipFrom(event);
    return [...commander, ...(Object.keys(ship).length ? [{ type: "ShipStateChanged" as const, ship }] : [])];
  }

  if (eventName === "Loadout") {
    const ship = shipFrom(event);
    return Object.keys(ship).length ? [{ type: "ShipStateChanged", ship }] : [];
  }
  if (eventName === "FSDJump" || eventName === "CarrierJump") return [{ type: "SystemEntered", system: systemFrom(event) }];
  if (eventName === "FSSDiscoveryScan") return finiteNumber(event.Progress) === 1 ? [{ type: "SystemScanCompleted", scan: scanFrom(event) }] : [];
  if (eventName === "FSSBodySignals") return [{ type: "BodySignalsDetected", signals: signalsFrom(event) }];
  if (eventName === "SupercruiseEntry") return [flightEvent("supercruise")];
  if (eventName === "SupercruiseExit" || eventName === "Undocked") return [flightEvent("normalSpace")];
  if (eventName === "Docked") return [flightEvent("docked", { ...optionalField(nonEmptyString(event.StationName), "stationName") })];
  if (eventName === "Touchdown") return [flightEvent("landed", { ...optionalField(nonEmptyString(event.Body), "bodyName") })];
  if (eventName === "Liftoff") return [flightEvent("airborne")];
  if (eventName === "Location" && event.Docked === true) return [flightEvent("docked", { ...optionalField(nonEmptyString(event.StationName), "stationName") })];
  if (eventName === "Location" && event.Docked === false) return [flightEvent("normalSpace")];
  return [];
}
