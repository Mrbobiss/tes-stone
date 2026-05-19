import { forwardRef } from "react";
import { APP_NAME, BRAND_LOGO_SRC } from "@/lib/constants";
import { modes } from "@/lib/content";
import type { AppMode, ResultCardData } from "@/lib/types";

export const RESULT_CARD_THEMES = [
  { key: "mode", label: "Auto", preview: "from-fuchsia-500 via-orange-400 to-amber-300" },
  { key: "sunrise", label: "Sunrise", preview: "from-rose-400 via-orange-300 to-amber-200" },
  { key: "cotton", label: "Cotton", preview: "from-pink-200 via-violet-100 to-sky-100" },
  { key: "matcha", label: "Matcha", preview: "from-emerald-300 via-lime-200 to-yellow-100" },
  { key: "midnight", label: "Midnight", preview: "from-slate-700 via-indigo-500 to-cyan-300" },
  { key: "neon", label: "Neon", preview: "from-fuchsia-600 via-violet-500 to-cyan-300" },
] as const;

export type ResultCardThemeKey = (typeof RESULT_CARD_THEMES)[number]["key"];

interface ResultCardProps {
  result: ResultCardData;
  theme?: ResultCardThemeKey;
  showWatermark?: boolean;
  premium?: boolean;
  fixedAspect?: boolean;
}

function getHeatStyles(score: number) {
  if (score <= 20) {
    return {
      badgeClassName: "bg-emerald-500/18 text-emerald-950 ring-1 ring-emerald-300/50",
      scoreClassName: "text-emerald-700",
      panelClassName: "ring-1 ring-emerald-300/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_16px_40px_rgba(16,185,129,0.12)]",
    };
  }

  if (score <= 45) {
    return {
      badgeClassName: "bg-lime-500/18 text-lime-950 ring-1 ring-lime-300/50",
      scoreClassName: "text-lime-700",
      panelClassName: "ring-1 ring-lime-300/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_16px_40px_rgba(132,204,22,0.12)]",
    };
  }

  if (score <= 65) {
    return {
      badgeClassName: "bg-amber-500/18 text-amber-950 ring-1 ring-amber-300/60",
      scoreClassName: "text-amber-700",
      panelClassName: "ring-1 ring-amber-300/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_16px_40px_rgba(245,158,11,0.14)]",
    };
  }

  if (score <= 85) {
    return {
      badgeClassName: "bg-orange-500/18 text-orange-950 ring-1 ring-orange-300/60",
      scoreClassName: "text-orange-700",
      panelClassName: "ring-1 ring-orange-300/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_16px_40px_rgba(249,115,22,0.16)]",
    };
  }

  return {
    badgeClassName: "bg-rose-500/20 text-rose-950 ring-1 ring-rose-300/70",
    scoreClassName: "text-rose-700",
    panelClassName: "ring-1 ring-rose-300/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_18px_42px_rgba(244,63,94,0.18)]",
  };
}

const themeClasses: Record<Exclude<ResultCardThemeKey, "mode">, string[]> = {
  sunrise: ["from-rose-400", "via-orange-300", "to-amber-200"],
  cotton: ["from-pink-200", "via-violet-100", "to-sky-100"],
  matcha: ["from-emerald-300", "via-lime-200", "to-yellow-100"],
  midnight: ["from-slate-700", "via-indigo-500", "to-cyan-300"],
  neon: ["from-fuchsia-600", "via-violet-500", "to-cyan-300"],
};

function getScoreGradient(score: number) {
  if (score <= 20) {
    return ["from-emerald-50", "via-lime-50", "to-amber-50"];
  }

  if (score <= 45) {
    return ["from-white", "via-orange-50", "to-amber-100"];
  }

  if (score <= 65) {
    return ["from-amber-100", "via-orange-100", "to-orange-200"];
  }

  if (score <= 85) {
    return ["from-orange-200", "via-orange-300", "to-rose-300"];
  }

  return ["from-rose-300", "via-rose-400", "to-fuchsia-500"];
}

const modeTemplates: Record<
  AppMode,
  {
    accentLabel: string;
    shellClassName: string;
    scorePanelClassName: string;
    decoClassName: string;
  }
> = {
  normal: {
    accentLabel: "Renaud de comptoir",
    shellClassName: "",
    scorePanelClassName: "bg-white/76",
    decoClassName: "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.55),transparent_40%)]",
  },
  gentil: {
    accentLabel: "Bob Marley",
    shellClassName: "text-emerald-950",
    scorePanelClassName: "bg-white/82 ring-1 ring-emerald-200/70",
    decoClassName: "bg-[radial-gradient(circle_at_top_right,rgba(236,253,245,0.95),transparent_42%)]",
  },
  brutal: {
    accentLabel: "Mick Jagger",
    shellClassName: "text-zinc-950",
    scorePanelClassName: "bg-black/78 text-white ring-1 ring-white/10",
    decoClassName: "bg-[radial-gradient(circle_at_top_right,rgba(17,24,39,0.45),transparent_38%)]",
  },
  bureau: {
    accentLabel: "Philosophe du canapé",
    shellClassName: "text-slate-950",
    scorePanelClassName: "bg-white/84 ring-1 ring-sky-100",
    decoClassName: "bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,transparent_40%,rgba(15,23,42,0.12)_100%)]",
  },
  etudiant: {
    accentLabel: "Festival survivor",
    shellClassName: "text-indigo-950",
    scorePanelClassName: "bg-white/80 ring-1 ring-indigo-100/90",
    decoClassName: "bg-[radial-gradient(circle_at_top_right,rgba(224,231,255,0.85),transparent_42%)]",
  },
  parent: {
    accentLabel: "Dub lunaire",
    shellClassName: "text-amber-950",
    scorePanelClassName: "bg-white/82 ring-1 ring-amber-100/80",
    decoClassName: "bg-[radial-gradient(circle_at_top_right,rgba(255,247,237,0.95),transparent_44%)]",
  },
  couple: {
    accentLabel: "Astral discret",
    shellClassName: "text-rose-950",
    scorePanelClassName: "bg-white/80 ring-1 ring-rose-100/80",
    decoClassName: "bg-[radial-gradient(circle_at_top_right,rgba(255,228,230,0.92),transparent_44%)]",
  },
  tiktok: {
    accentLabel: "Regard aquarium",
    shellClassName: "text-zinc-950",
    scorePanelClassName: "bg-black/82 text-white ring-1 ring-cyan-300/30",
    decoClassName: "bg-[linear-gradient(135deg,rgba(255,0,128,0.18)_0%,transparent_38%,rgba(34,211,238,0.22)_100%)]",
  },
  "apres-soiree": {
    accentLabel: "Rocker d'after",
    shellClassName: "text-indigo-950",
    scorePanelClassName: "bg-slate-950/84 text-white ring-1 ring-fuchsia-300/20",
    decoClassName: "bg-[radial-gradient(circle_at_top_right,rgba(67,56,202,0.28),transparent_38%)]",
  },
  "avant-cafe": {
    accentLabel: "Canapé premium",
    shellClassName: "text-amber-950",
    scorePanelClassName: "bg-white/78 ring-1 ring-amber-200/80",
    decoClassName: "bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.28),transparent_40%)]",
  },
};

export const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(function ResultCard(
  { result, theme = "mode", showWatermark = true, premium = false, fixedAspect = false },
  ref,
) {
  const modeMeta = modes[result.mode];
  const gradients = theme === "mode" ? getScoreGradient(result.score) : themeClasses[theme];
  const template = modeTemplates[result.mode];
  const heat = getHeatStyles(result.score);

  return (
    <div
      ref={ref}
      className={[
        "mx-auto w-full max-w-[320px] overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:max-w-sm",
        fixedAspect ? "aspect-[9/16]" : "",
        premium ? "ring-1 ring-white/60 shadow-[0_36px_100px_rgba(15,23,42,0.24)]" : "",
      ].join(" ")}
    >
      <div
        className={[
          "relative flex h-full flex-col bg-gradient-to-b p-5",
          template.shellClassName,
          gradients[0],
          gradients[1],
          gradients[2],
        ].join(" ")}
      >
        {premium ? (
          <>
            <div className={["pointer-events-none absolute inset-x-0 top-0 h-40", template.decoClassName].join(" ")} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.14),transparent_70%)]" />
          </>
        ) : null}

        <div className="relative space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              {showWatermark ? (
                <div
                  className="size-12 rounded-[1rem] bg-white/85 shadow-sm ring-1 ring-white/80"
                  style={{
                    backgroundImage: `url(${BRAND_LOGO_SRC})`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                  }}
                />
              ) : null}
              <p className={["text-xs font-semibold uppercase tracking-[0.22em] text-current/60", showWatermark ? "mt-3" : ""].join(" ")}>
                {APP_NAME}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-zinc-700 backdrop-blur">
                  <span>{modeMeta.icon}</span>
                  {result.modeLabel}
                </p>
                <p className="inline-flex rounded-full bg-zinc-950/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                  {template.accentLabel}
                </p>
              </div>
            </div>
            <span className={["rounded-full px-3 py-1 text-[11px] font-semibold backdrop-blur", heat.badgeClassName].join(" ")}>
              {result.level}
            </span>
          </div>

          <div className={["rounded-[1.5rem] p-5 backdrop-blur", template.scorePanelClassName, heat.panelClassName].join(" ")}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-current/60">Score stone</p>
            <div className="mt-2 flex items-end gap-2">
              <span className={["text-5xl font-black leading-none", heat.scoreClassName].join(" ")}>{result.score}</span>
              <span className="pb-1 text-lg font-semibold text-current/55">/100</span>
            </div>
            <p className="mt-2 text-[13px] font-semibold text-current/75">Badge, {result.badge}</p>
            <p className="mt-2 text-[15px] font-semibold leading-6 text-current">“{result.line}”</p>
          </div>
        </div>

        <div className="relative mt-4 space-y-2.5 rounded-[1.5rem] bg-zinc-950/86 p-4 text-white shadow-inner backdrop-blur-sm">
          <div className="rounded-2xl bg-white/8 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">{result.tone}</div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">Cause probable</p>
            <p className="mt-1 text-[13px] font-medium leading-5 text-white/90">{result.probableCause}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">Conseil express</p>
            <p className="mt-1 text-[13px] font-medium leading-5 text-white/90">{result.tip}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">Défi du jour</p>
            <p className="mt-1 text-[13px] font-medium leading-5 text-white/90">{result.challenge}</p>
          </div>
          <div className="rounded-2xl bg-white/8 p-3 text-[13px] font-medium leading-5 text-white/90">{result.shareLine}</div>
          <div className="flex items-center justify-between gap-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
            <span>{result.modeLabel}</span>
            <span>{premium ? "Carte à poster" : modeMeta.icon}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
