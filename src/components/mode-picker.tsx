import { modes } from "@/lib/content";
import type { AppMode } from "@/lib/types";

interface ModePickerProps {
  value: AppMode;
  onChange: (mode: AppMode) => void;
  compact?: boolean;
}

export function ModePicker({ value, onChange, compact = false }: ModePickerProps) {
  return (
    <div
      className={
        compact
          ? "flex gap-3 overflow-x-auto px-1 pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          : "grid grid-cols-2 gap-3 sm:grid-cols-3"
      }
    >
      {(Object.entries(modes) as Array<[AppMode, (typeof modes)[AppMode]]>).map(([modeKey, mode]) => {
        const active = modeKey === value;

        return (
          <button
            key={modeKey}
            type="button"
            onClick={() => onChange(modeKey)}
            className={[
              "border text-left transition",
              compact ? "min-w-[132px] shrink-0 snap-start rounded-2xl px-4 py-3" : "min-h-[124px] rounded-[1.4rem] px-4 py-4",
              active
                ? "border-zinc-950 bg-zinc-950 text-white shadow-lg shadow-zinc-950/10"
                : "border-zinc-200 bg-white/90 text-zinc-700 shadow-sm hover:border-zinc-300 hover:bg-white",
            ].join(" ")}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className={compact ? "text-base" : "text-lg"}>{mode.icon}</span>
              <span className="leading-5">{mode.label}</span>
            </div>
            {!compact ? <p className="mt-2 text-xs leading-5 text-current/75">{mode.description}</p> : null}
          </button>
        );
      })}
    </div>
  );
}
