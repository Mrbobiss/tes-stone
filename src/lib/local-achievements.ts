import type { LocalResultEntry } from "@/lib/local-results";
import { getCurrentStreak } from "@/lib/local-results";
import type { AppMode } from "@/lib/types";

export interface AchievementDefinition {
  id: string;
  title: string;
  emoji: string;
  description: string;
  hint: string;
  check: (entries: LocalResultEntry[]) => boolean;
}

export interface UnlockedAchievement extends AchievementDefinition {
  unlocked: boolean;
}

const HIGH_SCORE_THRESHOLD = 80;
const EXTREME_SCORE_THRESHOLD = 90;

function hasScore(entries: LocalResultEntry[], minScore: number) {
  return entries.some((entry) => entry.score >= minScore);
}

function countModes(entries: LocalResultEntry[]) {
  return new Set(entries.map((entry) => entry.mode)).size;
}

function countEntriesForMode(entries: LocalResultEntry[], mode: AppMode) {
  return entries.filter((entry) => entry.mode === mode).length;
}

export const achievementDefinitions: AchievementDefinition[] = [
  {
    id: "first-roast",
    title: "Premier roast",
    emoji: "🎬",
    description: "Tu as lancé ton tout premier stonomètre local.",
    hint: "Fais juste une analyse pour l’attraper.",
    check: (entries) => entries.length >= 1,
  },
  {
    id: "night-owl",
    title: "Hibou certifié",
    emoji: "🦉",
    description: `Tu as déjà signé un score à ${HIGH_SCORE_THRESHOLD}+ sur cet appareil.`,
    hint: `Atteins ${HIGH_SCORE_THRESHOLD}/100 une fois.`,
    check: (entries) => hasScore(entries, HIGH_SCORE_THRESHOLD),
  },
  {
    id: "legendary-mess",
    title: "Légende cosmique",
    emoji: "💀",
    description: `Tu as touché ${EXTREME_SCORE_THRESHOLD}+ et l’app s’en souviendra.`,
    hint: `Monte à ${EXTREME_SCORE_THRESHOLD}/100.`,
    check: (entries) => hasScore(entries, EXTREME_SCORE_THRESHOLD),
  },
  {
    id: "streak-3",
    title: "Routine du chaos",
    emoji: "🔥",
    description: "3 jours de streak, tu tiens un concept.",
    hint: "Reviens 3 jours d’affilée.",
    check: (entries) => getCurrentStreak(entries) >= 3,
  },
  {
    id: "collector",
    title: "Collectionneur de vibes",
    emoji: "🪩",
    description: "Tu as testé plusieurs refs pour re-skinner ta carte.",
    hint: "Essaie 4 refs différentes.",
    check: (entries) => countModes(entries) >= 4,
  },
  {
    id: "tiktok-core",
    title: "TikTok core",
    emoji: "📱",
    description: "Le mode TikTok est officiellement dans ta rotation.",
    hint: "Lance 2 analyses en mode TikTok.",
    check: (entries) => countEntriesForMode(entries, "tiktok") >= 2,
  },
  {
    id: "marathon",
    title: "Marathon du miroir",
    emoji: "🏁",
    description: "Tu as cumulé 10 stonomètres dans l’historique local.",
    hint: "Atteins 10 analyses sur cet appareil.",
    check: (entries) => entries.length >= 10,
  },
  {
    id: "comeback",
    title: "Comeback arc",
    emoji: "✨",
    description: "Tu as déjà réussi à repasser sous 35 après un gros score.",
    hint: "Fais mieux après une sale session.",
    check: (entries) => {
      const chronological = [...entries].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
      let hadRoughDay = false;

      for (const entry of chronological) {
        if (entry.score >= 75) {
          hadRoughDay = true;
          continue;
        }

        if (hadRoughDay && entry.score <= 35) {
          return true;
        }
      }

      return false;
    },
  },
];

export function getUnlockedAchievements(entries: LocalResultEntry[]): UnlockedAchievement[] {
  return achievementDefinitions.map((achievement) => ({
    ...achievement,
    unlocked: achievement.check(entries),
  }));
}

export function getAchievementSummary(entries: LocalResultEntry[]) {
  const achievements = getUnlockedAchievements(entries);
  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;

  return {
    achievements,
    unlockedCount,
    totalCount: achievements.length,
    nextAchievement: achievements.find((achievement) => !achievement.unlocked) ?? null,
  };
}
