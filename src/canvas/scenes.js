// /canvas/scenes.js
import { setState } from '../core/store.js';

/** 기본 프리셋(원하면 수치만 조절하면 됨) */
const scenePresets = {
  home:     { sceneName: 'home',     sceneSpeed: 0.8, sceneIntensity: 0.45 },
  jazz:     { sceneName: 'jazz',     sceneSpeed: 0.8, sceneIntensity: 0.65 },
  classic:  { sceneName: 'classic',  sceneSpeed: 0.7, sceneIntensity: 0.55 },
  lofi:     { sceneName: 'lofi',     sceneSpeed: 0.6, sceneIntensity: 0.60 },
  hardrock: { sceneName: 'hardrock', sceneSpeed: 1.2, sceneIntensity: 0.90 },
  pop:      { sceneName: 'pop',      sceneSpeed: 1.0, sceneIntensity: 0.85 },
  default:  { sceneName: 'default',  sceneSpeed: 0.7, sceneIntensity: 0.40 },
};

export function setScene(sceneKey) {
  const preset = scenePresets[sceneKey] || scenePresets.default;
  setState(preset);
}

/** 씬별 내부 상태 저장 */
const S = new Map();

function getS(name, initFn) {
  if (!S.has(name)) S.set(name, initFn());
  return S.get(name);
}

/** 고정 랜덤(프레임마다 깜빡이지 않게) */
function makeRng(seed = 1234567) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function clear(ctx, w, h, fill) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function vignette(ctx, w, h, strength = 0.8) {
  const g = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.2, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
  g.addColorStop(0, `rgba(0,0,0,0)`);
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** 공통: 부채꼴 라이트 */
function spotlight(ctx, w, h, opts) {
  const {
    cx = w * 0.5,
    top = h * 0.05,
    width = w * 0.55,
    height = h * 0.9,
    color = 'rgba(255, 220, 140, 0.20)',
    blur = 60
  } = opts || {};

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.filter = `blur(${blur}px)`;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.quadraticCurveTo(cx - width * 0.5, height * 0.55, cx - width * 0.45, height);
  ctx.lineTo(cx + width * 0.45, height);
  ctx.quadraticCurveTo(cx + width * 0.5, height * 0.55, cx, top);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** -----------------------------
 *  HOME
 ------------------------------*/
function drawHome(ctx, st, w, h, dt, t) {
  clear(ctx, w, h, '#0b0b10');
  spotlight(ctx, w, h, { color: 'rgba(255, 230, 160, 0.10)', blur: 80, width: w * 0.58 });

  // 아주 은은한 먼지
  const s = getS('home', () => {
    const rng = makeRng(11);
    const dust = Array.from({ length: 90 }, () => ({
      x: rng() * w, y: rng() * h, r: 0.6 + rng() * 1.6, a: 0.10 + rng() * 0.25, vx: (rng() - 0.5) * 6, vy: (rng() - 0.5) * 6
    }));
    return { dust, rng };
  });

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (const p of s.dust) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
    if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
    ctx.globalAlpha = p.a;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.fill();
  }
  ctx.restore();

  vignette(ctx, w, h, 0.75);
}

/** -----------------------------
 *  JAZZ (phonograph)
 ------------------------------*/
function drawJazz(ctx, st, w, h, dt, t) {
  clear(ctx, w, h, '#070606');
  spotlight(ctx, w, h, { color: 'rgba(255, 205, 120, 0.18)', blur: 90, width: w * 0.65 });

  const s = getS('jazz', () => {
    const rng = makeRng(21);
    const dust = Array.from({ length: 120 }, () => ({
      x: rng() * w, y: rng() * h, r: 0.4 + rng() * 1.2, a: 0.08 + rng() * 0.18, vx: (rng() - 0.5) * 10, vy: (rng() - 0.5) * 10
    }));
    return { dust, rng };
  });

  // 축음기 혼(심플 실루엣)
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = 'rgba(255, 220, 160, 0.35)';
  ctx.lineWidth = 2;
  const hornX = w * 0.72, hornY = h * 0.58;
  ctx.beginPath();
  ctx.ellipse(hornX, hornY, w * 0.13, h * 0.09, -0.25, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(hornX - w * 0.13, hornY);
  ctx.quadraticCurveTo(w * 0.62, h * 0.60, w * 0.54, h * 0.70);
  ctx.stroke();
  ctx.restore();

  // 먼지
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (const p of s.dust) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
    if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
    ctx.globalAlpha = p.a;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.fill();
  }
  ctx.restore();

  vignette(ctx, w, h, 0.82);
}

/** -----------------------------
 *  CLASSIC (orchestra)
 ------------------------------*/
function drawClassic(ctx, st, w, h, dt, t) {
  clear(ctx, w, h, '#070b12');
  spotlight(ctx, w, h, { color: 'rgba(210, 230, 255, 0.10)', blur: 100, width: w * 0.52 });

  // 오선(곡선)
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = 'rgba(255,255,255,0.40)';
  ctx.lineWidth = 1.2;
  for (let k = 0; k < 5; k++) {
    const y0 = h * 0.35 + k * 16;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 24) {
      const y = y0 + Math.sin((x / w) * Math.PI * 2 + t * 0.6) * 12;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();

  // 음표(점 + 꼬리)
  const s = getS('classic', () => {
    const rng = makeRng(31);
    const notes = Array.from({ length: 22 }, () => ({
      x: rng() * w, y: h * (0.25 + rng() * 0.55), vy: 6 + rng() * 14, a: 0.10 + rng() * 0.18
    }));
    return { notes, rng };
  });

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  for (const n of s.notes) {
    n.y -= n.vy * dt * (st.sceneSpeed || 1);
    if (n.y < -40) { n.y = h + 40; n.x = s.rng() * w; }

    ctx.globalAlpha = n.a;
    ctx.beginPath(); // head
    ctx.ellipse(n.x, n.y, 7, 5, -0.3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath(); // stem
    ctx.moveTo(n.x + 6, n.y - 2);
    ctx.lineTo(n.x + 6, n.y - 28);
    ctx.stroke();
  }
  ctx.restore();

  vignette(ctx, w, h, 0.78);
}

/** -----------------------------
 *  LOFI (rain window + gentle ripples)
 ------------------------------*/
function drawLofi(ctx, st, w, h, dt, t) {
  // 배경 그라데이션
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#0a0f18');
  g.addColorStop(1, '#0b1a22');
  clear(ctx, w, h, g);

  // 창문 빗방울
  const s = getS('lofi', () => {
    const rng = makeRng(41);
    const drops = Array.from({ length: 140 }, () => ({
      x: rng() * w,
      y: rng() * h,
      len: 12 + rng() * 34,
      sp: 60 + rng() * 140,
      a: 0.03 + rng() * 0.06
    }));
    return { drops, rng, rippleT: 0 };
  });

  ctx.save();
  ctx.strokeStyle = 'rgba(210,235,255,0.55)';
  for (const d of s.drops) {
    d.y += d.sp * dt * (0.8 + (st.sceneIntensity || 1) * 0.4);
    if (d.y > h + 60) { d.y = -60; d.x = s.rng() * w; }
    ctx.globalAlpha = d.a;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x, d.y + d.len);
    ctx.stroke();
  }
  ctx.restore();

  // 보케
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = 'blur(1px)';
  for (let i = 0; i < 10; i++) {
    const x = (i / 10) * w + Math.sin(t * 0.25 + i) * 40;
    const y = h * 0.22 + Math.cos(t * 0.22 + i) * 30;
    const r = 30 + i * 3;
    ctx.globalAlpha = 0.035;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200,220,255,1)';
    ctx.fill();
  }
  ctx.restore();

  // 잔잔한 물결(리플)
  s.rippleT += dt * 0.9;
  const ripple = (Math.sin(s.rippleT) + 1) * 0.5;
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.strokeStyle = 'rgba(180,210,255,0.50)';
  ctx.lineWidth = 1;
  for (let k = 0; k < 3; k++) {
    const rr = (Math.min(w, h) * (0.18 + k * 0.12)) * (0.9 + ripple * 0.25);
    ctx.beginPath();
    ctx.ellipse(w * 0.45, h * 0.72, rr * 1.2, rr * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  vignette(ctx, w, h, 0.72);
}

/** -----------------------------
 *  HARDROCK (sharp waveform)
 ------------------------------*/
function drawHardrock(ctx, st, w, h, dt, t) {
  clear(ctx, w, h, '#050507');

  const inten = st.sceneIntensity ?? 0.9;
  const speed = st.sceneSpeed ?? 1.2;

  // 붉은 글로우
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = 'blur(18px)';
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = 'rgba(255, 60, 60, 1)';
  ctx.fillRect(0, h * 0.45, w, h * 0.1);
  ctx.restore();

  // 톱니 파형
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 2;

  const mid = h * 0.52;
  const amp = (h * 0.12) * (0.6 + inten * 0.7);
  const seg = 18;

  ctx.beginPath();
  for (let x = 0; x <= w; x += seg) {
    const tri = ((x / seg) % 2 === 0) ? 1 : -1;
    const y = mid + tri * amp * (0.65 + 0.35 * Math.sin(t * speed * 2 + x * 0.01));
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();

  // 스파이크
  const s = getS('hardrock', () => {
    const rng = makeRng(51);
    const spikes = Array.from({ length: 60 }, () => ({ x: rng() * w, y: rng() * h, h: 10 + rng() * 60, a: 0.08 + rng() * 0.16 }));
    return { spikes, rng };
  });

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(255, 60, 60, 0.75)';
  ctx.lineWidth = 1;
  for (const sp of s.spikes) {
    sp.x += (40 + inten * 90) * dt * speed;
    if (sp.x > w + 20) { sp.x = -20; sp.y = s.rng() * h; sp.h = 10 + s.rng() * 60; sp.a = 0.08 + s.rng() * 0.16; }
    ctx.globalAlpha = sp.a;
    ctx.beginPath();
    ctx.moveTo(sp.x, sp.y);
    ctx.lineTo(sp.x, sp.y - sp.h);
    ctx.stroke();
  }
  ctx.restore();

  vignette(ctx, w, h, 0.85);
}

/** -----------------------------
 *  POP (pop-art)
 ------------------------------*/
function drawPop(ctx, st, w, h, dt, t) {
  // 밝은 톤 배경 + 도트
  clear(ctx, w, h, '#0b0b10');

  const s = getS('pop', () => {
    const rng = makeRng(61);
    const stickers = Array.from({ length: 10 }, () => ({
      x: rng() * w, y: rng() * h,
      r: 18 + rng() * 40,
      vx: (rng() - 0.5) * 40,
      vy: (rng() - 0.5) * 30
    }));
    return { stickers, rng };
  });

  // 하프톤 도트
  ctx.save();
  ctx.globalAlpha = 0.14;
  for (let y = 0; y < h; y += 24) {
    for (let x = 0; x < w; x += 24) {
      const rr = 2 + (Math.sin((x + y) * 0.02 + t) + 1) * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, rr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fill();
    }
  }
  ctx.restore();

  // 코믹 버스트(중앙)
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = 'rgba(255, 230, 80, 0.9)';
  ctx.lineWidth = 2;
  const cx = w * 0.5, cy = h * 0.45;
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + Math.sin(t * 0.6) * 0.02;
    const r1 = 40, r2 = 180 + Math.sin(t + i) * 10;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }
  ctx.restore();

  // 스티커 도형 둥둥
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const p of s.stickers) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.x < -60) p.x = w + 60;
    if (p.x > w + 60) p.x = -60;
    if (p.y < -60) p.y = h + 60;
    if (p.y > h + 60) p.y = -60;

    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 80, 170, 1)';
    ctx.fill();

    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.arc(p.x + 40, p.y + 20, p.r * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(80, 220, 255, 1)';
    ctx.fill();
  }
  ctx.restore();

  vignette(ctx, w, h, 0.65);
}

/** -----------------------------
 *  DEFAULT
 ------------------------------*/
function drawDefault(ctx, st, w, h) {
  clear(ctx, w, h, '#0b0b10');
  vignette(ctx, w, h, 0.8);
}

export function drawScene(ctx, state, dt, t) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  const scene = state.sceneName || 'default';

  switch (scene) {
    case 'home':     return drawHome(ctx, state, w, h, dt, t);
    case 'jazz':     return drawJazz(ctx, state, w, h, dt, t);
    case 'classic':  return drawClassic(ctx, state, w, h, dt, t);
    case 'lofi':     return drawLofi(ctx, state, w, h, dt, t);
    case 'hardrock': return drawHardrock(ctx, state, w, h, dt, t);
    case 'pop':      return drawPop(ctx, state, w, h, dt, t);
    default:         return drawDefault(ctx, state, w, h, dt, t);
  }
}
