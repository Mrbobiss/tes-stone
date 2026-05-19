"use client";

import { useMemo, useState } from "react";

const slides = [
  {
    kicker: "Rapide et drôle",
    title: "Selfie, score stone, partage. En quelques secondes.",
    body: "Tu prends une photo, l’app te sort un score, un badge et une punchline prête à partir dans le groupe.",
    accent: "from-fuchsia-500 via-pink-500 to-orange-400",
    emoji: "⚡",
  },
  {
    kicker: "Privé par défaut",
    title: "Tes cartes planantes restent sur ton téléphone.",
    body: "Pas de compte à créer, pas de galerie cachée. Juste ton historique perso pour comparer tes vibes au fil des jours.",
    accent: "from-sky-500 via-cyan-500 to-emerald-400",
    emoji: "🔒",
  },
  {
    kicker: "Prêt à poster",
    title: "Choisis ta ref et transforme le score en story.",
    body: "Renaud de comptoir, Bob Marley, Mick Jagger ou aquarium cosmique, la personnalité change vraiment. Ensuite tu exportes la carte ou tu partages le texte en un geste.",
    accent: "from-violet-600 via-fuchsia-500 to-rose-500",
    emoji: "📱",
  },
] as const;

interface OnboardingSheetProps {
  onStart: () => void;
  onDismiss: () => void;
}

export function OnboardingSheet({ onStart, onDismiss }: OnboardingSheetProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slide = slides[activeIndex];
  const isLast = activeIndex === slides.length - 1;

  const progressLabel = useMemo(() => `${activeIndex + 1}/${slides.length}`, [activeIndex]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-zinc-950/45 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-zinc-950 text-white shadow-[0_30px_120px_rgba(15,23,42,0.45)]">
        <div className={["relative overflow-hidden p-6 sm:p-7", `bg-gradient-to-br ${slide.accent}`].join(" ")}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_30%)]" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
              <span>{slide.kicker}</span>
              <span>{progressLabel}</span>
            </div>
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-white/18 text-3xl shadow-inner shadow-white/10">
              {slide.emoji}
            </div>
            <div className="space-y-3">
              <h2 className="max-w-xs text-3xl font-black leading-tight">{slide.title}</h2>
              <p className="max-w-sm text-sm leading-6 text-white/85">{slide.body}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex gap-2">
            {slides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Voir l’étape ${index + 1}`}
                className={[
                  "h-2 flex-1 rounded-full transition",
                  index === activeIndex ? "bg-zinc-950" : "bg-zinc-200",
                ].join(" ")}
              />
            ))}
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
            Fun, jamais médical. Tes selfies ne sont pas gardés dans l’app et ton historique reste sur ce téléphone.
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                if (isLast) {
                  onStart();
                  return;
                }

                setActiveIndex((value) => Math.min(value + 1, slides.length - 1));
              }}
              className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              {isLast ? "Lancer mon premier stonomètre" : "Continuer"}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              Fermer pour l’instant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
