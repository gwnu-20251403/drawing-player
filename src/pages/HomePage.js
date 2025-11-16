import { createComponent } from "../core/createComponent.js";

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
    
    function handleClick(){
      count += 1;
      if (countEl) {
        countEl.textContent = String(count);
      }
    }    

    incBtn?.addEventListener('click', handleClick)

    return {
      destroy() {
        incBtn?.removeEventListener('click', handleClick);
      },
    };
  },
});