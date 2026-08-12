import {
  applyAnnaLiveJournalEvents,
  aggregateAnnaSpeciesEvidence,
  createAnnaAnonymousEvidenceAggregate,
  createAnnaJournalEvidenceState,
  createAnnaLocalEvidenceStore,
  createAnnaObservationId,
  getAnnaLivePredictions,
  type AnnaJournalEvidenceState,
  type AnnaAnonymousEvidenceAggregate,
  type AnnaLivePrediction,
  type AnnaLiveJournalEvent,
  type AnnaLocalEvidenceStore,
  type AnnaPositiveBioObservation,
  type AnnaSpeciesEvidenceAggregate,
} from "ogg-core";

const evidenceStorageKey = "ogg.annaEvidence.local.v1";
const installationSaltStorageKey = "ogg.annaEvidence.installationSalt.v1";

export class AnnaEvidenceService {
  private state: AnnaJournalEvidenceState;
  private readonly commanderKeys = new Map<string, string>();
  private readonly storage: Pick<Storage, "getItem" | "setItem">;

  constructor(storage: Pick<Storage, "getItem" | "setItem">) {
    this.storage = storage;
    this.state = createAnnaJournalEvidenceState(loadEvidence(storage));
  }

  process(events: readonly AnnaLiveJournalEvent[]): void {
    const next = applyAnnaLiveJournalEvents(
      this.state,
      events,
      (name) => this.localCommanderKey(name),
    );
    if (next.evidence !== this.state.evidence) {
      this.storage.setItem(evidenceStorageKey, JSON.stringify(next.evidence));
    }
    this.state = next;
  }

  evidence(): AnnaLocalEvidenceStore {
    return this.state.evidence;
  }

  currentCommanderKey(): string | null {
    return this.state.commanderKey;
  }

  currentSpeciesEvidence(): AnnaSpeciesEvidenceAggregate[] {
    return this.state.commanderKey === null
      ? []
      : aggregateAnnaSpeciesEvidence(this.state.evidence, this.state.commanderKey);
  }

  currentAnonymousAggregate(): AnnaAnonymousEvidenceAggregate {
    return this.state.commanderKey === null
      ? { schemaVersion: 1, species: [] }
      : createAnnaAnonymousEvidenceAggregate(this.state.evidence, this.state.commanderKey);
  }

  predictions(): AnnaLivePrediction[] {
    return getAnnaLivePredictions(this.state);
  }

  private localCommanderKey(name: string): string {
    const normalized = name.trim().toLocaleLowerCase("en-US");
    const cached = this.commanderKeys.get(normalized);
    if (cached) return cached;
    const salt = loadOrCreateInstallationSalt(this.storage);
    const key = `local-${hashLocalIdentity(`${salt}\0${normalized}`)}`;
    this.commanderKeys.set(normalized, key);
    return key;
  }
}

function loadEvidence(storage: Pick<Storage, "getItem">): AnnaLocalEvidenceStore {
  const serialized = storage.getItem(evidenceStorageKey);
  if (!serialized) return createAnnaLocalEvidenceStore();
  try {
    return parseEvidenceStore(JSON.parse(serialized));
  } catch {
    return createAnnaLocalEvidenceStore();
  }
}

function parseEvidenceStore(value: unknown): AnnaLocalEvidenceStore {
  if (!isRecord(value) || !isRecord(value.commanders)) return createAnnaLocalEvidenceStore();
  const commanders: Record<string, { observations: Record<string, AnnaPositiveBioObservation> }> = {};
  for (const [commanderKey, commander] of Object.entries(value.commanders)) {
    if (!commanderKey || !isRecord(commander) || !isRecord(commander.observations)) continue;
    const observations: Record<string, AnnaPositiveBioObservation> = {};
    for (const [observationId, observation] of Object.entries(commander.observations)) {
      if (isPositiveObservation(observation) && createAnnaObservationId(observation) === observationId) {
        observations[observationId] = observation;
      }
    }
    commanders[commanderKey] = { observations };
  }
  return { commanders };
}

function isPositiveObservation(value: unknown): value is AnnaPositiveBioObservation {
  if (!isRecord(value) || !isRecord(value.body)) return false;
  return typeof value.body.systemAddress === "string"
    && typeof value.body.bodyId === "number"
    && typeof value.speciesId === "string"
    && isNullableString(value.variantId)
    && isNullableString(value.bodyType)
    && isNullableString(value.atmosphere)
    && isNullableNumber(value.surfaceTemperatureKelvin)
    && isNullableNumber(value.gravityG)
    && isNullableNumber(value.surfacePressurePascals)
    && isNullableString(value.volcanism)
    && isNullableNumber(value.biologicalSignalCount);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function loadOrCreateInstallationSalt(storage: Pick<Storage, "getItem" | "setItem">): string {
  const existing = storage.getItem(installationSaltStorageKey);
  if (existing) return existing;
  const bytes = new Uint32Array(4);
  crypto.getRandomValues(bytes);
  const salt = [...bytes].map((value) => value.toString(16).padStart(8, "0")).join("");
  storage.setItem(installationSaltStorageKey, salt);
  return salt;
}

function hashLocalIdentity(value: string): string {
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    first = Math.imul(first ^ code, 0x01000193);
    second = Math.imul(second ^ code, 0x85ebca6b);
  }
  return `${(first >>> 0).toString(16).padStart(8, "0")}${(second >>> 0).toString(16).padStart(8, "0")}`;
}

export {
  evidenceStorageKey as annaEvidenceStorageKey,
  installationSaltStorageKey as annaInstallationSaltStorageKey,
};
