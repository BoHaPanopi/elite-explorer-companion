import type {
  AnnaBioCandidateDefinition,
  AnnaEvidenceStatus,
} from "./bioKnowledge.ts";

export type AnnaBioCandidatePrediction = AnnaBioCandidateDefinition & {
  evidenceStatus: AnnaEvidenceStatus;
  supportingPlanetCount?: number;
};

export type AnnaBioPredictionResult = {
  bodyName: string;
  knowledgeBaseSchemaVersion: 1;
  knowledgeBaseRevision: string;
  candidates: readonly AnnaBioCandidatePrediction[];
};
