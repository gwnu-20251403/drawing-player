import { getState } from '../core/store.js';
import { drawScene } from './scenes.js';

let canvas, ctx;

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

function loop() {
  if (!ctx) return;

  const state = getState();
  drawScene(ctx, state);

  requestAnimationFrame(loop);
}