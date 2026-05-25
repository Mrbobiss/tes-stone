/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import type { Volume } from "@/types/manga";

type VolumeCardProps = {
  folderId: string;
  volume: Volume;
  progressPercent: number;
  currentPage: number;
  isFavorite: boolean;
  isCurrent: boolean;
  onToggleFavorite: () => void;
};

export function VolumeCard({
  folderId,
  volume,
  progressPercent,
  currentPage,
  isFavorite,
  isCurrent,
  onToggleFavorite,
}: VolumeCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-sm transition hover:-translate-y-1 hover:border-fuchsia-400/40">
      <button
        type="button"
        onClick={onToggleFavorite}
        className="absolute right-3 top-3 z-10 rounded-full border border-white/10 bg-black/65 px-3 py-1 text-sm text-white/80 transition hover:border-fuchsia-400/50 hover:text-white"
        aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        {isFavorite ? "★" : "☆"}
      </button>

      <Link href={`/read/${volume.slug}?source=${encodeURIComponent(folderId)}`} className="block">
        <div className="aspect-[3/4] overflow-hidden bg-neutral-900">
          {volume.coverImage ? (
            <img
              src={volume.coverImage.thumbnailUrl ?? volume.coverImage.imageUrl}
              alt={`Couverture ${volume.name}`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-neutral-900 text-sm text-white/45">
              Pas de couverture
            </div>
          )}
        </div>

        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/45">
              {isCurrent ? <span className="text-fuchsia-300">Reprendre</span> : null}
              <span>{volume.pageCount} pages</span>
            </div>
            <h2 className="line-clamp-2 text-lg font-semibold text-white">{volume.name}</h2>
          </div>

          <div className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-400 to-cyan-400 transition-[width]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>{Math.round(progressPercent)}%</span>
              <span>{currentPage > 0 ? `Page ${currentPage}` : "Non commencé"}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
