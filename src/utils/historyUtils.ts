import { OrgNode } from './orgChartUtils';

export interface HistoryState {
  past: OrgNode[];
  present: OrgNode;
  future: OrgNode[];
}

export function createHistoryState(initial: OrgNode): HistoryState {
  return {
    past: [],
    present: initial,
    future: [],
  };
}

export function recordChange(state: HistoryState, newPresent: OrgNode): HistoryState {
  return {
    past: [...state.past, state.present],
    present: newPresent,
    future: [],
  };
}

export function undo(state: HistoryState): HistoryState {
  if (state.past.length === 0) return state;

  const previous = state.past[state.past.length - 1];
  const newPast = state.past.slice(0, state.past.length - 1);

  return {
    past: newPast,
    present: previous,
    future: [state.present, ...state.future],
  };
}

export function redo(state: HistoryState): HistoryState {
  if (state.future.length === 0) return state;

  const next = state.future[0];
  const newFuture = state.future.slice(1);

  return {
    past: [...state.past, state.present],
    present: next,
    future: newFuture,
  };
}

export function canUndo(state: HistoryState): boolean {
  return state.past.length > 0;
}

export function canRedo(state: HistoryState): boolean {
  return state.future.length > 0;
}
