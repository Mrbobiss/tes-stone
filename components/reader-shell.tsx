"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getFavorites, getProgressMap, toggleFavorite, updateProgress } from "@/lib/reader-storage";
import { clamp } from "@/lib/utils";
import type { Volume, VolumeResponse } from "@/types/manga";

type ReaderShellProps = {
  initialSlug: string;
  initialSource?: string;
};

export function ReaderShell({ initialSlug, initialSource = "" }: ReaderShellProps) {
  const router = useRouter();
  const imageRefs = useRef<Array<HTMLElement | null>>([]);
  const restoredRef = useRef(false);
  const lastTapRef = useRef<Record<string, number>>({});

  const [folderId, setFolderId] = useState("");
  const [seriesTitle, setSeriesTitle] = useState("");
  const [volume, setVolume] = useState<Volume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [favoriteVersion, setFavoriteVersion] = useState(0);

  useEffect(() => {
    async function loadReader() {
      const source = initialSource.trim();

      if (!source) {
        setError("Aucune bibliothèque active n'a été trouvée.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/volume?source=${encodeURIComponent(source)}&slug=${encodeURIComponent(initialSlug)}`,
        );
        const data = (await response.json()) as VolumeResponse | { error?: string };

        if (!response.ok) {
          throw new Error("error" in data ? data.error : "Impossible de charger le lecteur.");
        }

        const payload = data as VolumeResponse;
        setFolderId(payload.folderId);
        setSeriesTitle(payload.title);
        setVolume(payload.volume);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Erreur inconnue.");
      } finally {
        setLoading(false);
      }
    }

    void loadReader();
  }, [initialSlug, initialSource]);

  const isFavorite = useMemo(() => {
    void favoriteVersion;

    if (!folderId || !volume) {
      return false;
    }

    return getFavorites(folderId).includes(volume.slug);
  }, [favoriteVersion, folderId, volume]);

  useEffect(() => {
    restoredRef.current = false;
  }, [volume?.slug]);

  useEffect(() => {
    if (!folderId || !volume || restoredRef.current) {
      return;
    }

    restoredRef.current = true;
    const savedIndex = getProgressMap(folderId)[volume.slug] ?? 0;
    const nextIndex = clamp(savedIndex, 0, Math.max(0, volume.images.length - 1));
    setCurrentIndex(nextIndex);

    window.setTimeout(() => {
      imageRefs.current[nextIndex]?.scrollIntoView({ block: "start", behavior: "auto" });
    }, 180);
  }, [folderId, volume]);

  useEffect(() => {
    if (!volume) {
      return;
    }

    const elements = imageRefs.current.filter(Boolean) as HTMLElement[];
    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (!visibleEntry) {
          return;
        }

        const nextIndex = Number(visibleEntry.target.getAttribute("data-index") ?? 0);
        setCurrentIndex((previous) => (previous === nextIndex ? previous : nextIndex));
      },
      {
        threshold: [0.35, 0.55, 0.75, 0.9],
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [volume]);

  useEffect(() => {
    if (!folderId || !volume) {
      return;
    }

    updateProgress(folderId, volume.slug, currentIndex);
  }, [currentIndex, folderId, volume]);

  useEffect(() => {
    if (!volume) {
      return;
    }

    const nextImage = volume.images[currentIndex + 1];
    if (!nextImage) {
      return;
    }

    const preload = new window.Image();
    preload.referrerPolicy = "no-referrer";
    preload.src = nextImage.imageUrl;
  }, [currentIndex, volume]);

  const jumpToIndex = useCallback(
    (targetIndex: number) => {
      if (!volume) {
        return;
      }

      const nextIndex = clamp(targetIndex, 0, volume.images.length - 1);
      setCurrentIndex(nextIndex);
      imageRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [volume],
  );

  const toggleFullscreen = useCallback(async () => {
    if (typeof document === "undefined") {
      return;
    }

    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      return;
    }

    await document.exitFullscreen();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!volume) {
        return;
      }

      if (["ArrowDown", "PageDown", "j", "J", " "].includes(event.key)) {
        event.preventDefault();
        jumpToIndex(currentIndex + 1);
      }

      if (["ArrowUp", "PageUp", "k", "K"].includes(event.key)) {
        event.preventDefault();
        jumpToIndex(currentIndex - 1);
      }

      if (event.key === "f" || event.key === "F") {
        event.preventDefault();
        void toggleFullscreen();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentIndex, jumpToIndex, toggleFullscreen, volume]);

  function handleImageTap(imageId: string) {
    const now = Date.now();
    const previous = lastTapRef.current[imageId] ?? 0;

    if (now - previous < 260) {
      setZoomLevel((current) => {
        if (current < 1.25) {
          return 1.25;
        }

        if (current < 1.5) {
          return 1.5;
        }

        return 1;
      });
      lastTapRef.current[imageId] = 0;
      return;
    }

    lastTapRef.current[imageId] = now;
  }

  const pageTotal = typeof volume?.pageCount === "number" ? volume.pageCount : 0;

  const progressPercent = volume
    ? Math.min(100, ((currentIndex + 1) / Math.max(1, pageTotal)) * 100)
    : 0;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-sm text-white/60">
        Ouverture du tome...
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4">
        <div className="max-w-md rounded-[28px] border border-rose-400/25 bg-rose-500/10 p-6 text-sm text-rose-100">
          <p>{error}</p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-full border border-white/15 px-4 py-2 text-white transition hover:border-white/35"
          >
            Retour à la bibliothèque
          </Link>
        </div>
      </main>
    );
  }

  if (!volume) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4">
        <div className="max-w-md rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          <p>Ce tome est introuvable ou la bibliothèque a changé.</p>
          <button
            type="button"
            onClick={() => router.push(`/?source=${encodeURIComponent(initialSource || folderId || "")}`)}
            className="mt-4 rounded-full border border-white/15 px-4 py-2 text-white transition hover:border-white/35"
          >
            Retour à la bibliothèque
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div
        className="fixed left-0 top-0 z-50 h-1 bg-gradient-to-r from-fuchsia-500 via-violet-400 to-cyan-400 transition-[width] duration-200"
        style={{ width: `${progressPercent}%` }}
      />

      {controlsVisible ? (
        <div
          className="fixed inset-x-0 top-0 z-40 px-3 pb-2 pt-3"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <div className="mx-auto flex max-w-5xl items-start gap-2">
            <button
              type="button"
              onClick={() => router.push(`/?source=${encodeURIComponent(folderId)}`)}
              className="pointer-events-auto rounded-full border border-white/10 bg-black/55 px-3 py-2 text-sm font-medium text-white/90 shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-white/20 hover:bg-black/70"
              aria-label="Retour à la bibliothèque"
            >
              ←
            </button>

            <div className="pointer-events-auto min-w-0 flex-1 rounded-[22px] border border-white/10 bg-black/55 px-4 py-2 shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <p className="truncate text-[11px] uppercase tracking-[0.24em] text-white/45">{seriesTitle}</p>
              <p className="truncate text-sm font-semibold text-white">{volume.name}</p>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-white/55">
                <span>
                  {currentIndex + 1} / {pageTotal}
                </span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>{Math.round(progressPercent)}%</span>
              </div>
            </div>

            <div className="pointer-events-auto flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/55 px-2 py-1 text-xs text-white/85 shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => setZoomLevel((current) => Math.max(1, Number((current - 0.15).toFixed(2))))}
                  className="rounded-full px-2 py-1 transition hover:bg-white/10"
                  aria-label="Réduire le zoom"
                  title="Réduire le zoom"
                >
                  −
                </button>
                <span className="min-w-11 text-center">{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((current) => Math.min(1.8, Number((current + 0.15).toFixed(2))))}
                  className="rounded-full px-2 py-1 transition hover:bg-white/10"
                  aria-label="Augmenter le zoom"
                  title="Augmenter le zoom"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  toggleFavorite(folderId, volume.slug);
                  setFavoriteVersion((value) => value + 1);
                }}
                className="rounded-full border border-white/10 bg-black/55 px-3 py-2 text-sm text-white/85 shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-fuchsia-400/40 hover:bg-black/70"
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                {isFavorite ? "★" : "☆"}
              </button>
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className="rounded-full border border-white/10 bg-black/55 px-3 py-2 text-sm text-white/85 shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-white/20 hover:bg-black/70"
                aria-label="Plein écran"
                title="Plein écran"
              >
                ⤢
              </button>
              <button
                type="button"
                onClick={() => setControlsVisible(false)}
                className="rounded-full border border-white/10 bg-black/55 px-3 py-2 text-sm text-white/85 shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-white/20 hover:bg-black/70"
                aria-label="Masquer l'interface"
                title="Masquer l'interface"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setControlsVisible(true)}
          className="fixed right-4 top-4 z-40 rounded-full border border-white/10 bg-black/55 px-4 py-2 text-sm text-white/90 shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-white/20 hover:bg-black/70"
          style={{ top: "max(1rem, env(safe-area-inset-top))" }}
        >
          UI
        </button>
      )}

      <section className="mx-auto flex max-w-5xl flex-col bg-black pb-10">
        {volume.images.map((image, index) => {
          return (
            <figure
              key={image.id}
              ref={(node) => {
                imageRefs.current[index] = node;
              }}
              data-index={index}
              className="relative scroll-mt-24 bg-black"
            >
              <div className={zoomLevel > 1 ? "hide-scrollbar overflow-x-auto" : undefined}>
                <img
                  src={image.imageUrl}
                  alt={`${volume.name} page ${index + 1}`}
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index < 2 ? "high" : "auto"}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  onPointerUp={() => handleImageTap(image.id)}
                  onDoubleClick={() =>
                    setZoomLevel((current) => {
                      if (current < 1.25) {
                        return 1.25;
                      }

                      if (current < 1.5) {
                        return 1.5;
                      }

                      return 1;
                    })
                  }
                  className={`mx-auto block h-auto bg-black object-contain select-none ${
                    zoomLevel > 1 ? "max-w-none" : "w-full max-w-[960px]"
                  }`}
                  style={
                    zoomLevel > 1
                      ? { width: `${Math.round(zoomLevel * 100)}%`, minWidth: `${Math.round(zoomLevel * 100)}%` }
                      : undefined
                  }
                />
              </div>
              <figcaption className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] text-white/70 backdrop-blur">
                {index + 1}
              </figcaption>
            </figure>
          );
        })}
      </section>
    </main>
  );
}
