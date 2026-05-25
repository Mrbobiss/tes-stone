"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getProgressMap,
  getSavedSource,
  toggleFavorite,
  updateProgress,
  getFavorites,
} from "@/lib/reader-storage";
import { clamp } from "@/lib/utils";
import type { LibraryResponse } from "@/types/manga";

type ReaderShellProps = {
  initialSlug: string;
  initialSource?: string;
};

export function ReaderShell({ initialSlug, initialSource = "" }: ReaderShellProps) {
  const router = useRouter();
  const imageRefs = useRef<Array<HTMLElement | null>>([]);
  const restoredRef = useRef(false);
  const lastTapRef = useRef<Record<string, number>>({});

  const [library, setLibrary] = useState<LibraryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomedImageId, setZoomedImageId] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [favoriteVersion, setFavoriteVersion] = useState(0);

  useEffect(() => {
    async function loadReader() {
      const source = initialSource || getSavedSource();

      if (!source) {
        setError("Aucune bibliothèque active. Reviens à l'accueil pour coller ton lien Drive.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/library?folder=${encodeURIComponent(source)}`);
        const data = (await response.json()) as LibraryResponse | { error?: string };

        if (!response.ok) {
          throw new Error("error" in data ? data.error : "Impossible de charger le lecteur.");
        }

        setLibrary(data as LibraryResponse);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Erreur inconnue.");
      } finally {
        setLoading(false);
      }
    }

    void loadReader();
  }, [initialSource]);

  const volume = useMemo(
    () => library?.volumes.find((item) => item.slug === initialSlug) ?? null,
    [initialSlug, library],
  );

  const folderId = library?.folderId ?? "";

  const isFavorite = useMemo(() => {
    void favoriteVersion;

    if (!folderId || !volume) {
      return false;
    }

    return getFavorites(folderId).includes(volume.slug);
  }, [favoriteVersion, folderId, volume]);

  useEffect(() => {
    if (!library || !volume || restoredRef.current) {
      return;
    }

    restoredRef.current = true;
    const savedIndex = getProgressMap(library.folderId)[volume.slug] ?? 0;
    const nextIndex = clamp(savedIndex, 0, Math.max(0, volume.images.length - 1));
    setCurrentIndex(nextIndex);

    window.setTimeout(() => {
      imageRefs.current[nextIndex]?.scrollIntoView({ block: "start", behavior: "auto" });
    }, 180);
  }, [library, volume]);

  useEffect(() => {
    if (!library || !volume) {
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
  }, [library, volume]);

  useEffect(() => {
    if (!library || !volume) {
      return;
    }

    updateProgress(library.folderId, volume.slug, currentIndex);
  }, [currentIndex, library, volume]);

  useEffect(() => {
    if (!volume) {
      return;
    }

    const nextImage = volume.images[currentIndex + 1];
    if (!nextImage) {
      return;
    }

    const preload = new window.Image();
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
      setZoomedImageId((current) => (current === imageId ? null : imageId));
      lastTapRef.current[imageId] = 0;
      return;
    }

    lastTapRef.current[imageId] = now;
  }

  const progressPercent = volume
    ? Math.min(100, ((currentIndex + 1) / Math.max(1, volume.pageCount)) * 100)
    : 0;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-sm text-white/60">
        Chargement du lecteur...
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

  if (!library || !volume) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4">
        <div className="max-w-md rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          <p>Ce tome est introuvable ou la bibliothèque a changé.</p>
          <button
            type="button"
            onClick={() => router.push(`/?source=${encodeURIComponent(initialSource || library?.folderId || "")}`)}
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
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 px-3 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/?source=${encodeURIComponent(library.folderId)}`)}
              className="rounded-full border border-white/15 px-3 py-2 text-sm text-white transition hover:border-white/30"
            >
              ← Bibliothèque
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{volume.name}</p>
              <p className="text-xs text-white/50">
                Page {currentIndex + 1} / {volume.pageCount}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                toggleFavorite(library.folderId, volume.slug);
                setFavoriteVersion((value) => value + 1);
              }}
              className="rounded-full border border-white/15 px-3 py-2 text-sm text-white transition hover:border-fuchsia-400/40"
            >
              {isFavorite ? "★ Favori" : "☆ Favori"}
            </button>
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              className="rounded-full border border-white/15 px-3 py-2 text-sm text-white transition hover:border-white/30"
            >
              Plein écran
            </button>
            <button
              type="button"
              onClick={() => setControlsVisible(false)}
              className="rounded-full border border-white/15 px-3 py-2 text-sm text-white/80 transition hover:border-white/30"
            >
              Masquer l&apos;UI
            </button>
          </div>
        </header>
      ) : (
        <button
          type="button"
          onClick={() => setControlsVisible(true)}
          className="fixed right-4 top-4 z-40 rounded-full border border-white/15 bg-black/60 px-4 py-2 text-sm text-white backdrop-blur"
        >
          Afficher l&apos;UI
        </button>
      )}

      <section className="mx-auto flex max-w-5xl flex-col bg-black pb-24">
        {volume.images.map((image, index) => {
          const zoomed = zoomedImageId === image.id;

          return (
            <figure
              key={image.id}
              ref={(node) => {
                imageRefs.current[index] = node;
              }}
              data-index={index}
              className="relative scroll-mt-24 bg-black"
            >
              <div className={zoomed ? "hide-scrollbar overflow-x-auto" : undefined}>
                <img
                  src={image.imageUrl}
                  alt={`${volume.name} page ${index + 1}`}
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index < 2 ? "high" : "auto"}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  onPointerUp={() => handleImageTap(image.id)}
                  onDoubleClick={() => setZoomedImageId((current) => (current === image.id ? null : image.id))}
                  className={`mx-auto block h-auto bg-black object-contain select-none ${
                    zoomed
                      ? "w-[160vw] max-w-none cursor-zoom-out"
                      : "w-full max-w-[960px] cursor-zoom-in"
                  }`}
                />
              </div>
              <figcaption className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] text-white/70 backdrop-blur">
                {index + 1}
              </figcaption>
            </figure>
          );
        })}
      </section>

      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => jumpToIndex(currentIndex - 1)}
          className="rounded-full border border-white/15 bg-black/60 px-4 py-2 text-sm text-white backdrop-blur transition hover:border-white/30"
        >
          ↑ Précédente
        </button>
        <button
          type="button"
          onClick={() => jumpToIndex(currentIndex + 1)}
          className="rounded-full border border-white/15 bg-black/60 px-4 py-2 text-sm text-white backdrop-blur transition hover:border-white/30"
        >
          ↓ Suivante
        </button>
      </div>
    </main>
  );
}
