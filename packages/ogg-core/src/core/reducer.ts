import type { CoreBodyExploration, CoreBodySignals, CoreExobioBodyContext, CoreExobioObservation, CoreFlightContext, CorePredictionBodyFacts, OggCoreEvent, OggCoreState } from "./model.ts";
import { initialOggCoreState } from "./model.ts";

function sameBody(previous: CoreBodySignals, next: CoreBodySignals): boolean {
  return previous.systemAddress === next.systemAddress && previous.bodyId === next.bodyId;
}

function sameExplorationBody(previous: CoreBodyExploration, next: CoreBodyExploration): boolean {
  return previous.systemAddress === next.systemAddress && previous.bodyId === next.bodyId;
}

function sameExobioBody(previous: CoreExobioBodyContext, next: { systemAddress: string; bodyId: number }): boolean {
  return previous.systemAddress === next.systemAddress && previous.bodyId === next.bodyId;
}

function sameExobioObservation(previous: CoreExobioObservation, next: Pick<CoreExobioObservation, "genus" | "species" | "variant">): boolean {
  return previous.genus === next.genus && previous.species === next.species && previous.variant === next.variant;
}

function samePredictionBody(previous: CorePredictionBodyFacts, next: { systemAddress: string; bodyId: number }): boolean {
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
        activeExobioContext: null,
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
    case "ExobioGenusesConfirmed": {
      const previousBody = previousState.exobioBodies.find((current) => sameExobioBody(current, event.body));
      const body: CoreExobioBodyContext = {
        systemAddress: event.body.systemAddress,
        bodyId: event.body.bodyId,
        ...(event.body.bodyName === undefined ? {} : { bodyName: event.body.bodyName }),
        confirmedGenuses: [...new Set([...(previousBody?.confirmedGenuses ?? []), ...event.genuses])],
        observations: previousBody?.observations ?? [],
      };
      return {
        ...previousState,
        exobioBodies: [...previousState.exobioBodies.filter((current) => !sameExobioBody(current, event.body)), body],
        activeExobioContext: event.body,
      };
    }
    case "ExobioScanObserved": {
      const previousBody = previousState.exobioBodies.find((current) => sameExobioBody(current, event.body));
      const previousObservation = previousBody?.observations.find((current) => sameExobioObservation(current, event.observation));
      const observation: CoreExobioObservation = {
        genus: event.observation.genus,
        species: event.observation.species,
        variant: event.observation.variant,
        observedScanTypes: [...(previousObservation?.observedScanTypes ?? []), event.observation.scanType],
        completion: event.observation.scanType === "Analyse" ? "completed" : previousObservation?.completion ?? "inProgress",
      };
      const body: CoreExobioBodyContext = {
        systemAddress: event.body.systemAddress,
        bodyId: event.body.bodyId,
        ...(event.body.bodyName === undefined ? {} : { bodyName: event.body.bodyName }),
        confirmedGenuses: previousBody?.confirmedGenuses ?? [],
        observations: [...(previousBody?.observations.filter((current) => !sameExobioObservation(current, event.observation)) ?? []), observation],
      };
      return {
        ...previousState,
        exobioBodies: [...previousState.exobioBodies.filter((current) => !sameExobioBody(current, event.body)), body],
        activeExobioContext: event.body,
      };
    }
    case "PredictionPlanetFactsUpdated": {
      const previousBody = previousState.predictionBodies.find((current) => samePredictionBody(current, event.facts));
      const body = { ...previousBody, ...event.facts };
      return {
        ...previousState,
        predictionBodies: [...previousState.predictionBodies.filter((current) => !samePredictionBody(current, event.facts)), body],
      };
    }
    case "PredictionBiologicalSignalCountConfirmed": {
      const previousBody = previousState.predictionBodies.find((current) => samePredictionBody(current, event.body));
      const body: CorePredictionBodyFacts = {
        ...previousBody,
        ...event.body,
        biologicalSignalCount: event.biologicalSignalCount,
      };
      return {
        ...previousState,
        predictionBodies: [...previousState.predictionBodies.filter((current) => !samePredictionBody(current, event.body)), body],
      };
    }
    case "FlightStateChanged":
      return {
        ...previousState,
        flightState: event.flightState,
        flightContext: normalizedContext(event.flightState, event.context),
      };
  }
}
