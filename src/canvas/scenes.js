import { initCanvas } from './canvasManager.js';
import { getState, setState } from '../core/store.js';

const scenePresets = {
  home: {
    sceneName: 'home',
    sceneSpeed: 0.5,
    sceneIntensity: 0.3,
  },
  jazz: {
    sceneName: 'jazz',
    sceneSpeed: 1.2,
    sceneIntensity: 0.8,
  },
  default: {
    sceneName: 'default',
    sceneSpeed: 1,
    sceneIntensity: 0.5,
  },
};

export function setScene(name) {
  const preset = scenePresets[name] || scenePresets.default;
  setState(preset);
}

// 간단한 예시 드로잉
export function drawScene(ctx, state) {
  const { width, height } = ctx.canvas;
  const { sceneName, sceneIntensity } = state;

  if (sceneName === 'home') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#bfccebff');
    grad.addColorStop(1, '#b88fc1ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // intensity를 이용해 약간의 효과를 줄 수 있음 (예: 알파, 라인 수 등)
    // 여기서는 간단히 원 몇 개 그려보기
    const count = Math.floor(20 * sceneIntensity) + 5;
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = 10 + Math.random() * 40;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      // ctx.strokeStyle = 'white';
      // ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (sceneName === 'jazz') {
    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height)
    );
    grad.addColorStop(0, '#ebb3a8ff');
    grad.addColorStop(1, '#ace89eff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // intensity로 라인 개수/길이 조절
    const lines = Math.floor(30 * sceneIntensity) + 10;
    ctx.lineWidth = 2;
    for (let i = 0; i < lines; i++) {
      const x1 = Math.random() * width;
      const y1 = Math.random() * height;
      const x2 = x1 + (Math.random() - 0.5) * 200;
      const y2 = y1 + (Math.random() - 0.5) * 200;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      // ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      // ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#d2f1fa7c';
    ctx.fillRect(0, 0, width, height);
  }
}