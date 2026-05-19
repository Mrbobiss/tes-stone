import badgesJson from "../../content/badges.json";
import causesJson from "../../content/causes.json";
import challengesJson from "../../content/challenges.json";
import modesJson from "../../content/modes.json";
import roastsJson from "../../content/roasts.json";
import shareLinesJson from "../../content/shareLines.json";
import tipsJson from "../../content/tips.json";
import type { ModeMeta, StoneBucket, TaggedLine } from "@/lib/types";

export const modes = modesJson as Record<string, ModeMeta>;
export const badges = badgesJson as Record<string, Record<StoneBucket, string[]>>;
export const roasts = roastsJson as Record<string, Record<StoneBucket, string[]>>;
export const causes = causesJson as Record<string, Record<StoneBucket, TaggedLine[]>>;
export const tips = tipsJson as Record<string, Record<StoneBucket, TaggedLine[]>>;
export const challenges = challengesJson as Record<string, Record<StoneBucket, string[]>>;
export const shareLines = shareLinesJson as Record<string, Record<StoneBucket, string[]>>;
