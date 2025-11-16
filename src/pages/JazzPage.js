import { createComponent } from "../core/createComponent.js";

export const JazzPage = createComponent({
  template: (props) => `
    <div>
      <h2>Jazz Page</h2>
      <p>여기는 재즈 페이지입니다 🎷</p>
      <button id="jazz-play-btn">재즈 재생</button>
    </div>
  `,

  setup: ({ rootEl, props }) => {
    const playBtn = rootEl.querySelector('#jazz-play-btn');

    function handlePlay() {
      alert('🎵 재즈를 재생합니다! (테스트 메세지임!)');
    }

    playBtn?.addEventListener('click', handlePlay);

    return {
      destroy() {
        playBtn?.removeEventListener('click', handlePlay);
      },
    };
  },
});