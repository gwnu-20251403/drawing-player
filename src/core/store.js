// src/core/store.js
const STORAGE_KEY = 'drawing-player:state:v2';
const listeners = new Set();

const safeParse = (s) => {
  try { return JSON.parse(s); } catch { return null; }
};

const baseState = {
  sceneName: 'home',

  masterVolume: 0.8,
  currentTrackId: null,
  isPlaying: false,
  lastPositions: {},

  // Home -> Play 연출 인계용 (persist 금지)
  uiTransition: null,
};

let state = (() => {
  const raw = safeParse(localStorage.getItem(STORAGE_KEY));
  if (!raw || typeof raw !== 'object') return { ...baseState };
  return { ...baseState, ...raw, uiTransition: null };
})();

function persist() {
  const { uiTransition, ...rest } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
}

export function getState() {
  return state;
}

export function setState(partial) {
  const next = typeof partial === 'function' ? partial(state) : partial;
  if (!next || typeof next !== 'object') return;

  state = { ...state, ...next };
  persist();

  listeners.forEach((fn) => {
    try { fn(state); } catch (e) { console.error(e); }
  });
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setTrackPosition(trackId, sec) {
  if (!trackId) return;
  const id = String(trackId);
  const t = Math.max(0, Number(sec) || 0);
  setState({
    lastPositions: {
      ...(state.lastPositions || {}),
      [id]: t,
    },
  });
}

export function consumeUiTransition() {
  const t = state.uiTransition;
  setState({ uiTransition: null });
  return t;
}
