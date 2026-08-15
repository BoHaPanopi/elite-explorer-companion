import {
  adaptEliteJournalEvent,
  annaBacteriumKnowledgePhase2B,
  CoreStateStore,
  evaluatePrediction,
  evaluateExploration,
  type AnnaLivePrediction,
  type CorePredictionBodyFacts,
  type EliteJournalFact,
  type ExplorationDecision,
  type OggCoreEvent,
  type OggCoreState,
  type PredictionCandidate,
} from "ogg-core";

type PredictionBodyReference = {
  systemAddress: string;
  bodyId: number;
};

type NormalizedPrediction = {
  present: boolean;
  body: PredictionBodyReference | null;
  candidates: readonly {
    id: string;
    evidenceStatus: string;
    supportingPlanetCount?: number;
  }[];
  knowledgeBase: { schemaVersion: number; revision: string } | null;
};

export type PredictionDecisionMismatch = {
  kind: "PREDICTION_DECISION_MISMATCH";
  systemAddress: string;
  bodyId: number;
  triggerEvent: string;
  inputFacts: Omit<CorePredictionBodyFacts, "bodyName">;
  legacy: NormalizedPrediction;
  core: NormalizedPrediction;
};

export type CoreShadowRuntimeResult = {
  explorationDecisions: readonly ExplorationDecision[];
  predictionMismatches: readonly PredictionDecisionMismatch[];
};

export class CoreShadowStateBridge {
  private readonly store: CoreStateStore;
  private readonly reportedPredictionMismatches = new Set<string>();

  constructor(store: CoreStateStore = new CoreStateStore()) {
    this.store = store;
  }

  ingest(event: EliteJournalFact): readonly OggCoreEvent[] {
    const coreEvents = adaptEliteJournalEvent(event);
    for (const coreEvent of coreEvents) this.store.dispatch(coreEvent);
    return coreEvents;
  }

  ingestExplorationDecisions(event: EliteJournalFact): readonly ExplorationDecision[] {
    const decisions: ExplorationDecision[] = [];
    for (const coreEvent of adaptEliteJournalEvent(event)) {
      const previous = this.store.getState();
      const state = this.store.dispatch(coreEvent);
      const decision = evaluateExploration(coreEvent, previous, state);
      if (decision) decisions.push(decision);
    }
    return decisions;
  }

  ingestRuntimeDecisions(
    event: EliteJournalFact,
    legacyPredictions: readonly AnnaLivePrediction[] | null,
  ): CoreShadowRuntimeResult {
    const explorationDecisions: ExplorationDecision[] = [];
    const predictionMismatches: PredictionDecisionMismatch[] = [];
    for (const coreEvent of adaptEliteJournalEvent(event)) {
      const previous = this.store.getState();
      const state = this.store.dispatch(coreEvent);
      const explorationDecision = evaluateExploration(coreEvent, previous, state);
      if (explorationDecision) explorationDecisions.push(explorationDecision);

      if (legacyPredictions !== null && coreEvent.type.startsWith("Prediction")) {
        const mismatch = this.comparePrediction(coreEvent.type, state, legacyPredictions);
        if (mismatch) predictionMismatches.push(mismatch);
      }
    }
    return { explorationDecisions, predictionMismatches };
  }

  getState(): Readonly<OggCoreState> {
    return this.store.getState();
  }

  private comparePrediction(
    triggerEvent: string,
    state: Readonly<OggCoreState>,
    legacyPredictions: readonly AnnaLivePrediction[],
  ): PredictionDecisionMismatch | null {
    const coreBody = state.predictionBodies.at(-1);
    if (!coreBody) return null;
    const body = { systemAddress: coreBody.systemAddress, bodyId: coreBody.bodyId };
    const coreDecision = evaluatePrediction(coreBody, annaBacteriumKnowledgePhase2B);
    const legacy = legacyPredictions.find((prediction) => prediction.planetKey === JSON.stringify([body.systemAddress, body.bodyId]));
    const normalizedLegacy = normalizeLegacyPrediction(legacy, body);
    const normalizedCore = normalizeCorePrediction(coreDecision, body);
    if (JSON.stringify(normalizedLegacy) === JSON.stringify(normalizedCore)) return null;

    const inputFacts = withoutBodyName(coreBody);
    const mismatch: PredictionDecisionMismatch = {
      kind: "PREDICTION_DECISION_MISMATCH",
      ...body,
      triggerEvent,
      inputFacts,
      legacy: normalizedLegacy,
      core: normalizedCore,
    };
    const fingerprint = JSON.stringify(mismatch);
    if (this.reportedPredictionMismatches.has(fingerprint)) return null;
    this.reportedPredictionMismatches.add(fingerprint);
    return mismatch;
  }
}

function normalizeCandidates(candidates: readonly PredictionCandidate[]) {
  return candidates
    .map((candidate) => ({
      id: candidate.id.trim().toLocaleLowerCase("en-US"),
      evidenceStatus: candidate.evidenceStatus,
      ...(candidate.supportingPlanetCount === undefined ? {} : { supportingPlanetCount: candidate.supportingPlanetCount }),
    }))
    .sort((left, right) => left.id.localeCompare(right.id, "en-US"));
}

function normalizeLegacyPrediction(
  prediction: AnnaLivePrediction | undefined,
  body: PredictionBodyReference,
): NormalizedPrediction {
  if (!prediction) return { present: false, body: null, candidates: [], knowledgeBase: null };
  return {
    present: true,
    body,
    candidates: normalizeCandidates(prediction.result.candidates),
    knowledgeBase: {
      schemaVersion: prediction.result.knowledgeBaseSchemaVersion,
      revision: prediction.result.knowledgeBaseRevision,
    },
  };
}

function normalizeCorePrediction(
  decision: ReturnType<typeof evaluatePrediction>,
  body: PredictionBodyReference,
): NormalizedPrediction {
  if (!decision) return { present: false, body: null, candidates: [], knowledgeBase: null };
  return {
    present: true,
    body,
    candidates: normalizeCandidates("candidates" in decision ? decision.candidates : []),
    knowledgeBase: decision.knowledgeBase,
  };
}

function withoutBodyName(body: CorePredictionBodyFacts): Omit<CorePredictionBodyFacts, "bodyName"> {
  const { bodyName: _bodyName, ...inputFacts } = body;
  return inputFacts;
}
