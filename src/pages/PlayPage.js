// src/pages/PlayPage.js
import { Component } from '../core/Component.js';
import { navigateTo } from '../router.js';
import { getState, setState, setTrackPosition } from '../core/store.js';
import { preloadLibrary, findTrackById, findGenreById } from '../../data/library.js';
import { setScene } from '../canvas/scenes.js';

function fmtTime(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

function applyDeckVars(root) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const size = Math.round(Math.min(vh * 0.56, vw * 0.36, 520));
  const left = Math.round(Math.max(24, vw * 0.06));
  const top = Math.round(vh * 0.5 - size / 2);

  root.style.setProperty('--deck-left', `${left}px`);
  root.style.setProperty('--deck-top', `${top}px`);
  root.style.setProperty('--deck-size', `${size}px`);
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export class PlayPage extends Component {
  render() {
    const root = document.createElement('section');
    root.className = 'page page--play';

    root.innerHTML = `
      <div class="play">
        <header class="play__header">
          <button class="play__btn" type="button" data-back>← Home</button>
          <div class="play__now">Now Playing</div>
        </header>

        <div class="play__deckStage" aria-hidden="true" data-deck>
          <!-- 기본 디스크(폴백). fly 디스크가 있으면 fly가 도킹되어 이 위로 올라옴 -->
          <div class="play__disc is-hidden" data-disc>
            <div class="play__discLabel" data-disc-label></div>
            <div class="play__discHole"></div>
          </div>
          <div class="play__tonearm"></div>
        </div>

        <div class="play__panel">
          <div class="play__panelCoverWrap">
            <img class="play__cover" alt="" />
          </div>

          <div class="play__meta">
            <h1 class="play__title">-</h1>
            <p class="play__sub">-</p>
            <div class="play__chips"></div>

            <div class="play__row">
              <span class="play__time" data-cur>0:00</span>
              <input class="play__seek" type="range" min="0" max="1" step="0.01" value="0" />
              <span class="play__time" data-dur>0:00</span>
            </div>

            <div class="play__controls">
              <button class="play__btn play__btn--primary" type="button" data-toggle>Play</button>

              <label class="play__vol">
                <span>Vol</span>
                <input class="play__volume" type="range" min="0" max="1" step="0.01" />
              </label>
            </div>
          </div>
        </div>
      </div>
    `;

    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    root.appendChild(audio);

    this._root = root;
    this._audio = audio;
    return root;
  }

  async afterMount() {
    const root = this._root;
    const audio = this._audio;

    // ====== layout vars ======
    applyDeckVars(root);

    const $deck = root.querySelector('[data-deck]');
    const $title = root.querySelector('.play__title');
    const $sub = root.querySelector('.play__sub');
    const $chips = root.querySelector('.play__chips');
    const $cover = root.querySelector('.play__cover');

    const $cur = root.querySelector('[data-cur]');
    const $dur = root.querySelector('[data-dur]');
    const $seek = root.querySelector('.play__seek');
    const $toggle = root.querySelector('[data-toggle]');
    const $vol = root.querySelector('.play__volume');
    const $back = root.querySelector('[data-back]');

    const $disc = root.querySelector('[data-disc]');
    const $discLabel = root.querySelector('[data-disc-label]');

    await preloadLibrary();

    const s0 = getState();
    const trackId = s0.currentTrackId;

    if (!trackId) {
      $title.textContent = '선택된 곡이 없습니다';
      $sub.textContent = '홈에서 트랙을 선택해 주세요.';
      $toggle.disabled = true;
      $seek.disabled = true;
      $back.addEventListener('click', () => navigateTo('/'));
      return;
    }

    const track = findTrackById(trackId);
    if (!track) {
      $title.textContent = '트랙을 찾을 수 없음';
      $sub.textContent = `id: ${trackId}`;
      return;
    }

    const genre = findGenreById(track.genreId);
    if (genre?.scene) setScene(genre.scene);

    // Jazz 전용 톤암
    const isJazz = String(track.genreId) === 'jazz' || /jazz/i.test(genre?.name || '');
    root.classList.toggle('is-jazz', isJazz);

    // ====== UI ======
    $title.textContent = track.title || '(untitled)';
    $sub.textContent = `${track.artist || '-'} · ${track.album || '-'}`;

    $chips.innerHTML = '';
    if (genre?.name) {
      const chip = document.createElement('span');
      chip.className = 'play__chip';
      chip.textContent = genre.name;
      $chips.appendChild(chip);
    }

    if (track.cover) {
      $cover.src = track.cover;
      $discLabel.style.backgroundImage = `url("${track.cover}")`;
    } else {
      $cover.removeAttribute('src');
      $discLabel.style.backgroundImage = '';
    }

    // =========================================================
    // ✅ Docking: Home에서 넘어온 #ui-disc-fly를 deck DOM 안으로 도킹
    // =========================================================
    let dockedFly = null; // 도킹 완료된 fly
    let dockingTimer = null;

    const activeDiscEl = () => dockedFly || $disc;

    const syncFlyLabel = (flyEl) => {
      const label = flyEl?.querySelector?.('.ui-disc-fly__label');
      if (!label) return;
      if (track.cover) label.style.backgroundImage = `url("${track.cover}")`;
      else label.style.backgroundImage = '';
    };

    const dockFlyNow = (flyEl) => {
      if (!flyEl) return;
      if (dockedFly === flyEl) return;

      // deck 안으로 넣고, deck에 딱 맞게 고정
      $deck.insertBefore(flyEl, $deck.firstChild);
      flyEl.classList.add('is-docked');

      // inline로도 확정(혹시 기존 inline이 남아도 확실하게)
      flyEl.style.transition = 'none';
      flyEl.style.position = 'absolute';
      flyEl.style.left = '0px';
      flyEl.style.top = '0px';
      flyEl.style.width = '100%';
      flyEl.style.height = '100%';
      flyEl.style.opacity = '1';
      flyEl.style.transform = 'rotate(0deg)';

      dockedFly = flyEl;

      // 기본 디스크는 폴백으로 남겨두되 숨김
      $disc.classList.add('is-hidden');
      $disc.classList.remove('is-spinning');
    };

    const moveFlyToDeckRect = (flyEl, { animate } = { animate: true }) => {
      if (!flyEl) return;
      if (flyEl.classList.contains('is-docked')) return;

      const r = $deck.getBoundingClientRect();

      if (!animate) {
        flyEl.style.transition = 'none';
        flyEl.style.left = `${r.left}px`;
        flyEl.style.top = `${r.top}px`;
        flyEl.style.width = `${r.width}px`;
        flyEl.style.height = `${r.height}px`;
        flyEl.style.opacity = '1';
        flyEl.style.transform = 'rotate(0deg)';
        return;
      }

      // 다음 프레임에 트랜지션 부여 후 목표 rect로 이동
      requestAnimationFrame(() => {
        flyEl.style.transition =
          'left 360ms cubic-bezier(.2,.9,.2,1), ' +
          'top 360ms cubic-bezier(.2,.9,.2,1), ' +
          'width 360ms cubic-bezier(.2,.9,.2,1), ' +
          'height 360ms cubic-bezier(.2,.9,.2,1), ' +
          'transform 360ms cubic-bezier(.2,.9,.2,1), ' +
          'opacity 180ms ease';

        flyEl.style.left = `${r.left}px`;
        flyEl.style.top = `${r.top}px`;
        flyEl.style.width = `${r.width}px`;
        flyEl.style.height = `${r.height}px`;
        flyEl.style.opacity = '1';
        flyEl.style.transform = 'rotate(0deg)';
      });

      // 타임아웃으로 도킹 확정(transitionend 미스 대비)
      clearTimeout(dockingTimer);
      dockingTimer = setTimeout(() => {
        dockFlyNow(flyEl);
        // 도킹 끝났으면 스핀 상태도 바로 맞춤
        setPlayingUI(Boolean(getState().isPlaying));
      }, 390);
    };

    // fly가 있으면 도킹 시도
    const fly = document.getElementById('ui-disc-fly');
    if (fly) {
      syncFlyLabel(fly);

      // 기본 디스크는 숨기고(폴백)
      $disc.classList.add('is-hidden');
      $disc.classList.remove('is-spinning');

      // fly가 이미 roll-in 후 play 중앙쯤에 있을 텐데, deck 위치로 “슬쩍” 맞춘 뒤 도킹
      moveFlyToDeckRect(fly, { animate: true });
    } else {
      // fly가 없으면 기본 디스크 사용
      $disc.classList.remove('is-hidden');
    }

    // ====== resize: deck vars 갱신 + (도킹 전 fly면) 계속 따라가게 ======
    const onResize = () => {
      applyDeckVars(root);

      const f = dockedFly ? null : document.getElementById('ui-disc-fly');
      if (f && !f.classList.contains('is-docked')) {
        // 도킹 전이라면 즉시 재정렬(튀는 애니메이션 방지)
        moveFlyToDeckRect(f, { animate: false });
      }
    };
    window.addEventListener('resize', onResize);

    // ====== audio ======
    audio.src = track.audio || '';
    audio.volume = clamp(Number(getState().masterVolume ?? 0.8), 0, 1);
    $vol.value = String(audio.volume);

    const resume = getState().lastPositions?.[String(trackId)] ?? 0;

    const onLoaded = () => {
      const dur = audio.duration || 0;
      $dur.textContent = fmtTime(dur);

      $seek.min = '0';
      $seek.max = String(dur || 0);
      $seek.step = '0.01';

      if (resume > 0 && resume < dur - 0.25) {
        audio.currentTime = resume;
      }
      onTime();
    };

    let lastSaved = -1;

    const onTime = () => {
      const t = audio.currentTime || 0;
      $cur.textContent = fmtTime(t);
      $seek.value = String(t);

      const sec = Math.floor(t);
      if (sec !== lastSaved) {
        lastSaved = sec;
        setTrackPosition(String(trackId), t);
      }
    };

    const setPlayingUI = (playing) => {
      $toggle.textContent = playing ? 'Pause' : 'Play';

      const discEl = activeDiscEl();
      discEl.classList.toggle('is-spinning', Boolean(playing));

      // 기본 디스크 쓰는 경우만 is-hidden 해제
      if (!dockedFly) {
        $disc.classList.toggle('is-hidden', false);
      }
    };

    const onToggle = async () => {
      try {
        if (audio.paused) {
          await audio.play();
          setState({ isPlaying: true });
          setPlayingUI(true);
        } else {
          audio.pause();
          setState({ isPlaying: false });
          setPlayingUI(false);
        }
      } catch {}
    };

    const onSeek = (e) => {
      const val = Number(e.target.value || 0);
      audio.currentTime = val;
      onTime();
      setTrackPosition(String(trackId), audio.currentTime);
    };

    const onVol = (e) => {
      const v = clamp(Number(e.target.value), 0, 1);
      audio.volume = v;
      setState({ masterVolume: v });
    };

    const onEnded = () => {
      setState({ isPlaying: false });
      setPlayingUI(false);
    };

    $back.addEventListener('click', () => navigateTo('/'));
    $toggle.addEventListener('click', onToggle);
    $seek.addEventListener('input', onSeek);
    $vol.addEventListener('input', onVol);

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);

    // 초기 UI/재생 상태 반영
    setPlayingUI(Boolean(getState().isPlaying));
    if (getState().isPlaying) {
      try { await audio.play(); } catch {}
    }

    this._cleanup = () => {
      clearTimeout(dockingTimer);
      window.removeEventListener('resize', onResize);

      audio.pause();
      setTrackPosition(String(trackId), audio.currentTime || 0);

      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);

      // 페이지 떠날 때 fly 디스크 정리(원하면 여기서 제거 안 해도 됨)
      const f = document.getElementById('ui-disc-fly');
      if (f) f.remove();
    };
  }

  beforeUnmount() {
    this._cleanup?.();
  }
}
