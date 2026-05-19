import type { VisionAnalysis } from "@/lib/types";
import { clamp, hashString } from "@/lib/utils";

const eyeOpenings = ["wide", "normal", "soft", "half_closed"] as const;
const gazeFocuses = ["sharp", "steady", "distant", "floating"] as const;
const smiles = ["none", "low", "medium", "high"] as const;
const expressions = ["neutral", "amused", "blank", "dreamy", "sleepy"] as const;
const lighting = ["bad", "medium", "good"] as const;
const framings = ["close_up", "mid_shot", "full_body", "unknown"] as const;
const poses = ["frontal", "angled", "profile", "dynamic", "unknown"] as const;
const clarityLevels = ["low", "medium", "high"] as const;
const eyeBalances = ["balanced", "slight_imbalance", "significant_imbalance"] as const;
const headTilts = ["straight", "slight_tilt", "visible_tilt"] as const;
const faceRelaxations = ["tonic", "neutral", "relaxed", "melted"] as const;

export function buildFallbackAnalysis(seedInput: string): VisionAnalysis {
  const seed = hashString(seedInput);
  const score = 20 + (seed % 69);

  return {
    stone_score: clamp(score, 20, 88),
    eye_openness: eyeOpenings[seed % eyeOpenings.length],
    gaze_focus: gazeFocuses[(seed >> 2) % gazeFocuses.length],
    smile: smiles[(seed >> 4) % smiles.length],
    expression: expressions[(seed >> 6) % expressions.length],
    lighting_quality: lighting[(seed >> 8) % lighting.length],
    confidence: "low",
    face_framing: framings[(seed >> 10) % framings.length],
    pose: poses[(seed >> 12) % poses.length],
    clarity_contrast: clarityLevels[(seed >> 14) % clarityLevels.length],
    eye_balance: eyeBalances[(seed >> 16) % eyeBalances.length],
    head_tilt: headTilts[(seed >> 18) % headTilts.length],
    face_relaxation: faceRelaxations[(seed >> 20) % faceRelaxations.length],
  };
}
