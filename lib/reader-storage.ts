import type { ProgressMap } from "@/types/manga";

const LAST_SOURCE_KEY = "manga-reader:last-source";

function progressKey(folderId: string) {
  return `manga-reader:progress:${folderId}`;
}

function lastVolumeKey(folderId: string) {
  return `manga-reader:last-volume:${folderId}`;
}

function favoritesKey(folderId: string) {
  return `manga-reader:favorites:${folderId}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getSavedSource(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(LAST_SOURCE_KEY) ?? "";
}

export function setSavedSource(source: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LAST_SOURCE_KEY, source);
}

export function getProgressMap(folderId: string): ProgressMap {
  return readJson<ProgressMap>(progressKey(folderId), {});
}

export function updateProgress(folderId: string, volumeSlug: string, pageIndex: number) {
  const progress = getProgressMap(folderId);
  progress[volumeSlug] = pageIndex;
  writeJson(progressKey(folderId), progress);
  setLastVolume(folderId, volumeSlug);
}

export function getLastVolume(folderId: string): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(lastVolumeKey(folderId)) ?? "";
}

export function setLastVolume(folderId: string, volumeSlug: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(lastVolumeKey(folderId), volumeSlug);
}

export function getFavorites(folderId: string): string[] {
  return readJson<string[]>(favoritesKey(folderId), []);
}

export function toggleFavorite(folderId: string, volumeSlug: string): string[] {
  const current = new Set(getFavorites(folderId));

  if (current.has(volumeSlug)) {
    current.delete(volumeSlug);
  } else {
    current.add(volumeSlug);
  }

  const next = Array.from(current);
  writeJson(favoritesKey(folderId), next);
  return next;
}
