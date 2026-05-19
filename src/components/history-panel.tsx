"use client";

import { formatHistoryDate, type LocalResultEntry } from "@/lib/local-results";

interface HistoryPanelProps {
  entries: LocalResultEntry[];
  streak: number;
  averageScore: number;
  uniqueModes: number;
}

export function HistoryPanel({ entries, streak, averageScore, uniqueModes }: HistoryPanelProps) {
  const latestEntries = entries.slice(0, 5);

  return (
    <div className="space-y-4 rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Ton journal planant</p>
          <h3 className="mt-2 text-xl font-bold text-zinc-950">Tes derniers stonomètres, au même endroit</h3>
        </div>
        <div className="rounded-2xl bg-zinc-950 px-4 py-3 text-right text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">Série en cours</p>
          <p className="mt-1 text-2xl font-black">{streak} 🔥</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Score moyen</p>
          <p className="mt-2 text-2xl font-black text-zinc-950">{averageScore || "--"}</p>
          <p className="mt-1">De quoi suivre si ta vibe repart vers la Terre ferme ou part encore plus loin.</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Ambiances testées</p>
          <p className="mt-2 text-2xl font-black text-zinc-950">{uniqueModes}</p>
          <p className="mt-1">Plus tu varies les tons, plus ton expérience devient drôle à partager.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
        {entries.length ? (
          <p>
            Tes derniers scores restent sur <span className="font-semibold text-zinc-900">cet appareil uniquement</span>.
            C’est ton petit carnet perso de vibes, pas un compte à créer.
          </p>
        ) : (
          <p>Ton historique commence dès le premier stonomètre, et il reste sur ce téléphone.</p>
        )}
      </div>

      {latestEntries.length ? (
        <div className="space-y-3">
          {latestEntries.map((entry, index) => (
            <div
              key={entry.id}
              className={[
                "rounded-2xl border p-4",
                index === 0 ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-zinc-50 text-zinc-800",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={[
                    "text-xs font-semibold uppercase tracking-[0.18em]",
                    index === 0 ? "text-white/65" : "text-zinc-500",
                  ].join(" ")}>
                    {formatHistoryDate(entry.createdAt)}
                  </p>
                  <p className="mt-2 text-base font-semibold">{entry.badge}</p>
                  <p className={["mt-1 text-sm", index === 0 ? "text-white/80" : "text-zinc-600"].join(" ")}>{entry.modeLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black leading-none">{entry.score}</p>
                  <p
                    className={[
                      "mt-1 text-xs font-semibold uppercase tracking-[0.18em]",
                      index === 0 ? "text-white/65" : "text-zinc-500",
                    ].join(" ")}
                  >
                    {entry.level}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
          Pas encore de souvenir planant ici. Lance ton premier stonomètre et la collection démarre.
        </div>
      )}
    </div>
  );
}
