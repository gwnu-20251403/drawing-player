// src/pages/HomePage.js
import { Component } from '../core/Component.js';
import { navigateTo } from '../router.js';
import { setState } from '../core/store.js';
import { preloadLibrary } from '../../data/library.js';

function fmtTime(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

function calcPlayDiscRect() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const size = Math.min(vw * 0.50, vh * 0.58);
  const x = vw * 0.5 - size * 0.5;
  const y = vh * 0.5 - size * 0.5 + 10;

  return { x, y, w: size, h: size };
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// ===== cover fly helpers (album -> modal sleeve) =====
function removeFlyCover() {
  const old = document.getElementById('ui-cover-fly');
  if (old) old.remove();
}

function createFlyCover(fromRect, coverUrl, borderRadiusPx = 18) {
  removeFlyCover();

  const fly = document.createElement('div');
  fly.id = 'ui-cover-fly';
  fly.className = 'ui-cover-fly';
  fly.style.left = `${fromRect.left}px`;
  fly.style.top = `${fromRect.top}px`;
  fly.style.width = `${fromRect.width}px`;
  fly.style.height = `${fromRect.height}px`;
  fly.style.borderRadius = `${borderRadiusPx}px`;
  fly.style.opacity = '1';

  const img = document.createElement('img');
  img.className = 'ui-cover-fly__img';
  img.alt = 'Album cover';
  img.draggable = false;
  if (coverUrl) img.src = coverUrl;

  fly.appendChild(img);
  document.body.appendChild(fly);
  fly.getBoundingClientRect(); // ✅ initial layout
  return fly;
}

// ===== disc fly helpers (modal -> play) =====
function removeFlyDisc() {
  const old = document.getElementById('ui-disc-fly');
  if (old) old.remove();
}

/* ✅ left/top 기반으로 생성 (화면에 확실히 뜨게) */
function createFlyDisc(fromRect, coverUrl) {
  removeFlyDisc();

  const fly = document.createElement('div');
  fly.id = 'ui-disc-fly';
  fly.className = 'ui-disc-fly';
  fly.style.left = `${fromRect.left}px`;
  fly.style.top = `${fromRect.top}px`;
  fly.style.width = `${fromRect.width}px`;
  fly.style.height = `${fromRect.height}px`;
  fly.style.opacity = '1';
  fly.style.transform = 'rotate(0deg)';

  const label = document.createElement('div');
  label.className = 'ui-disc-fly__label';
  if (coverUrl) label.style.backgroundImage = `url("${coverUrl}")`;

  const hole = document.createElement('div');
  hole.className = 'ui-disc-fly__hole';

  fly.appendChild(label);
  fly.appendChild(hole);
  document.body.appendChild(fly);
  fly.getBoundingClientRect(); // ✅ initial layout 확정

  return fly;
}

export class HomePage extends Component {
  constructor() {
    super();
    this._cleanup = null;
  }

  render() {
    const root = document.createElement('section');
    root.className = 'home';

    root.innerHTML = `
      <div class="home__stage">
        <h1 class="home__title">Album Wall</h1>
        <p class="home__hint">휠: 1칸 스냅 · 드래그: 관성 후 스냅 · 가운데 앨범 클릭: 정보</p>

        <div class="home__carousel">
          <div class="home__rail" aria-label="album carousel"></div>
        </div>
      </div>

      <div class="track-modal" aria-hidden="true">
        <div class="track-modal__backdrop"></div>
        <div class="track-modal__panel" role="dialog" aria-modal="true">
          <button class="track-modal__close" type="button" aria-label="close">✕</button>

          <div class="track-modal__content">
            <div class="track-modal__hero">
              <div class="track-modal__heroDisc">
                <div class="disc disc--hero">
                  <div class="disc__label"></div>
                </div>
              </div>

              <div class="track-modal__heroSleeve">
                <img class="track-modal__heroImg" alt="" />
              </div>
            </div>

            <div class="track-modal__meta">
              <h2 class="track-modal__title"></h2>
              <p class="track-modal__artist"></p>
              <div class="track-modal__chips"></div>

              <div class="track-modal__actions">
                <button class="btn btn--primary track-modal__play" type="button">재생</button>
                <button class="btn track-modal__justClose" type="button">닫기</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    return root;
  }

  async afterMount() {
    const root = this.el;
    const rail = root.querySelector('.home__rail');
    const modal = root.querySelector('.track-modal');
    const modalBackdrop = root.querySelector('.track-modal__backdrop');
    const modalClose = root.querySelector('.track-modal__close');
    const modalJustClose = root.querySelector('.track-modal__justClose');

    const $heroImg = root.querySelector('.track-modal__heroImg');
    const $heroDisc = root.querySelector('.track-modal__heroDisc');
    const $heroSleeve = root.querySelector('.track-modal__heroSleeve');

    const $title = root.querySelector('.track-modal__title');
    const $artist = root.querySelector('.track-modal__artist');
    const $chips = root.querySelector('.track-modal__chips');
    const $btnPlay = root.querySelector('.track-modal__play');

    const { genres, tracks } = await preloadLibrary();

    // ---- 카드 렌더 (메타 포함) ----
    const esc = (s) =>
      String(s ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

    const makeCard = (t) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'record';
      btn.dataset.trackId = String(t.id);

      const title = esc(t.title ?? '(untitled)');
      const artist = esc(t.artist ?? '-');
      const album = esc(t.album ?? '');

      btn.innerHTML = `
        <div class="record__anim">
          <img class="record__cover" src="${t.cover}" alt="${album || title}" draggable="false" />
          <div class="record__meta" aria-hidden="true">
            <p class="record__title">${title}</p>
            <p class="record__artist">${artist}</p>
          </div>
        </div>
      `;
      return btn;
    };

    tracks.forEach((t) => rail.appendChild(makeCard(t)));
    const getCards = () => Array.from(rail.querySelectorAll('.record'));

    // ---- 스냅/스크롤 계산 ----
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const clampIndex = (idx) => clamp(idx, 0, Math.max(0, tracks.length - 1));
    const maxScrollLeft = () => Math.max(0, rail.scrollWidth - rail.clientWidth);
    const clampLeft = (x) => clamp(x, 0, maxScrollLeft());

    let activeIndex = 0;

    const applyActive = (idx) => {
      const cards = getCards();
      cards.forEach((c, i) => c.classList.toggle('is-active', i === idx));
    };

    const cancelAnim = () => {
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = null;
    };

    const animateScrollTo = (toLeft, ms = 240) => {
      cancelAnim();
      const from = rail.scrollLeft;
      const start = performance.now();
      const to = clampLeft(toLeft);

      const tick = (now) => {
        const t = clamp((now - start) / ms, 0, 1);
        const e = easeOutCubic(t);
        rail.scrollLeft = from + (to - from) * e;
        if (t < 1) this._raf = requestAnimationFrame(tick);
      };
      this._raf = requestAnimationFrame(tick);
    };

    const targetLeftForIndex = (idx) => {
      const el = getCards()[idx];
      if (!el) return rail.scrollLeft;

      const railRect = rail.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const railCenter = railRect.left + railRect.width / 2;
      const elCenter = elRect.left + elRect.width / 2;

      return rail.scrollLeft + (elCenter - railCenter);
    };

    const nearestIndex = () => {
      const list = getCards();
      const railRect = rail.getBoundingClientRect();
      const railCenter = railRect.left + railRect.width / 2;

      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < list.length; i++) {
        const r = list[i].getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const d = Math.abs(cx - railCenter);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      return clampIndex(best);
    };

    const goTo = (idx, { animate = true } = {}) => {
      const i = clampIndex(idx);
      activeIndex = i;
      applyActive(activeIndex);

      const left = clampLeft(targetLeftForIndex(activeIndex));
      if (animate) animateScrollTo(left, 220);
      else rail.scrollLeft = left;
    };

    setTimeout(() => goTo(0, { animate: false }), 0);

    // ---- 모달 ----
    let isModalOpen = false;
    let isTransitioning = false;
    let isOpeningModal = false;
    let modalTrackId = null;
    let flyingCard = null;

    const fillModal = (trackId) => {
      const t = tracks.find((x) => String(x.id) === String(trackId));
      if (!t) return null;
      modalTrackId = String(trackId);

      const g = genres.find((x) => String(x.id) === String(t.genreId));
      $heroImg.src = t.cover;
      $heroImg.alt = t.album || t.title;
      $title.textContent = t.album || t.title;
      $artist.textContent = t.artist || '';
      $chips.innerHTML = `
        <span class="chip">${t.title}</span>
        <span class="chip">${fmtTime(t.durationSec)}</span>
        <span class="chip">${g?.name ?? t.genreId}</span>
      `;
      // 디스크는 기본 숨김 상태로 유지
      modal.classList.remove('is-ejecting');
      return t;
    };

    const showModal = () => {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      isModalOpen = true;
    };

    const closeModal = () => {
      removeFlyCover();
      isOpeningModal = false;

      if (flyingCard) {
        flyingCard.classList.remove('is-fly-source', 'is-flying');
        flyingCard = null;
      }

      modal.classList.remove('is-open', 'is-ejecting');
      modal.setAttribute('aria-hidden', 'true');
      isModalOpen = false;
      modalTrackId = null;
      isTransitioning = false;
    };

    const openModalAnimated = (trackId, sourceCard) => {
      if (isModalOpen || isTransitioning || isOpeningModal) return;

      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      const t = fillModal(trackId);
      if (!t) return;

      if (reduced) {
        showModal();
        return;
      }

      const sleeve = $heroSleeve;
      const fromEl =
        sourceCard?.querySelector?.('.record__anim') ||
        sourceCard?.querySelector?.('.record__cover') ||
        sourceCard;

      if (!sleeve || !fromEl) {
        showModal();
        return;
      }

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = sleeve.getBoundingClientRect();
      const br = parseFloat(getComputedStyle(sleeve).borderRadius) || 18;

      isOpeningModal = true;

      flyingCard = sourceCard || null;
      if (flyingCard) {
        flyingCard.classList.add('is-fly-source');
        setTimeout(() => flyingCard?.classList.add('is-flying'), 90);
      }

      const fly = createFlyCover(fromRect, t.cover, br);
      fly.style.transform = 'translate3d(0,0,0) rotate(-2deg) scale(1.00)';
      fly.getBoundingClientRect();

      requestAnimationFrame(() => {
        fly.style.left = `${toRect.left}px`;
        fly.style.top = `${toRect.top}px`;
        fly.style.width = `${toRect.width}px`;
        fly.style.height = `${toRect.height}px`;
        fly.style.borderRadius = `${br}px`;
        fly.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1.02)';
      });

      const finish = () => {
        fly.removeEventListener('transitionend', onEnd);
        removeFlyCover();
        isOpeningModal = false;
        showModal();
      };

      const onEnd = (e) => {
        if (!e) return finish();
        if (e.propertyName === 'left' || e.propertyName === 'top' || e.propertyName === 'transform') finish();
      };

      fly.addEventListener('transitionend', onEnd);
      setTimeout(() => { if (isOpeningModal) finish(); }, 520);
    };

    modalBackdrop.addEventListener('click', closeModal);
    modalClose.addEventListener('click', closeModal);
    modalJustClose.addEventListener('click', closeModal);

    // ---- Home → Play 디스크 전환 ----
    const playFromModal = () => {
      if (!modalTrackId) return;
      if (isTransitioning || isOpeningModal) return;
      isTransitioning = true;

      const t = tracks.find((x) => String(x.id) === String(modalTrackId));
      if (!t) { isTransitioning = false; return; }

      // ✅ 0) 모달 디스크를 “커버 뒤 중앙”에서 나오게
      modal.classList.add('is-ejecting');

      const EMERGE_MS = 220;

      setTimeout(() => {
        // ✅ 1) fly 시작 위치/크기는 “커버(슬리브) rect”로 (크기/중앙 확실히 일치)
        const sleeveRect = $heroSleeve.getBoundingClientRect();
        const fly = createFlyDisc(sleeveRect, t.cover);

        // ✅ 2) 다음 프레임에 빠져나오며 fade-out
        requestAnimationFrame(() => {
          fly.style.transition = `left 620ms cubic-bezier(.2,.9,.2,1),
                                 top 620ms cubic-bezier(.2,.9,.2,1),
                                 transform 620ms cubic-bezier(.2,.9,.2,1),
                                 opacity 560ms ease`;
          fly.style.left = `${sleeveRect.left + sleeveRect.width * 0.62}px`;
          fly.style.top = `${sleeveRect.top}px`;
          fly.style.transform = `rotate(160deg)`;
          fly.style.opacity = '0';
        });

        const FADE_TOTAL = 620;

        setTimeout(() => {
          const to = calcPlayDiscRect();

          // ✅ 3) roll-in 준비(왼쪽 밖)
          fly.style.transition = 'none';
          fly.style.width = `${to.w}px`;
          fly.style.height = `${to.h}px`;
          fly.style.left = `${-to.w * 1.25}px`;
          fly.style.top = `${to.y + to.h * 0.04}px`;
          fly.style.opacity = '0';
          fly.style.transform = `rotate(-260deg)`;
          fly.getBoundingClientRect();

          // ✅ 4) roll-in 실행
          requestAnimationFrame(() => {
            fly.style.transition = `left 560ms cubic-bezier(.2,.9,.2,1),
                                   top 560ms cubic-bezier(.2,.9,.2,1),
                                   transform 560ms cubic-bezier(.2,.9,.2,1),
                                   opacity 260ms ease`;
            fly.style.left = `${to.x}px`;
            fly.style.top = `${to.y}px`;
            fly.style.opacity = '1';
            fly.style.transform = `rotate(0deg)`;
          });

          setState({
            currentTrackId: String(modalTrackId),
            isPlaying: true,
            uiTransition: { kind: 'disc', trackId: String(modalTrackId), ts: Date.now() },
          });

          // roll-in 거의 끝날 때 화면 전환
          setTimeout(() => {
            closeModal();
            navigateTo('/play');
          }, 520);
        }, FADE_TOTAL);
      }, EMERGE_MS);
    };

    $btnPlay.addEventListener('click', playFromModal);

    // ---- 입력: wheel + drag + click ----
    const onWheel = (e) => {
      if (isModalOpen || isTransitioning || isOpeningModal) return;

      e.preventDefault();
      cancelAnim();

      const dir = Math.sign(e.deltaY || e.deltaX || 0);
      if (!dir) return;

      const next = clampIndex(activeIndex + dir);
      if (next === activeIndex) return;

      goTo(next, { animate: true });
    };

    rail.addEventListener('wheel', onWheel, { passive: false });

    let isPointerDown = false;
    let isDragging = false;
    let startX = 0, startY = 0, startLeft = 0;
    let lastX = 0, lastT = 0, v = 0;
    let downCard = null;
    let isCaptured = false;

    const DRAG_START_PX = 10;
    const CLICK_MAX_PX = 6;

    const closestRecord = (e) => {
      const t = e?.target;
      const el = (t && t.nodeType === 3) ? t.parentElement : t;
      return el?.closest?.('.record') ?? null;
    };

    const onPointerDown = (e) => {
      if (isModalOpen || isTransitioning || isOpeningModal) return;

      isPointerDown = true;
      isDragging = false;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rail.scrollLeft;

      lastX = e.clientX;
      lastT = performance.now();
      v = 0;

      downCard = closestRecord(e);
      isCaptured = false;
    };

    const onPointerMove = (e) => {
      if (!isPointerDown) return;
      if (isModalOpen || isTransitioning || isOpeningModal) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!isDragging) {
        if (Math.abs(dx) < DRAG_START_PX) return;
        if (Math.abs(dx) < Math.abs(dy) + 2) return;

        isDragging = true;
        rail.classList.add('is-dragging');
        cancelAnim();

        if (!isCaptured) {
          try { rail.setPointerCapture?.(e.pointerId); } catch {}
          isCaptured = true;
        }
      }

      e.preventDefault();
      rail.scrollLeft = startLeft - dx;

      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      v = (lastX - e.clientX) / dt;
      lastX = e.clientX;
      lastT = now;

      const idx = nearestIndex();
      if (idx !== activeIndex) {
        activeIndex = idx;
        applyActive(activeIndex);
      }
    };

    const onPointerUp = (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;

      if (isCaptured) {
        try { rail.releasePointerCapture?.(e.pointerId); } catch {}
        isCaptured = false;
      }

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const moved = Math.hypot(dx, dy);
      const clickedCard = downCard;
      downCard = null;

      rail.classList.remove('is-dragging');

      // 클릭
      if (!isDragging && moved <= CLICK_MAX_PX) {
        const card = clickedCard || closestRecord(e);
        if (!card) return;

        const list = getCards();
        const idx = list.indexOf(card);
        if (idx < 0) return;

        if (idx !== activeIndex) {
          goTo(idx, { animate: true });
          return;
        }

        const trackId = card.dataset.trackId;
        setState({ currentTrackId: String(trackId), isPlaying: false });
        openModalAnimated(trackId, card);
        return;
      }

      // 드래그 종료 → 관성 → 스냅
      if (!isDragging) return;
      isDragging = false;

      const inertiaLeft = clampLeft(rail.scrollLeft + v * 220);
      animateScrollTo(inertiaLeft, 140);

      setTimeout(() => {
        const idx = nearestIndex();
        activeIndex = clampIndex(idx);
        applyActive(activeIndex);

        const snapLeft = clampLeft(targetLeftForIndex(activeIndex));
        animateScrollTo(snapLeft, 220);
      }, 150);
    };

    rail.addEventListener('pointerdown', onPointerDown);
    rail.addEventListener('pointermove', onPointerMove, { passive: false });
    rail.addEventListener('pointerup', onPointerUp);
    rail.addEventListener('pointercancel', onPointerUp);

    // cleanup
    this._cleanup = () => {
      removeFlyCover();

      if (flyingCard) {
        flyingCard.classList.remove('is-fly-source', 'is-flying');
        flyingCard = null;
      }

      modalBackdrop.removeEventListener('click', closeModal);
      modalClose.removeEventListener('click', closeModal);
      modalJustClose.removeEventListener('click', closeModal);
      $btnPlay.removeEventListener('click', playFromModal);

      rail.removeEventListener('wheel', onWheel);
      rail.removeEventListener('pointerdown', onPointerDown);
      rail.removeEventListener('pointermove', onPointerMove);
      rail.removeEventListener('pointerup', onPointerUp);
      rail.removeEventListener('pointercancel', onPointerUp);

      cancelAnim();
    };
  }

  beforeUnmount() {
    this._cleanup?.();
  }
}
