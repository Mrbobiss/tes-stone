"use client";

import { formatHistoryDate, type LocalResultEntry } from "@/lib/local-results";

interface PersonalRankingProps {
  entries: LocalResultEntry[];
}

function getRanking(entries: LocalResultEntry[]) {
  return [...entries]
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.createdAt.localeCompare(left.createdAt);
    })
    .slice(0, 5);
}

export function PersonalRanking({ entries }: PersonalRankingProps) {
  const ranking = getRanking(entries);

  return (
    <div className="space-y-4 rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Top du cosmos</p>
          <h3 className="mt-2 text-xl font-bold text-zinc-950">Tes vibes les plus mémorables</h3>
        </div>
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-right text-rose-700">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-500">Record perso</p>
          <p className="mt-1 text-2xl font-black">{ranking[0]?.score ?? "--"}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
        Ce podium reste privé sur cet appareil. Personne ne voit ton plus beau départ en orbite à part toi et les gens à qui tu l’envoies.
      </div>

      {ranking.length ? (
        <div className="space-y-3">
          {ranking.map((entry, index) => {
            const medal = ["🥇", "🥈", "🥉"][index] ?? `#${index + 1}`;
            const spotlight = index === 0;

            return (
              <div
                key={entry.id}
                className={[
                  "rounded-3xl border p-4 transition",
                  spotlight ? "border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50" : "border-zinc-200 bg-white",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">{medal}</div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{formatHistoryDate(entry.createdAt)}</p>
                      <p className="mt-2 text-base font-semibold text-zinc-950">{entry.badge}</p>
                      <p className="mt-1 text-sm text-zinc-600">
                        {entry.modeLabel} · {entry.level}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black leading-none text-zinc-950">{entry.score}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">/100</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
          Pas encore de podium. Ton prochain stonomètre peut prendre directement la première place, ce qui est pratique, même si ça flotte déjà beaucoup.
        </div>
      )}
    </div>
  );
}
