import type { CoreBodyExploration, CoreBodySignals, CoreFlightContext, OggCoreEvent, OggCoreState } from "./model.ts";
import { initialOggCoreState } from "./model.ts";

function sameBody(previous: CoreBodySignals, next: CoreBodySignals): boolean {
  return previous.systemAddress === next.systemAddress && previous.bodyId === next.bodyId;
}

function sameExplorationBody(previous: CoreBodyExploration, next: CoreBodyExploration): boolean {
  return previous.systemAddress === next.systemAddress && previous.bodyId === next.bodyId;
}

function normalizedContext(flightState: "supercruise" | "normalSpace" | "docked" | "landed" | "airborne" | "unknown", context: CoreFlightContext | undefined): CoreFlightContext | null {
  if (flightState === "docked") return context?.stationName ? { stationName: context.stationName } : null;
  if (flightState === "landed") return context?.bodyName ? { bodyName: context.bodyName } : null;
  return null;
}

export function reduceCoreState(previousState: OggCoreState = initialOggCoreState, event: OggCoreEvent): OggCoreState {
  switch (event.type) {
    case "CommanderIdentified":
      return { ...previousState, commander: event.commander };
    case "ShipStateChanged":
      return { ...previousState, ship: { ...previousState.ship, ...event.ship } };
    case "SystemEntered":
      return {
        ...previousState,
        system: event.system,
        currentSystemScan: null,
        bodySignals: [],
        bodyExplorations: [],
      };
    case "SystemScanCompleted":
      return { ...previousState, currentSystemScan: event.scan };
    case "BodySignalsDetected": {
      const bodySignals = previousState.bodySignals.filter((current) => !sameBody(current, event.signals));
      return { ...previousState, bodySignals: [...bodySignals, event.signals] };
    }
    case "BodyScanUpdated": {
      const previousBody = previousState.bodyExplorations.find((current) => sameExplorationBody(current, event.body));
      const bodyExplorations = previousState.bodyExplorations.filter((current) => !sameExplorationBody(current, event.body));
      return { ...previousState, bodyExplorations: [...bodyExplorations, { ...previousBody, ...event.body }] };
    }
    case "FlightStateChanged":
      return {
        ...previousState,
        flightState: event.flightState,
        flightContext: normalizedContext(event.flightState, event.context),
      };
  }
}
