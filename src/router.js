// src/router.js
import { setScene } from './canvas/scenes.js';
import routes from './routes.js';
import { renderRouteDom } from './views.js';

let currentRoute = null;

function normalize(path) {
  if (!path) return '/';
  if (!path.startsWith('/')) return '/' + path;
  return path;
}

function getHashPath() {
  const raw = location.hash.replace(/^#/, '');
  return normalize(raw || '/');
}

function matchRoute(pathname) {
  const route = routes.find((r) => r.path === pathname);
  const notFound = routes.find((r) => r.path === '*');
  return route || notFound || routes[0];
}

function applyRoute(route) {
  currentRoute = route;
  renderRouteDom(route);
  if (route.scene) setScene(route.scene);
  document.title = route.title ?? 'Drawing Player';
}

export function navigateTo(pathname, { replace = false } = {}) {
  const path = normalize(pathname);
  const route = matchRoute(path);

  const target = `#${route.path}`;
  if (replace) location.replace(target);
  else location.hash = route.path;

  // hashchange 전에 바로 적용(체감 즉시)
  applyRoute(route);
}

export function initRouter() {
  applyRoute(matchRoute(getHashPath()));

  window.addEventListener('hashchange', () => {
    applyRoute(matchRoute(getHashPath()));
  });

  // <button data-link="/play">
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-link]');
    if (!el) return;
    e.preventDefault();
    navigateTo(el.getAttribute('data-link'));
  });
}
