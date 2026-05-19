import type { AppMode, ResultCardData, StoneBucket } from "@/lib/types";

const STORAGE_KEY = "tes-stone:v1:history";
const MAX_ENTRIES = 24;

export interface LocalResultEntry {
  id: string;
  createdAt: string;
  dayKey: string;
  score: number;
  mode: AppMode;
  modeLabel: string;
  badge: string;
  level: string;
  bucket?: StoneBucket;
  line?: string;
  shareLine?: string;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function toDayKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidMode(value: unknown): value is AppMode {
  return typeof value === "string";
}

function isLocalResultEntry(value: unknown): value is LocalResultEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.dayKey === "string" &&
    typeof item.score === "number" &&
    typeof item.modeLabel === "string" &&
    typeof item.badge === "string" &&
    typeof item.level === "string" &&
    (item.bucket === undefined || typeof item.bucket === "string") &&
    (item.line === undefined || typeof item.line === "string") &&
    (item.shareLine === undefined || typeof item.shareLine === "string") &&
    isValidMode(item.mode)
  );
}

export function readLocalResults(): LocalResultEntry[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isLocalResultEntry).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  } catch {
    return [];
  }
}

function writeLocalResults(entries: LocalResultEntry[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function saveLocalResult(result: ResultCardData, createdAt = new Date()): LocalResultEntry[] {
  const nextEntry: LocalResultEntry = {
    id: `${createdAt.toISOString()}-${result.mode}-${result.score}`,
    createdAt: createdAt.toISOString(),
    dayKey: toDayKey(createdAt),
    score: result.score,
    mode: result.mode,
    modeLabel: result.modeLabel,
    badge: result.badge,
    level: result.level,
    bucket: result.bucket,
    line: result.line,
    shareLine: result.shareLine,
  };

  const entries = [nextEntry, ...readLocalResults()].slice(0, MAX_ENTRIES);
  writeLocalResults(entries);
  return entries;
}

function parseDayKey(dayKey: string) {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function diffInDays(left: Date, right: Date) {
  const leftMidnight = new Date(left.getFullYear(), left.getMonth(), left.getDate());
  const rightMidnight = new Date(right.getFullYear(), right.getMonth(), right.getDate());
  return Math.round((leftMidnight.getTime() - rightMidnight.getTime()) / 86400000);
}

export function getCurrentStreak(entries: LocalResultEntry[], now = new Date()) {
  const uniqueDays = [...new Set(entries.map((entry) => entry.dayKey))].sort((left, right) => right.localeCompare(left));

  if (!uniqueDays.length) {
    return 0;
  }

  const newest = parseDayKey(uniqueDays[0]);
  const gapFromToday = diffInDays(now, newest);

  if (gapFromToday > 1) {
    return 0;
  }

  let streak = 1;
  for (let index = 1; index < uniqueDays.length; index += 1) {
    const previous = parseDayKey(uniqueDays[index - 1]);
    const current = parseDayKey(uniqueDays[index]);

    if (diffInDays(previous, current) !== 1) {
      break;
    }

    streak += 1;
  }

  return streak;
}

export function getWorstScores(entries: LocalResultEntry[], limit = 5) {
  return [...entries]
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.createdAt.localeCompare(left.createdAt);
    })
    .slice(0, limit);
}

export function getLocalResultStats(entries: LocalResultEntry[]) {
  if (!entries.length) {
    return {
      totalEntries: 0,
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      uniqueModes: 0,
    };
  }

  const totalEntries = entries.length;
  const scores = entries.map((entry) => entry.score);
  const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / totalEntries);

  return {
    totalEntries,
    averageScore,
    bestScore: Math.min(...scores),
    worstScore: Math.max(...scores),
    uniqueModes: new Set(entries.map((entry) => entry.mode)).size,
  };
}

export function formatHistoryDate(isoDate: string, locale = "fr-FR") {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}
