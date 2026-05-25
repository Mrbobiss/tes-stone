"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { VolumeCard } from "@/components/volume-card";
import { getFavorites, getLastVolume, getProgressMap, toggleFavorite } from "@/lib/reader-storage";
import { naturalCompare } from "@/lib/utils";
import type { LibraryResponse } from "@/types/manga";

type LibraryShellProps = {
  initialSource?: string;
};

export function LibraryShell({ initialSource = "" }: LibraryShellProps) {
  const didBootRef = useRef(false);
  const [library, setLibrary] = useState<LibraryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [storageVersion, setStorageVersion] = useState(0);

  async function loadLibrary(sourceValue: string) {
    const cleaned = sourceValue.trim();

    if (!cleaned) {
      setError("La bibliothèque est introuvable.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/library?folder=${encodeURIComponent(cleaned)}`);
      const data = (await response.json()) as LibraryResponse | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Impossible de charger la bibliothèque.");
      }

      setLibrary(data as LibraryResponse);
      setStorageVersion((value) => value + 1);
    } catch (caughtError) {
      setLibrary(null);
      setError(caughtError instanceof Error ? caughtError.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (didBootRef.current) {
      return;
    }

    didBootRef.current = true;

    if (initialSource) {
      void loadLibrary(initialSource);
    }
  }, [initialSource]);

  const folderId = library?.folderId ?? "";

  const favorites = useMemo(() => {
    void storageVersion;
    return folderId ? new Set(getFavorites(folderId)) : new Set<string>();
  }, [folderId, storageVersion]);

  const progressMap = useMemo(() => {
    void storageVersion;
    return folderId ? getProgressMap(folderId) : {};
  }, [folderId, storageVersion]);

  const currentSlug = folderId ? getLastVolume(folderId) : "";

  const sortedVolumes = useMemo(() => {
    if (!library) {
      return [];
    }

    return [...library.volumes].sort((left, right) => {
      const currentDiff = Number(right.slug === currentSlug) - Number(left.slug === currentSlug);
      if (currentDiff) {
        return currentDiff;
      }

      const favoriteDiff = Number(favorites.has(right.slug)) - Number(favorites.has(left.slug));
      if (favoriteDiff) {
        return favoriteDiff;
      }

      return naturalCompare(left.name, right.name);
    });
  }, [currentSlug, favorites, library]);

  const continueVolume = library?.volumes.find((volume) => volume.slug === currentSlug) ?? null;
  const continuePage = continueVolume ? (progressMap[continueVolume.slug] ?? 0) + 1 : 1;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-black/30 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-fuchsia-200">
                Bibliothèque manga
              </span>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  Tous les tomes, directement dans l&apos;app.
                </h1>
                <p className="max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                  Parcours la collection, reprends instantanément ta lecture, puis ouvre chaque tome au clic avec un chargement discret en arrière-plan.
                </p>
              </div>
            </div>

            {continueVolume ? (
              <Link
                href={`/read/${continueVolume.slug}?source=${encodeURIComponent(library?.folderId ?? "")}`}
                className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-3 text-sm font-medium text-fuchsia-100 transition hover:border-fuchsia-300/60 hover:bg-fuchsia-500/20"
              >
                Reprendre {continueVolume.name}, page {continuePage}
              </Link>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/45">
            <span className="rounded-full border border-white/10 px-3 py-1">Tomes organisés automatiquement</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Lecture verticale mobile</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Progression mémorisée</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Ouverture au clic</span>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </p>
          ) : null}
        </section>

        {library ? (
          <section className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-white/45">Collection</p>
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">{library.title}</h2>
              </div>
              <div className="text-sm text-white/55">{library.volumes.length} tomes disponibles</div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sortedVolumes.map((volume) => {
                const savedPageIndex = progressMap[volume.slug];
                const currentPage = typeof savedPageIndex === "number" ? savedPageIndex + 1 : 0;
                const progressPercent =
                  typeof savedPageIndex === "number" && volume.pageCount > 0
                    ? Math.min(100, ((savedPageIndex + 1) / volume.pageCount) * 100)
                    : 0;

                return (
                  <VolumeCard
                    key={volume.id}
                    folderId={library.folderId}
                    volume={volume}
                    progressPercent={progressPercent}
                    currentPage={currentPage}
                    isFavorite={favorites.has(volume.slug)}
                    isCurrent={volume.slug === currentSlug}
                    onToggleFavorite={() => {
                      toggleFavorite(library.folderId, volume.slug);
                      setStorageVersion((value) => value + 1);
                    }}
                  />
                );
              })}
            </div>
          </section>
        ) : (
          <section className="rounded-[28px] border border-dashed border-white/10 bg-black/20 p-6 text-sm leading-6 text-white/55">
            {loading ? "Préparation de la bibliothèque..." : "La bibliothèque arrive."}
          </section>
        )}
      </div>
    </main>
  );
}
