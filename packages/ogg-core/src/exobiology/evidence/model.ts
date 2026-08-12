export type AnnaLocalBodyIdentity = {
  systemAddress: string;
  bodyId: number;
};

export type AnnaPositiveBioObservation = {
  body: AnnaLocalBodyIdentity;
  speciesId: string;
  variantId: string | null;
  bodyType: string | null;
  atmosphere: string | null;
  surfaceTemperatureKelvin: number | null;
  gravityG: number | null;
  surfacePressurePascals: number | null;
  volcanism: string | null;
  biologicalSignalCount: number | null;
};

export type AnnaCommanderEvidence = {
  observations: Readonly<Record<string, AnnaPositiveBioObservation>>;
};

export type AnnaLocalEvidenceStore = {
  commanders: Readonly<Record<string, AnnaCommanderEvidence>>;
};

export type AnnaRecordObservationResult = {
  store: AnnaLocalEvidenceStore;
  observationId: string;
  duplicate: boolean;
};

export type AnnaSpeciesEvidenceAggregate = {
  speciesId: string;
  observationCount: number;
  variantCounts: Readonly<Record<string, number>>;
};

export type AnnaAnonymousEnvironmentEvidence = {
  bodyType: string | null;
  atmosphere: string | null;
  surfaceTemperatureKelvin: number | null;
  gravityG: number | null;
  surfacePressurePascals: number | null;
  volcanism: string | null;
  biologicalSignalCount: number | null;
  observationCount: number;
};

export type AnnaAnonymousSpeciesEvidence = AnnaSpeciesEvidenceAggregate & {
  environments: readonly AnnaAnonymousEnvironmentEvidence[];
};

export type AnnaAnonymousEvidenceAggregate = {
  schemaVersion: 1;
  species: readonly AnnaAnonymousSpeciesEvidence[];
};
