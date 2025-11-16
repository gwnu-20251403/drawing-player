import { setCanvasScene } from './canvasManager.js';

export function setScene(sceneName) {
  setCanvasScene(sceneName);
}

// 간단한 예시 드로잉
export function drawScene(ctx, sceneName) {
  const { width, height } = ctx.canvas;

  if (sceneName === 'home') {
    // 예: 파란 그라디언트 배경
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0f172a'); // 딥 블루
    grad.addColorStop(1, '#1d4ed8'); // 블루
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 여기에 home용 파티클/라인 등 추가 가능
  } else if (sceneName === 'about') {
    // 예: 보라 계열 배경
    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height)
    );
    grad.addColorStop(0, '#4c1d95');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // 기본 배경
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);
  }
}