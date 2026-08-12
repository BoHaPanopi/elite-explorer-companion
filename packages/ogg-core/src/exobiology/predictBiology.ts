import type {
  AnnaBioConditions,
  AnnaBioKnowledgeBase,
  AnnaNumericRange,
} from "./bioKnowledge.ts";
import type { PlanetFssData } from "./planetFssData.ts";
import type { AnnaBioPredictionResult } from "./predictionResult.ts";

export function predictAnnaBiology(
  planet: Readonly<PlanetFssData>,
  knowledgeBase: Readonly<AnnaBioKnowledgeBase>,
): AnnaBioPredictionResult {
  const candidates = new Map(
    knowledgeBase.rules
      .filter((rule) => matchesConditions(planet, rule.conditions))
      .map((rule) => [rule.candidate.id, {
        ...rule.candidate,
        evidenceStatus: rule.evidenceStatus,
        ...(rule.supportingPlanetCount === undefined
          ? {}
          : { supportingPlanetCount: rule.supportingPlanetCount }),
      }]),
  );

  return {
    bodyName: planet.bodyName,
    knowledgeBaseSchemaVersion: knowledgeBase.schemaVersion,
    knowledgeBaseRevision: knowledgeBase.revision,
    candidates: [...candidates.values()],
  };
}

function matchesConditions(
  planet: Readonly<PlanetFssData>,
  conditions: Readonly<AnnaBioConditions>,
): boolean {
  return matchesText(planet.bodyName, conditions.bodyNames)
    && matchesText(planet.bodyType, conditions.bodyTypes)
    && matchesText(planet.atmosphere, conditions.atmospheres)
    && includesAny(planet.atmosphere, conditions.atmosphereIncludesAny)
    && matchesRange(planet.surfaceTemperatureKelvin, conditions.surfaceTemperatureKelvin)
    && matchesRange(planet.gravityG, conditions.gravityG)
    && matchesRange(planet.surfacePressurePascals, conditions.surfacePressurePascals)
    && matchesText(planet.volcanism, conditions.volcanismTypes)
    && includesAny(planet.volcanism, conditions.volcanismIncludesAny)
    && matchesRange(planet.biologicalSignalCount, conditions.biologicalSignalCount);
}

function includesAny(value: string | null, fragments: readonly string[] | undefined): boolean {
  if (fragments === undefined) return true;
  if (value === null) return false;
  const normalizedValue = value.toLocaleLowerCase("en-US");
  return fragments.some((fragment) => normalizedValue.includes(fragment.toLocaleLowerCase("en-US")));
}

function matchesText(value: string | null, allowed: readonly string[] | undefined): boolean {
  return allowed === undefined || (value !== null && allowed.includes(value));
}

function matchesRange(value: number | null, range: AnnaNumericRange | undefined): boolean {
  if (range === undefined) return true;
  if (value === null) return false;
  if (range.minimumInclusive !== undefined && value < range.minimumInclusive) return false;
  return range.maximumInclusive === undefined || value <= range.maximumInclusive;
}
