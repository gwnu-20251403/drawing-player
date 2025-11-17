import { createComponent } from "../core/createComponent.js";
import { getState, setState, subscribe } from "../core/store.js";

export const HomePage = createComponent({
  template: (props) => `
    <div>
      <h2>Home</h2>
      <p>여기는 홈 입니다.</p>
      <p>
        <span>카운터: </span>
        <span id="home-count">0</span>
      </p>
      <button id="home-inc-btn">+1</button>
    </div>
  `,

  setup: ({ rootEl, props }) => {
    let count = 0;
    const countEl = rootEl.querySelector('#home-count');
    const incBtn = rootEl.querySelector('#home-inc-btn');
    
    function renderFromState(state) {
      if (!countEl) return;
      countEl.textContent = String(state.counter);
    }

    renderFromState(getState());

    function handleClick(){
      const currentState = getState();
      setState({ counter: currentState.counter + 1 });
    }    

    incBtn?.addEventListener('click', handleClick)

    const unsubscribe = subscribe((newState) => {
      renderFromState(newState);
    });

    return {
      destroy() {
        incBtn?.removeEventListener('click', handleClick);
        unsubscribe();
      },
    };
  },
});