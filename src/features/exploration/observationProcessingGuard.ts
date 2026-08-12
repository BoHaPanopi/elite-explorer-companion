export type ObservationProcessingState = {
  baselineReady: boolean;
  lastProcessedObservationId: string | null;
  lastAlreadyProcessedLoggedObservationId: string | null;
};

export type ObservationProcessingDecision =
  | "baseline_initialization_skip"
  | "no_latest_observation"
  | "observation_already_processed"
  | "already_processed_suppressed"
  | "process_new_observation";

export function advanceObservationProcessingState(
  state: ObservationProcessingState,
  nextObservationId: string | null,
): {
  decision: ObservationProcessingDecision;
  nextState: ObservationProcessingState;
} {
  if (!state.baselineReady) {
    return {
      decision: "baseline_initialization_skip",
      nextState: {
        baselineReady: true,
        lastProcessedObservationId: nextObservationId,
        lastAlreadyProcessedLoggedObservationId: null,
      },
    };
  }

  if (!nextObservationId) {
    return {
      decision: "no_latest_observation",
      nextState: {
        ...state,
        lastAlreadyProcessedLoggedObservationId: null,
      },
    };
  }

  if (nextObservationId === state.lastProcessedObservationId) {
    if (state.lastAlreadyProcessedLoggedObservationId === nextObservationId) {
      return {
        decision: "already_processed_suppressed",
        nextState: state,
      };
    }

    return {
      decision: "observation_already_processed",
      nextState: {
        ...state,
        lastAlreadyProcessedLoggedObservationId: nextObservationId,
      },
    };
  }

  return {
    decision: "process_new_observation",
    nextState: {
      baselineReady: true,
      lastProcessedObservationId: nextObservationId,
      lastAlreadyProcessedLoggedObservationId: null,
    },
  };
}
