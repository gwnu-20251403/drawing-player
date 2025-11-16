import { createComponent } from "../core/createComponent.js";

export const NotFoundPage = createComponent({
  template: (props) => `
    <div>
      <h2>!!!404 Not Found!!!</h2>
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