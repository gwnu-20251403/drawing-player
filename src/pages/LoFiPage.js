import { createComponent } from "../core/createComponent.js";

export const LoFiPage = createComponent({
  template: (props) => `
    <div>
      <h2>Lo-Fi Page</h2>
      <p>여기는 Lo-Fi 페이지입니다</p>
    </div>
  `,

  setup: ({ rootEl, props }) => {
    return {
      destroy() {
        // 필요한 정리 작업이 있으면 여기에 작성
      },
    };
  },
});