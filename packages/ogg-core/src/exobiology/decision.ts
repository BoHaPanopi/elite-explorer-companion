import type {
  CoreExobioActiveContext,
  CoreExobioBodyContext,
  CoreExobioObservation,
  OggCoreEvent,
  OggCoreState,
} from "../core/model.ts";

export type ExobioOrganism = Pick<CoreExobioObservation, "genus" | "species" | "variant">;

export type ExobioDecision =
  | { kind: "genusConfirmed"; body: CoreExobioActiveContext; genus: string }
  | {
      kind: "organismObserved";
      body: CoreExobioActiveContext;
      organism: ExobioOrganism;
      scanType: string;
      observedScanTypes: readonly string[];
    }
  | {
      kind: "sampleInProgress";
      body: CoreExobioActiveContext;
      organism: ExobioOrganism;
      observedScanTypes: readonly string[];
    }
  | {
      kind: "organismCompleted";
      body: CoreExobioActiveContext;
      organism: ExobioOrganism;
      observedScanTypes: readonly string[];
    };

function sameBody(current: CoreExobioBodyContext, body: CoreExobioActiveContext): boolean {
  return current.systemAddress === body.systemAddress && current.bodyId === body.bodyId;
}

function sameOrganism(current: CoreExobioObservation, organism: ExobioOrganism): boolean {
  return current.genus === organism.genus
    && current.species === organism.species
    && current.variant === organism.variant;
}

function bodyFor(state: Readonly<OggCoreState>, body: CoreExobioActiveContext): CoreExobioBodyContext | undefined {
  return state.exobioBodies.find((current) => sameBody(current, body));
}

function observationFor(
  state: Readonly<OggCoreState>,
  body: CoreExobioActiveContext,
  organism: ExobioOrganism,
): CoreExobioObservation | undefined {
  return bodyFor(state, body)?.observations.find((current) => sameOrganism(current, organism));
}

export function evaluateExobio(
  event: Readonly<OggCoreEvent>,
  previousState: Readonly<OggCoreState>,
  state: Readonly<OggCoreState>,
): readonly ExobioDecision[] {
  if (event.type === "ExobioGenusesConfirmed") {
    const previousGenuses = new Set(bodyFor(previousState, event.body)?.confirmedGenuses ?? []);
    const currentGenuses = bodyFor(state, event.body)?.confirmedGenuses ?? [];
    return currentGenuses
      .filter((genus) => event.genuses.includes(genus) && !previousGenuses.has(genus))
      .map((genus) => ({ kind: "genusConfirmed", body: event.body, genus }));
  }

  if (event.type !== "ExobioScanObserved") return [];
  const { genus, species, variant } = event.observation;
  const organism: ExobioOrganism = { genus, species, variant };
  const observation = observationFor(state, event.body, organism);
  const previousObservation = observationFor(previousState, event.body, organism);
  if (!observation || JSON.stringify(previousObservation) === JSON.stringify(observation)) return [];

  const common = {
    body: event.body,
    organism,
    observedScanTypes: observation.observedScanTypes,
  };
  return [
    { kind: "organismObserved", ...common, scanType: event.observation.scanType },
    observation.completion === "completed"
      ? { kind: "organismCompleted", ...common }
      : { kind: "sampleInProgress", ...common },
  ];
}
