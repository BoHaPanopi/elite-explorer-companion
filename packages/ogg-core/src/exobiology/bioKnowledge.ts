export type AnnaBioCandidateDefinition = {
  id: string;
  displayName: string;
};

export type AnnaEvidenceStatus =
  | "confirmed-rule"
  | "positive-observation"
  | "insufficient-data";

export type AnnaNumericRange = {
  minimumInclusive?: number;
  maximumInclusive?: number;
};

export type AnnaBioConditions = {
  bodyNames?: readonly string[];
  bodyTypes?: readonly string[];
  atmospheres?: readonly string[];
  atmosphereIncludesAny?: readonly string[];
  surfaceTemperatureKelvin?: AnnaNumericRange;
  gravityG?: AnnaNumericRange;
  surfacePressurePascals?: AnnaNumericRange;
  volcanismTypes?: readonly string[];
  volcanismIncludesAny?: readonly string[];
  biologicalSignalCount?: AnnaNumericRange;
};

export type AnnaBioRule = {
  id: string;
  candidate: AnnaBioCandidateDefinition;
  evidenceStatus: AnnaEvidenceStatus;
  supportingPlanetCount?: number;
  conditions: AnnaBioConditions;
};

export type AnnaBioKnowledgeBase = {
  schemaVersion: 1;
  revision: string;
  rules: readonly AnnaBioRule[];
};
