import type { AppMode, VisionAnalysis } from "@/lib/types";

export const APP_NAME = "T'es stone ?";
export const APP_TAGLINE = "L'IA qui juge ton niveau de vibe planante.";
export const APP_PROMISE = "Prends un selfie, choisis ta ref, et découvre jusqu'où ton regard a quitté la conversation.";
export const HOME_DISCLAIMER =
  "Résultat indicatif et humoristique. Ne détecte aucune substance réelle.";
export const RESULT_DISCLAIMER =
  "Divertissement only, jamais un test ou une détection de substance.";
export const FUN_ESTIMATION_LABEL = "Mode estimation planante";
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const DEFAULT_MODE: AppMode = "normal";
export const BRAND_LOGO_SRC = "/icon";

export const VISION_PROMPT = `Analyse uniquement la vibe planante apparente et les signaux visuels non sensibles sur ce selfie.

Important :
- ceci n'est pas une détection de substance ;
- ne dis jamais qu'une personne a consommé ;
- ne donne aucun diagnostic médical ;
- ne déduis pas l'âge, le genre, l'origine, la santé, l'identité ou l'état psychologique ;
- ne juge pas la beauté ni l'attractivité.

Analyse seulement des signaux visuels simples et non sensibles :
- impression globale de vibe stone / planante apparente ;
- ouverture des yeux ;
- regard net ou flottant ;
- sourire ;
- expression générale ;
- qualité de la lumière ;
- cadrage du visage ;
- pose de face / biais / profil ;
- clarté / contraste ;
- équilibre apparent des yeux ;
- inclinaison de la tête ;
- détente apparente du visage.

Retourne uniquement un JSON strict avec :
{
 "stone_score": entier précis entre 0 et 100,
 "eye_openness": "wide" | "normal" | "soft" | "half_closed",
 "gaze_focus": "sharp" | "steady" | "distant" | "floating",
 "smile": "none" | "low" | "medium" | "high",
 "expression": "neutral" | "amused" | "blank" | "dreamy" | "sleepy",
 "lighting_quality": "bad" | "medium" | "good",
 "confidence": "low" | "medium" | "high",
 "face_framing": "close_up" | "mid_shot" | "full_body" | "unknown",
 "pose": "frontal" | "angled" | "profile" | "dynamic" | "unknown",
 "clarity_contrast": "low" | "medium" | "high",
 "eye_balance": "balanced" | "slight_imbalance" | "significant_imbalance",
 "head_tilt": "straight" | "slight_tilt" | "visible_tilt",
 "face_relaxation": "tonic" | "neutral" | "relaxed" | "melted"
}

Règles importantes :
- utilise toute l'échelle pour stone_score ;
- évite d'arrondir systématiquement à 50, 60, 70, 80 ou 90 ;
- donne l'estimation entière la plus précise possible ;
- si un signal est difficile à juger visuellement, choisis la valeur la plus prudente et baisse confidence ;
- ne retourne aucun texte explicatif, aucun markdown, aucun commentaire.`;

export const EXAMPLE_ANALYSIS: VisionAnalysis = {
  stone_score: 76,
  eye_openness: "soft",
  gaze_focus: "floating",
  smile: "medium",
  expression: "dreamy",
  lighting_quality: "medium",
  confidence: "high",
  face_framing: "close_up",
  pose: "angled",
  clarity_contrast: "high",
  eye_balance: "slight_imbalance",
  head_tilt: "slight_tilt",
  face_relaxation: "relaxed",
};
