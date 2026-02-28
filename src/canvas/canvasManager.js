import { getState } from '../core/store.js';
import { drawScene } from './scenes.js';

let canvas, ctx;
let lastTime = 0;

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

  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function loop(now) {
  if (!ctx) return;

  const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000)); // 1~50ms clamp
  lastTime = now;

  const state = getState();
  drawScene(ctx, state, dt, now / 1000);

  requestAnimationFrame(loop);
}
