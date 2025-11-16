import { setScene } from './canvas/scenes.js';
import routes from './routes.js';



function matchRoute(pathname) {
  return routes.find((r) => r.path === pathname) || routes[0];
}

export function navigateTo(pathname) {
  if (window.location.pathname === pathname) return;
  // 주소창 변경 (새로고침 없음)
  console.log('Navigating to:', pathname);

  const route = routes.find((r) => r.path === pathname);
  const notFoundRoute = routes.find((r) => r.path === '*');
  window.history.pushState({}, '', route ? pathname : '*');
  renderCurrentRoute();

  console.log(route || notFoundRoute || routes[0]);
  return route || notFoundRoute || routes[0];
}

export function initRouter() {
  // 뒤로가기/앞으로가기 대응
  window.addEventListener('popstate', renderCurrentRoute);
  // 첫 로딩 시 렌더
  renderCurrentRoute();
}

function renderCurrentRoute() {
  const pathname = window.location.pathname || '/';
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