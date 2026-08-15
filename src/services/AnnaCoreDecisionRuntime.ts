import type { EliteJournalFact } from "ogg-core";

import { AnnaEvidenceService } from "./AnnaEvidenceService.ts";
import { CoreShadowStateBridge, type CoreShadowRuntimeResult } from "./CoreShadowStateBridge.ts";

export type AnnaCoreRuntimeResult = CoreShadowRuntimeResult & {
  predictionRevision: number;
  exobioRevision: number;
};

export function consumeAnnaCoreDecisions(
  event: EliteJournalFact,
  dependencies: {
    bridge: CoreShadowStateBridge;
    evidence: AnnaEvidenceService;
  },
): AnnaCoreRuntimeResult {
  const result = dependencies.bridge.ingestRuntimeDecisions(event);
  dependencies.evidence.setCoreCommander(dependencies.bridge.getState().commander?.name ?? null);
  dependencies.evidence.consumeCoreDecisions(
    result.exobioDecisions,
    result.predictionDecisions,
    dependencies.bridge.getState(),
  );
  return {
    ...result,
    predictionRevision: dependencies.evidence.predictions().reduce((latest, prediction) => Math.max(latest, prediction.revision), 0),
    exobioRevision: dependencies.evidence.exobioRevision(),
  };
}
