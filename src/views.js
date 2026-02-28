// src/views.js
let currentPage = null;

function getPageContainer() {
  return document.getElementById('route-view');
}

export function renderRouteDom(route) {
  const container = getPageContainer();
  if (!container) return;

  if (currentPage) {
    currentPage.unmount();
    currentPage = null;
    container.innerHTML = '';
  }

  const PageClass = route.component;
  if (!PageClass) {
    container.textContent = 'No component for this route.';
    return;
  }

  currentPage = new PageClass({ route });
  currentPage.mount(container);
}
