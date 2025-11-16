import { setScene } from './canvas/scenes.js';
import routes from './routes.js';

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
  // 뒤로가기/앞으로가기 대응
  window.addEventListener('hashchange', renderCurrentRoute);
  // 첫 로딩 시 렌더
  renderCurrentRoute();
}

function renderCurrentRoute() {
  const pathname = getCurrentPath();
  const route = matchRoute(pathname);

  const viewEl = document.getElementById('route-view');
  if (!viewEl) return;

  // 컴포넌트는 "HTML 문자열을 반환하는 함수"로 가정
  viewEl.innerHTML = route.component();

  // 라우트에 맞는 캔버스 배경 테마 설정
  // if (route.scene) {
  //   setScene(route.scene);
  // }
}