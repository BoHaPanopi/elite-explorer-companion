import {
  createAnnaLocalEvidenceStore,
  recordAnnaPositiveObservation,
} from "./localEvidence.ts";
import type {
  AnnaLocalEvidenceStore,
  AnnaPositiveBioObservation,
} from "./model.ts";
import { annaBacteriumKnowledgePhase2B } from "../knowledge/annaBacteriumKnowledgePhase2B.ts";
import type { PlanetFssData } from "../planetFssData.ts";
import { predictAnnaBiology } from "../predictBiology.ts";
import type { AnnaBioPredictionResult } from "../predictionResult.ts";

export type AnnaLiveJournalEvent = {
  event: string;
  commander?: string | null;
  name?: string | null;
  systemAddress?: string | number | null;
  bodyId?: number | null;
  body?: number | null;
  bodyName?: string | null;
  planetClass?: string | null;
  atmosphere?: string | null;
  surfaceTemperature?: number | null;
  surfaceGravity?: number | null;
  surfacePressure?: number | null;
  volcanism?: string | null;
  biologicalSignalCount?: number | null;
  species?: string | null;
  variant?: string | null;
};

type AnnaLivePlanetData = Omit<AnnaPositiveBioObservation, "body" | "speciesId" | "variantId"> & {
  bodyName: string | null;
};

export type AnnaLivePrediction = {
  planetKey: string;
  revision: number;
  input: PlanetFssData;
  result: AnnaBioPredictionResult;
};

type AnnaStoredLivePrediction = AnnaLivePrediction & { inputFingerprint: string };

export type AnnaJournalEvidenceState = {
  commanderKey: string | null;
  systemAddress: string | null;
  planets: Readonly<Record<string, AnnaLivePlanetData>>;
  predictions: Readonly<Record<string, AnnaStoredLivePrediction>>;
  predictionRevision: number;
  evidence: AnnaLocalEvidenceStore;
};

export type AnnaCommanderKeyResolver = (commanderName: string) => string;

export function createAnnaJournalEvidenceState(
  evidence: AnnaLocalEvidenceStore = createAnnaLocalEvidenceStore(),
): AnnaJournalEvidenceState {
  return {
    commanderKey: null,
    systemAddress: null,
    planets: {},
    predictions: {},
    predictionRevision: 0,
    evidence,
  };
}

export function applyAnnaLiveJournalEvent(
  state: Readonly<AnnaJournalEvidenceState>,
  event: Readonly<AnnaLiveJournalEvent>,
  resolveCommanderKey: AnnaCommanderKeyResolver,
): AnnaJournalEvidenceState {
  if (event.event === "Commander" || event.event === "LoadGame") {
    const commanderName = event.commander ?? event.name;
    if (typeof commanderName !== "string" || !commanderName.trim()) return state;
    const commanderKey = resolveCommanderKey(commanderName);
    if (commanderKey !== state.commanderKey || event.event === "LoadGame") {
      return { ...state, commanderKey, systemAddress: null, planets: {}, predictions: {} };
    }
    return state;
  }

  if (event.event === "Location" || event.event === "FSDJump") {
    const systemAddress = normalizeSystemAddress(event.systemAddress);
    return systemAddress === null
      ? state
      : {
          ...state,
          systemAddress,
          planets: state.systemAddress === systemAddress ? state.planets : {},
          predictions: state.systemAddress === systemAddress ? state.predictions : {},
        };
  }

  const systemAddress = normalizeSystemAddress(event.systemAddress) ?? state.systemAddress;
  const bodyId = event.event === "ScanOrganic" ? event.body : event.bodyId;
  if (systemAddress === null || typeof bodyId !== "number") return state;
  const planetKey = createAnnaPlanetKey(systemAddress, bodyId);

  if (event.event === "Scan") {
    const existing = state.planets[planetKey] ?? emptyPlanetData();
    return updateAnnaPrediction({
      ...state,
      planets: {
        ...state.planets,
        [planetKey]: {
          ...existing,
          bodyName: event.bodyName ?? existing.bodyName,
          bodyType: event.planetClass ?? existing.bodyType,
          atmosphere: event.atmosphere ?? existing.atmosphere,
          surfaceTemperatureKelvin: event.surfaceTemperature ?? existing.surfaceTemperatureKelvin,
          gravityG: event.surfaceGravity === undefined || event.surfaceGravity === null
            ? existing.gravityG
            : event.surfaceGravity / 9.80665,
          surfacePressurePascals: event.surfacePressure ?? existing.surfacePressurePascals,
          volcanism: event.volcanism ?? existing.volcanism,
        },
      },
    }, planetKey, systemAddress, bodyId);
  }

  if (event.event === "FSSBodySignals" || event.event === "SAASignalsFound") {
    const existing = state.planets[planetKey] ?? emptyPlanetData();
    return updateAnnaPrediction({
      ...state,
      planets: {
        ...state.planets,
        [planetKey]: {
          ...existing,
          bodyName: event.bodyName ?? existing.bodyName,
          biologicalSignalCount: event.biologicalSignalCount ?? existing.biologicalSignalCount,
        },
      },
    }, planetKey, systemAddress, bodyId);
  }

  if (event.event !== "ScanOrganic" || state.commanderKey === null || !event.species) return state;
  const recorded = recordAnnaPositiveObservation(state.evidence, state.commanderKey, {
    body: { systemAddress, bodyId },
    speciesId: event.species,
    variantId: event.variant ?? null,
    ...toObservationEnvironment(state.planets[planetKey] ?? emptyPlanetData()),
  });
  return recorded.store === state.evidence ? state : { ...state, evidence: recorded.store };
}

export function applyAnnaLiveJournalEvents(
  state: Readonly<AnnaJournalEvidenceState>,
  events: readonly AnnaLiveJournalEvent[],
  resolveCommanderKey: AnnaCommanderKeyResolver,
): AnnaJournalEvidenceState {
  return events.reduce(
    (current, event) => applyAnnaLiveJournalEvent(current, event, resolveCommanderKey),
    state,
  );
}

export function createAnnaPlanetKey(systemAddress: string, bodyId: number): string {
  return JSON.stringify([systemAddress, bodyId]);
}

export function getAnnaLivePredictions(
  state: Readonly<AnnaJournalEvidenceState>,
): AnnaLivePrediction[] {
  return Object.values(state.predictions).map((prediction) => ({
    planetKey: prediction.planetKey,
    revision: prediction.revision,
    input: prediction.input,
    result: prediction.result,
  }));
}

function updateAnnaPrediction(
  state: AnnaJournalEvidenceState,
  planetKey: string,
  systemAddress: string,
  bodyId: number,
): AnnaJournalEvidenceState {
  const planet = state.planets[planetKey];
  if (!planet || planet.biologicalSignalCount === null) return state;
  const input: PlanetFssData = {
    bodyName: planet.bodyName ?? `${systemAddress}:${bodyId}`,
    ...toObservationEnvironment(planet),
  };
  const inputFingerprint = JSON.stringify(input);
  if (state.predictions[planetKey]?.inputFingerprint === inputFingerprint) return state;
  const result = planet.biologicalSignalCount === 0
    ? {
        bodyName: input.bodyName,
        knowledgeBaseSchemaVersion: annaBacteriumKnowledgePhase2B.schemaVersion,
        knowledgeBaseRevision: annaBacteriumKnowledgePhase2B.revision,
        candidates: [],
      } satisfies AnnaBioPredictionResult
    : predictAnnaBiology(input, annaBacteriumKnowledgePhase2B);
  const revision = state.predictionRevision + 1;
  return {
    ...state,
    predictionRevision: revision,
    predictions: {
      ...state.predictions,
      [planetKey]: { planetKey, revision, input, result, inputFingerprint },
    },
  };
}

function normalizeSystemAddress(value: string | number | null | undefined): string | null {
  return typeof value === "string" && value ? value : typeof value === "number" ? String(value) : null;
}

function emptyPlanetData(): AnnaLivePlanetData {
  return {
    bodyName: null,
    bodyType: null,
    atmosphere: null,
    surfaceTemperatureKelvin: null,
    gravityG: null,
    surfacePressurePascals: null,
    volcanism: null,
    biologicalSignalCount: null,
  };
}

function toObservationEnvironment(planet: AnnaLivePlanetData) {
  return {
    bodyType: planet.bodyType,
    atmosphere: planet.atmosphere,
    surfaceTemperatureKelvin: planet.surfaceTemperatureKelvin,
    gravityG: planet.gravityG,
    surfacePressurePascals: planet.surfacePressurePascals,
    volcanism: planet.volcanism,
    biologicalSignalCount: planet.biologicalSignalCount,
  };
}
