import { createComponent } from "../core/createComponent.js";
import { getState, setState, subscribe } from "../core/store.js";

export const JazzPage = createComponent({
  template: (props) => `
    <div>
      <h2>Jazz Page</h2>
      <p>여기는 재즈 페이지입니다 🎷</p>
      <button id="jazz-play-btn">재즈 재생</button>
      <label>
        intensity:
        <input id="jazz-intensity" type="range" min="0" max="1" step="0.05" />
      </label>
    </div>
  `,

  setup: ({ rootEl, props }) => {
    const playBtn = rootEl.querySelector('#jazz-play-btn');

    const rangeEl = rootEl.querySelector('#jazz-intensity');
    const valueEl = rootEl.querySelector('#jazz-intensity-value');

    function renderFromState(state) {
      if (!rangeEl || !valueEl) return;
      const v = state.sceneIntensity;
      rangeEl.value = String(v);
      valueEl.textContent = v.toFixed(2);
    }

    renderFromState(getState());

    function handleInput(e) {
      const v = Number(e.target.value);
      setState({ sceneIntensity: v });
    }

    rangeEl?.addEventListener('input', handleInput);

    const unsubscribe = subscribe((state) => {
      renderFromState(state);
    });

    function handlePlay() {
      alert('🎵 재즈를 재생합니다! (테스트 메세지임!)');
    }

    playBtn?.addEventListener('click', handlePlay);

    return {
      destroy() {
        playBtn?.removeEventListener('click', handlePlay);
        rangeEl?.removeEventListener('input', handleInput);
        unsubscribe();
      },
    };
  },
});