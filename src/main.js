// src/main.js
import { initRouter } from './router.js';
import { initCanvas } from './canvas/canvasManager.js';
import routes from './routes.js';
import { subscribe, getState } from './core/store.js';
import { preloadLibrary } from '../data/library.js';

const appEl = document.getElementById('app');

function renderLayout() {
  appEl.innerHTML = `
    <canvas id="background-canvas"></canvas>
    <main id="route-view"></main>
  `;
}
async function bootstrap() {
  renderLayout();

  initCanvas();
  await preloadLibrary(); // ✅ HomePage/PlayPage에서 안정적으로 사용
  initRouter();
}

window.addEventListener('DOMContentLoaded', () => {
  bootstrap().catch((e) => console.error(e));
});
