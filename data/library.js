// src/data/library.js
let cache = null;

export async function preloadLibrary() {
  if (cache) return cache;

  const candidates = [
    './src/data/library.json',
    './data/library.json',
    './library.json',
  ];

  let lastErr = null;
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      cache = await res.json();
      return cache;
    } catch (e) {
      lastErr = e;
    }
  }

  throw new Error(`Failed to load library.json. Last error: ${String(lastErr?.message || lastErr)}`);
}

export function getLibrary() {
  return cache;
}

export function findTrackById(id) {
  return cache?.tracks?.find((t) => String(t.id) === String(id)) || null;
}

export function findGenreById(id) {
  return cache?.genres?.find((g) => String(g.id) === String(id)) || null;
}
