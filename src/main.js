import { initRouter, navigateTo } from './router.js';
import { initCanvas } from './canvas/canvasManager.js';
import routes from './routes.js';

const appEl = document.getElementById('app');

function renderLayout() {
  appEl.innerHTML = `
    <header class="app-header">
      <h1>Drawing Player</h1>
      <nav>
        ${createNavButtons(routes)}
      </nav>
    </header>
    <main id="route-view"></main>
  `;

  // 네비게이션 버튼 클릭 → 라우터로 이동
  const navButtons = appEl.querySelectorAll('[data-link]');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const path = e.target.getAttribute('data-link');
      navigateTo(path);
    });
  });
}

function createNavButtons(routes) {
  let navButtons = '';
  for (const route of routes) {
    if (route.path === '*') continue; // 404는 네비게이션에 포함하지 않음
    const buttonText = '<button data-link="';
    const buttonPath = route.path;
    const buttonClose = `">${route.name}</button>\n`;
    navButtons += buttonText + buttonPath + buttonClose;
  }
  return navButtons;
}

function bootstrap() {
  renderLayout();     // UI 레이아웃 렌더
  initCanvas();       // 캔버스 초기화
  initRouter();       // 라우터 초기화
}

bootstrap();