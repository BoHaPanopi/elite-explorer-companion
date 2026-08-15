import type { CorePredictionBodyFacts } from "../core/model.ts";

export type PredictionCandidate = {
  id: string;
  displayName: string;
  evidenceStatus: string;
  supportingPlanetCount?: number;
};

export type PredictionNumericRange = {
  minimumInclusive?: number;
  maximumInclusive?: number;
};

export type PredictionConditions = {
  bodyNames?: readonly string[];
  bodyTypes?: readonly string[];
  atmospheres?: readonly string[];
  atmosphereIncludesAny?: readonly string[];
  surfaceTemperatureKelvin?: PredictionNumericRange;
  gravityG?: PredictionNumericRange;
  surfacePressurePascals?: PredictionNumericRange;
  volcanismTypes?: readonly string[];
  volcanismIncludesAny?: readonly string[];
  biologicalSignalCount?: PredictionNumericRange;
};

export type PredictionKnowledgeBase = {
  schemaVersion: number;
  revision: string;
  rules: readonly {
    candidate: Pick<PredictionCandidate, "id" | "displayName">;
    evidenceStatus: string;
    supportingPlanetCount?: number;
    conditions: PredictionConditions;
  }[];
};

export type PredictionDecision =
  | {
      kind: "predictionUpdated";
      body: Pick<CorePredictionBodyFacts, "systemAddress" | "bodyId" | "bodyName">;
      inputFingerprint: string;
      knowledgeBase: { schemaVersion: number; revision: string };
      candidates: readonly PredictionCandidate[];
    }
  | {
      kind: "noCandidate";
      body: Pick<CorePredictionBodyFacts, "systemAddress" | "bodyId" | "bodyName">;
      inputFingerprint: string;
      knowledgeBase: { schemaVersion: number; revision: string };
    };

function matchesText(value: string | undefined, allowed: readonly string[] | undefined): boolean {
  return allowed === undefined || (value !== undefined && allowed.includes(value));
}

function includesAny(value: string | undefined, fragments: readonly string[] | undefined): boolean {
  return fragments === undefined || (value !== undefined && fragments.some((fragment) => value.toLocaleLowerCase("en-US").includes(fragment.toLocaleLowerCase("en-US"))));
}

function matchesRange(value: number | undefined, range: PredictionNumericRange | undefined): boolean {
  if (range === undefined) return true;
  if (value === undefined) return false;
  if (range.minimumInclusive !== undefined && value < range.minimumInclusive) return false;
  return range.maximumInclusive === undefined || value <= range.maximumInclusive;
}

function matches(body: Readonly<CorePredictionBodyFacts>, conditions: Readonly<PredictionConditions>): boolean {
  return matchesText(body.bodyName, conditions.bodyNames)
    && matchesText(body.planetClass, conditions.bodyTypes)
    && matchesText(body.atmosphere, conditions.atmospheres)
    && includesAny(body.atmosphere, conditions.atmosphereIncludesAny)
    && matchesRange(body.surfaceTemperatureKelvin, conditions.surfaceTemperatureKelvin)
    && matchesRange(body.gravityG, conditions.gravityG)
    && matchesRange(body.surfacePressurePascals, conditions.surfacePressurePascals)
    && matchesText(body.volcanism, conditions.volcanismTypes)
    && includesAny(body.volcanism, conditions.volcanismIncludesAny)
    && matchesRange(body.biologicalSignalCount, conditions.biologicalSignalCount);
}

export function evaluatePrediction(
  body: Readonly<CorePredictionBodyFacts>,
  knowledgeBase: Readonly<PredictionKnowledgeBase>,
): PredictionDecision | null {
  if (body.biologicalSignalCount === undefined) return null;
  const inputFingerprint = JSON.stringify(body);
  const bodyReference = {
    systemAddress: body.systemAddress,
    bodyId: body.bodyId,
    ...(body.bodyName === undefined ? {} : { bodyName: body.bodyName }),
  };
  const metadata = { schemaVersion: knowledgeBase.schemaVersion, revision: knowledgeBase.revision };
  if (body.biologicalSignalCount === 0) return { kind: "noCandidate", body: bodyReference, inputFingerprint, knowledgeBase: metadata };
  const candidates = [...new Map(
    knowledgeBase.rules
      .filter((rule) => matches(body, rule.conditions))
      .map((rule) => [rule.candidate.id, {
        ...rule.candidate,
        evidenceStatus: rule.evidenceStatus,
        ...(rule.supportingPlanetCount === undefined ? {} : { supportingPlanetCount: rule.supportingPlanetCount }),
      }]),
  ).values()];
  return candidates.length > 0
    ? { kind: "predictionUpdated", body: bodyReference, inputFingerprint, knowledgeBase: metadata, candidates }
    : { kind: "noCandidate", body: bodyReference, inputFingerprint, knowledgeBase: metadata };
}
