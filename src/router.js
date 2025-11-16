import { setScene } from './canvas/scenes.js';
import routes from './routes.js';

let currentPageInstance = null;

function getCurrentPath() {
  // 예: "#/jazz" → "/jazz"
  const hash = window.location.hash || '';
  const path = hash.replace(/^#/, '') || '/'; // hash가 없으면 '/'
  return path;
}

function matchRoute(pathname) {
  const route = routes.find((r) => r.path === pathname);
  const notFoundRoute = routes.find((r) => r.path === '*');
  return route || notFoundRoute || routes[0];
}

export function navigateTo(pathname) {
  const current = getCurrentPath();
  if (current === pathname) return;

  console.log('Navigating to:', pathname);

  // 주소창 hash만 바꿔주면 됨 (새로고침 시에도 서버는 항상 index.html만 봄)
  window.location.hash = pathname;
  // hashchange 이벤트가 있어도, 바로 렌더해주면 UX가 좋음
  renderCurrentRoute();
}

export function initRouter() {
  // 초기 진입 시 기본 경로 설정
  if (!window.location.hash) {
    window.location.hash = '/';
  }
  // 뒤로가기/앞으로가기 대응
  window.addEventListener('hashchange', renderCurrentRoute);
  // 첫 로딩 시 렌더
  renderCurrentRoute();
}

function renderCurrentRoute() {
  const pathname = getCurrentPath();
  const route = matchRoute(pathname);

  // 네비게이션 버튼 활성화 상태 반영
  if (route) {
    const activePathButton = document.querySelector(`button[data-link="${route.path}"]`);
    if (activePathButton) {
      document.querySelectorAll('button[data-link]').forEach((btn) => {
        if (btn === activePathButton) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }

  const viewEl = document.getElementById('route-view');
  if (!viewEl) return;

  // 이전 페이지 언마운트
  if (currentPageInstance && typeof currentPageInstance.destroy === 'function') {
    currentPageInstance.destroy();
  }
  // 새로운 페이지 인스턴스 생성 및 렌더
  const instance = route.component(viewEl, route.props || {});
  currentPageInstance = instance || null;

  // 라우트에 맞는 캔버스 배경 테마 설정
  if (route.scene) {
    setScene(route.scene);
  }
}