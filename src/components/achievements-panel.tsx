"use client";

import type { UnlockedAchievement } from "@/lib/local-achievements";

interface AchievementsPanelProps {
  achievements: UnlockedAchievement[];
  unlockedCount: number;
  totalCount: number;
  nextAchievement: UnlockedAchievement | null;
}

export function AchievementsPanel({
  achievements,
  unlockedCount,
  totalCount,
  nextAchievement,
}: AchievementsPanelProps) {
  return (
    <div className="space-y-4 rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Collection perso</p>
          <h3 className="mt-2 text-xl font-bold text-zinc-950">Tes trophées planants</h3>
        </div>
        <div className="rounded-2xl bg-zinc-950 px-4 py-3 text-right text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">Progression</p>
          <p className="mt-1 text-2xl font-black">
            {unlockedCount}/{totalCount}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
        Tu débloques des trophées au fil des jours, des refs testées et de tes vibes les plus mémorables. Tout reste sur ton appareil.
      </div>

      {nextAchievement ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">À viser ensuite</p>
          <p className="mt-2 text-base font-semibold">
            {nextAchievement.emoji} {nextAchievement.title}
          </p>
          <p className="mt-1 text-sm text-emerald-800">{nextAchievement.hint}</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-fuchsia-200 bg-fuchsia-50 p-4 text-sm text-fuchsia-900">
          Tout est débloqué. Honnêtement, c’est un peu inquiétant, mais surtout très fort.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={[
              "rounded-3xl border p-4 transition",
              achievement.unlocked
                ? "border-zinc-950 bg-zinc-950 text-white"
                : "border-zinc-200 bg-zinc-50 text-zinc-500",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl">{achievement.emoji}</p>
                <p className="mt-3 text-base font-semibold">{achievement.title}</p>
              </div>
              <span
                className={[
                  "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                  achievement.unlocked ? "bg-white/15 text-white/80" : "bg-white text-zinc-500",
                ].join(" ")}
              >
                {achievement.unlocked ? "Gagné" : "À débloquer"}
              </span>
            </div>
            <p className={["mt-3 text-sm leading-6", achievement.unlocked ? "text-white/78" : "text-zinc-600"].join(" ")}>
              {achievement.unlocked ? achievement.description : achievement.hint}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
