export const APP_MODES = [
  "normal",
  "gentil",
  "brutal",
  "bureau",
  "etudiant",
  "parent",
  "couple",
  "tiktok",
  "apres-soiree",
  "avant-cafe",
] as const;

export type AppMode = (typeof APP_MODES)[number];

export const STONE_BUCKETS = ["low", "medium", "high", "extreme"] as const;
export type StoneBucket = (typeof STONE_BUCKETS)[number];

export type ConfidenceLevel = "low" | "medium" | "high";
export type EyeOpenness = "wide" | "normal" | "soft" | "half_closed";
export type GazeFocus = "sharp" | "steady" | "distant" | "floating";
export type SmileLevel = "none" | "low" | "medium" | "high";
export type ExpressionLabel = "neutral" | "amused" | "blank" | "dreamy" | "sleepy";
export type LightingQuality = "bad" | "medium" | "good";
export type FaceFraming = "close_up" | "mid_shot" | "full_body" | "unknown";
export type PoseLabel = "frontal" | "angled" | "profile" | "dynamic" | "unknown";
export type ClarityContrast = "low" | "medium" | "high";
export type EyeBalance = "balanced" | "slight_imbalance" | "significant_imbalance";
export type HeadTilt = "straight" | "slight_tilt" | "visible_tilt";
export type FaceRelaxation = "tonic" | "neutral" | "relaxed" | "melted";

export interface VisionAnalysis {
  stone_score: number;
  eye_openness: EyeOpenness;
  gaze_focus: GazeFocus;
  smile: SmileLevel;
  expression: ExpressionLabel;
  lighting_quality: LightingQuality;
  confidence: ConfidenceLevel;
  face_framing: FaceFraming;
  pose: PoseLabel;
  clarity_contrast: ClarityContrast;
  eye_balance: EyeBalance;
  head_tilt: HeadTilt;
  face_relaxation: FaceRelaxation;
}

export interface ResultCardData {
  score: number;
  level: string;
  tone: string;
  badge: string;
  line: string;
  probableCause: string;
  tip: string;
  challenge: string;
  shareLine: string;
  shareText: string;
  mode: AppMode;
  modeLabel: string;
  engineLabel: string;
  shortDisclaimer: string;
  bucket: StoneBucket;
  reliabilityNote?: string;
  photoNote?: string;
  vibeNote?: string;
}

export interface AnalyzeResponse {
  ok: boolean;
  analysis: VisionAnalysis;
  result: ResultCardData;
  usedFallback: boolean;
  variantSeed?: string;
}

export interface ModeMeta {
  label: string;
  icon: string;
  description: string;
  gradient: string[];
}

export interface TaggedLine {
  text: string;
  tags: string[];
}
