import { z } from "zod";

export const visionAnalysisSchema = z.object({
  stone_score: z.coerce.number().min(0).max(100),
  eye_openness: z.enum(["wide", "normal", "soft", "half_closed"]),
  gaze_focus: z.enum(["sharp", "steady", "distant", "floating"]),
  smile: z.enum(["none", "low", "medium", "high"]),
  expression: z.enum(["neutral", "amused", "blank", "dreamy", "sleepy"]),
  lighting_quality: z.enum(["bad", "medium", "good"]),
  confidence: z.enum(["low", "medium", "high"]),
  face_framing: z.enum(["close_up", "mid_shot", "full_body", "unknown"]),
  pose: z.enum(["frontal", "angled", "profile", "dynamic", "unknown"]),
  clarity_contrast: z.enum(["low", "medium", "high"]),
  eye_balance: z.enum(["balanced", "slight_imbalance", "significant_imbalance"]),
  head_tilt: z.enum(["straight", "slight_tilt", "visible_tilt"]),
  face_relaxation: z.enum(["tonic", "neutral", "relaxed", "melted"]),
});

export type VisionAnalysis = z.infer<typeof visionAnalysisSchema>;
