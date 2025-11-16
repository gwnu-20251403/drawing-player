import { drawScene } from './scenes.js';

let canvas, ctx;
let currentSceneName = 'home';

export function initCanvas() {
  canvas = document.getElementById('background-canvas');
  if (!canvas) return;

  ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  requestAnimationFrame(loop);
}

export function setCanvasScene(sceneName) {
  currentSceneName = sceneName;
}

function loop() {
  if (!ctx) return;

  // 현재 장면을 기반으로 캔버스 그리기
  drawScene(ctx, currentSceneName);

  requestAnimationFrame(loop);
}