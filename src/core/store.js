let state = {
    counter: 0,

    sceneName: 'home',
    sceneSpeed: 1.0,
    sceneIntensity: 1.0,
};

const listeners = new Set();

export function getState() {
  return state;
}

// state의 일부를 업데이트하는 함수
export function setState(partial) {
    state = { ...state, ...partial };

    listeners.forEach((listener) => listener(state));
}

// state 변경을 구독하는 함수
export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}