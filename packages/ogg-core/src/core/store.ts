import type { OggCoreEvent, OggCoreState } from "./model.ts";
import { initialOggCoreState } from "./model.ts";
import { reduceCoreState } from "./reducer.ts";

export type CoreStateListener = (state: Readonly<OggCoreState>, event: Readonly<OggCoreEvent>) => void;

function stateFingerprint(state: OggCoreState): string {
  return JSON.stringify(state);
}

export class CoreStateStore {
  private state: OggCoreState;
  private readonly listeners = new Set<CoreStateListener>();

  constructor(initialState: OggCoreState = initialOggCoreState) {
    this.state = initialState;
  }

  getState(): Readonly<OggCoreState> {
    return this.state;
  }

  dispatch(event: OggCoreEvent): Readonly<OggCoreState> {
    const nextState = reduceCoreState(this.state, event);
    const changed = stateFingerprint(this.state) !== stateFingerprint(nextState);
    this.state = nextState;
    if (changed) for (const listener of this.listeners) listener(this.state, event);
    return this.state;
  }

  subscribe(listener: CoreStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
