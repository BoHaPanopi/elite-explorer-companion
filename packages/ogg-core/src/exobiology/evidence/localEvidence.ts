import type {
  AnnaAnonymousEnvironmentEvidence,
  AnnaAnonymousEvidenceAggregate,
  AnnaLocalEvidenceStore,
  AnnaPositiveBioObservation,
  AnnaRecordObservationResult,
  AnnaSpeciesEvidenceAggregate,
} from "./model.ts";

const missingVariantKey = "__no_variant__";

export function createAnnaLocalEvidenceStore(): AnnaLocalEvidenceStore {
  return { commanders: {} };
}

export function createAnnaObservationId(observation: Readonly<AnnaPositiveBioObservation>): string {
  return JSON.stringify([
    observation.body.systemAddress,
    observation.body.bodyId,
    observation.speciesId,
    observation.variantId,
  ]);
}

export function hasAnnaObservation(
  store: Readonly<AnnaLocalEvidenceStore>,
  commanderKey: string,
  observation: Readonly<AnnaPositiveBioObservation>,
): boolean {
  return store.commanders[commanderKey]?.observations[createAnnaObservationId(observation)] !== undefined;
}

export function recordAnnaPositiveObservation(
  store: Readonly<AnnaLocalEvidenceStore>,
  commanderKey: string,
  observation: Readonly<AnnaPositiveBioObservation>,
): AnnaRecordObservationResult {
  const observationId = createAnnaObservationId(observation);
  if (hasAnnaObservation(store, commanderKey, observation)) {
    return { store, observationId, duplicate: true };
  }

  const commander = store.commanders[commanderKey] ?? { observations: {} };
  return {
    observationId,
    duplicate: false,
    store: {
      commanders: {
        ...store.commanders,
        [commanderKey]: {
          observations: {
            ...commander.observations,
            [observationId]: copyObservation(observation),
          },
        },
      },
    },
  };
}

export function aggregateAnnaSpeciesEvidence(
  store: Readonly<AnnaLocalEvidenceStore>,
  commanderKey: string,
): AnnaSpeciesEvidenceAggregate[] {
  const observations = Object.values(store.commanders[commanderKey]?.observations ?? {});
  const species = new Map<string, { observationCount: number; variantCounts: Record<string, number> }>();

  for (const observation of observations) {
    const aggregate = species.get(observation.speciesId) ?? { observationCount: 0, variantCounts: {} };
    aggregate.observationCount += 1;
    const variantKey = observation.variantId ?? missingVariantKey;
    aggregate.variantCounts[variantKey] = (aggregate.variantCounts[variantKey] ?? 0) + 1;
    species.set(observation.speciesId, aggregate);
  }

  return [...species.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([speciesId, aggregate]) => ({ speciesId, ...aggregate }));
}

export function createAnnaAnonymousEvidenceAggregate(
  store: Readonly<AnnaLocalEvidenceStore>,
  commanderKey: string,
): AnnaAnonymousEvidenceAggregate {
  const observations = Object.values(store.commanders[commanderKey]?.observations ?? {});
  const speciesAggregates = aggregateAnnaSpeciesEvidence(store, commanderKey);

  return {
    schemaVersion: 1,
    species: speciesAggregates.map((species) => ({
      ...species,
      environments: aggregateEnvironments(
        observations.filter((observation) => observation.speciesId === species.speciesId),
      ),
    })),
  };
}

function copyObservation(observation: Readonly<AnnaPositiveBioObservation>): AnnaPositiveBioObservation {
  return { ...observation, body: { ...observation.body } };
}

function aggregateEnvironments(
  observations: readonly AnnaPositiveBioObservation[],
): AnnaAnonymousEnvironmentEvidence[] {
  const environments = new Map<string, AnnaAnonymousEnvironmentEvidence>();
  for (const observation of observations) {
    const values = [
      observation.bodyType,
      observation.atmosphere,
      observation.surfaceTemperatureKelvin,
      observation.gravityG,
      observation.surfacePressurePascals,
      observation.volcanism,
      observation.biologicalSignalCount,
    ] as const;
    const key = JSON.stringify(values);
    const existing = environments.get(key);
    if (existing) {
      existing.observationCount += 1;
    } else {
      environments.set(key, {
        bodyType: values[0],
        atmosphere: values[1],
        surfaceTemperatureKelvin: values[2],
        gravityG: values[3],
        surfacePressurePascals: values[4],
        volcanism: values[5],
        biologicalSignalCount: values[6],
        observationCount: 1,
      });
    }
  }
  return [...environments.values()];
}
