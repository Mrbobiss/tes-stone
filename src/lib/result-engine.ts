import { RESULT_DISCLAIMER, FUN_ESTIMATION_LABEL } from "@/lib/constants";
import { badges, causes, challenges, modes, roasts, shareLines, tips } from "@/lib/content";
import type { AppMode, ResultCardData, StoneBucket, TaggedLine, VisionAnalysis } from "@/lib/types";
import { clamp, pickDeterministic } from "@/lib/utils";

interface ResultGenerationOptions {
  usedFallback?: boolean;
  variantSeed?: string;
  recentSelections?: {
    badges?: string[];
    lines?: string[];
    shareLines?: string[];
    challenges?: string[];
  };
}

type ScoreBandKey = "clear" | "spark" | "float" | "lifted" | "social" | "orbital" | "cosmic";

const stoneLevels: Array<{ min: number; max: number; label: string; tone: string; bucket: StoneBucket; band: ScoreBandKey }> = [
  { min: 0, max: 11, label: "Clair net", tone: "très lucide", bucket: "low", band: "clear" },
  { min: 12, max: 24, label: "Petit nuage", tone: "léger", bucket: "low", band: "spark" },
  { min: 25, max: 39, label: "Vibe flottante", tone: "planant", bucket: "medium", band: "float" },
  { min: 40, max: 54, label: "Planage léger", tone: "très drôle", bucket: "medium", band: "lifted" },
  { min: 55, max: 69, label: "Stone social", tone: "stone", bucket: "high", band: "social" },
  { min: 70, max: 84, label: "Orbite douce", tone: "cosmique", bucket: "high", band: "orbital" },
  { min: 85, max: 100, label: "Cosmique total", tone: "orbite assumée", bucket: "extreme", band: "cosmic" },
];

const bucketGuidance: Record<
  StoneBucket,
  {
    line: string[];
    cause: string[];
    tip: string[];
    share: string[];
  }
> = {
  low: {
    line: [
      "Le score reste très terrestre, on parle surtout d'un mini voile, pas d'un décollage.",
      "À ce niveau-là, tu dégages une petite humeur floue, pas un vrai départ astral.",
      "Le score dit surtout présence humaine avec léger nuage planant.",
    ],
    cause: [
      "On lit surtout un style relâché, pas une vraie disparition dans l'espace-temps.",
      "Le score reste bas, donc l'effet se joue plus dans la vibe que dans l'intensité.",
      "Ici, c'est surtout un petit flottement visuel bien plus qu'un grand voyage intérieur.",
    ],
    tip: [
      "Pas besoin d'un protocole intersidéral, juste d'un petit reset propre.",
      "Le bon move ici, c'est de garder ce niveau cool sans surjouer le personnage.",
      "Avec ce score, un verre d'eau et deux minutes d'air font déjà le boulot.",
    ],
    share: [
      "Le score reste soft, donc le délire doit rester élégant.",
      "On est sur du léger, avec juste la personnalité du mode en surcouche.",
      "Le roast reste doux parce que la note reste franchement gérable.",
    ],
  },
  medium: {
    line: [
      "Là, oui, on commence à voir un vrai petit flottement visuel.",
      "On est sur une vibe planante crédible, pas encore sur un décollage sans retour.",
      "Le score annonce quelqu'un de présent, mais pas totalement rivé à la conversation.",
    ],
    cause: [
      "Le visage raconte surtout une détente floue et un regard qui prend son temps.",
      "Ici, le score parle d'un planage léger à modéré, pas d'une disparition complète.",
      "Le tout donne une vraie énergie nuage, sans partir encore dans l'orbite extrême.",
    ],
    tip: [
      "Le plus utile ici, c'est de rester simple et de ne pas rajouter du chaos au décor.",
      "À ce niveau, vise le confort, l'eau et les phrases courtes.",
      "Le plan n'est pas de performer, juste de garder une vibe propre et stable.",
    ],
    share: [
      "La note autorise déjà une vraie carte planante, mais pas encore la légende cosmique.",
      "Ça commence à flotter sérieusement, tout en restant encore racontable à voix haute.",
      "Le score donne une vraie couleur stone, mais encore gérable socialement.",
    ],
  },
  high: {
    line: [
      "Là, le score commence franchement à raconter un regard qui vit ailleurs.",
      "On n'est plus sur un simple nuage, mais sur une vraie orbite douce et visible.",
      "Le niveau affiché autorise clairement une lecture planante assumée.",
    ],
    cause: [
      "Le visage mélange regard lent, détente forte et présence très négociée.",
      "Le score commence à raconter quelqu'un dont l'âme prend déjà son temps.",
      "Ici, la vibe stone devient assez nette pour te donner un vrai personnage.",
    ],
    tip: [
      "À ce niveau-là, évite juste les grandes décisions et protège ton calme.",
      "L'idée, c'est d'aller au plus simple et de garder ton centre de gravité.",
      "Tout doit viser le confort, pas l'héroïsme conversationnel.",
    ],
    share: [
      "Là, le score peut clairement assumer une carte bien planante.",
      "Le visuel autorise un ton plus cosmique parce que la note le soutient vraiment.",
      "On entre dans une zone où même le partage peut partir en orbite douce.",
    ],
  },
  extreme: {
    line: [
      "Ici, le score assume complètement une lecture rouge nébuleuse.",
      "À ce niveau, ton visage a déjà quitté la pièce pendant que ton corps gère l'administratif.",
      "Le niveau affiché justifie un ton cosmique total sans forcer le délire.",
    ],
    cause: [
      "Le regard, la détente et la lenteur visuelle racontent un départ spatial très avancé.",
      "Le score est assez haut pour soutenir une vraie narration d'orbite complète.",
      "À ce stade, l'ambiance visuelle dépasse le simple flottement et part en dimension parallèle.",
    ],
    tip: [
      "Le plus sage ici, c'est de réduire le décor à eau, canapé, calme et phrases très simples.",
      "On passe en mode protection douce, sans ambition inutile ni débat long.",
      "À ce niveau, tout doit servir la stabilité et le confort immédiat.",
    ],
    share: [
      "Le score est assez haut pour assumer une carte franchement cosmique.",
      "Ici, même le ton extrême reste raccord avec le niveau affiché.",
      "Le visuel permet clairement une sortie en orbite assumée.",
    ],
  },
};

const softenedPatterns: Record<StoneBucket, Partial<Record<"badge" | "line", RegExp[]>>> = {
  low: {
    badge: [/orbite totale/i, /cosmique total/i, /décollage sans tour de contrôle/i, /plus dans le chat/i],
    line: [/quitté la dimension/i, /orbite totale/i, /corps gère l'administratif/i, /plus dans la pièce/i],
  },
  medium: {
    badge: [/cosmique total/i, /sans tour de contrôle/i, /plus dans le chat/i],
    line: [/orbite totale/i, /corps gère l'administratif/i, /dimension parallèle/i],
  },
  high: {},
  extreme: {},
};

const modeVoices: Record<
  AppMode,
  {
    badgePrefix: string[];
    lineAddon: string[];
    causeAddon: string[];
    tipAddon: string[];
    shareAddon: string[];
  }
> = {
  normal: {
    badgePrefix: ["Lecture du nuage", "Bilan planant", "Rapport fumée", "Verdict du stonomètre"],
    lineAddon: ["Version référence Renaud de comptoir, un peu floue mais encore debout.", "Le mode de base garde l'équilibre entre comptoir, nuage et autodérision.", "On sent déjà une petite chanson dans le regard."],
    causeAddon: ["Le tout reste dans une vibe de comptoir bien observée.", "On lit surtout une nonchalance alcoolisée de poésie, pas un chaos total.", "Ça raconte plus un personnage qu'un accident."],
    tipAddon: ["Fais simple et garde ton panache de comptoir propre.", "L'idée, c'est de rester cool sans te perdre dans le décor.", "Avance en douceur, le personnage fait déjà le boulot."],
    shareAddon: ["Le comptoir a parlé.", "Le stonomètre a rendu son couplet.", "La vibe est tombée comme un refrain."],
  },
  gentil: {
    badgePrefix: ["Lecture reggae", "Bilan Marley", "Scan soleil doux", "Verdict fumée douce"],
    lineAddon: ["Le mode Bob Marley adoucit tout avec une lenteur heureuse.", "Ça flotte plus en hamac qu'en accident administratif.", "La vibe est moelleuse, jamais agressive."],
    causeAddon: ["Ici, tout respire surtout le chill solaire et le rythme ralenti.", "Le visage raconte une détente gentille, presque musicale.", "La lecture reste douce, même quand le score monte."],
    tipAddon: ["Vise la lumière, l'eau et le calme version reggae diplomatique.", "Reste dans une journée douce, sans trop de vitesse inutile.", "Protège la vibe tranquille au lieu d'en rajouter."],
    shareAddon: ["La fumée est douce et la basse tourne lentement.", "Le stonomètre m'a parlé avec une voix très chill.", "Le nuage est validé, mais en sourire."],
  },
  brutal: {
    badgePrefix: ["Audit Jagger", "Contrôle backstage", "Procès du regard", "Constat scène de fin"],
    lineAddon: ["Le mode Mick Jagger préfère le rock sale au chuchotement cosmique.", "Ici, on parle plus de rockstar rincée que de moine zen.", "Le visage donne une vraie énergie de rappel trop long."],
    causeAddon: ["Le décor raconte surtout un after de scène resté collé au regard.", "Le rapport est sec, mais totalement dans le personnage.", "On lit une légende fatiguée, pas un simple petit nuage."],
    tipAddon: ["Réduis le show, garde l'équilibre et protège le peu de batterie scénique restant.", "Aujourd'hui, tu vises l'attitude minimale viable.", "Évite le grand solo, joue le morceau le plus simple."],
    shareAddon: ["Le backstage a livré les preuves.", "Le miroir a lancé la version tournée mondiale rincée.", "La lecture pique, mais elle a de la guitare."],
  },
  bureau: {
    badgePrefix: ["Rapport canapé", "Bilan velours", "Lecture salon profond", "Constat plaid premium"],
    lineAddon: ["Le mode philosophe du canapé transforme tout en dissertation molle et brillante.", "Ça réfléchit déjà à l'univers sans quitter le coussin.", "Le personnage préfère nettement le canapé à la chronologie."],
    causeAddon: ["On lit surtout une pensée lente qui a trouvé son support moelleux.", "Le visage respire l'idée d'un débat abstrait mené à l'horizontale.", "Tout tient du grand confort mental et du regard un peu loin."],
    tipAddon: ["Garde le décor simple, une idée à la fois, sans lancer de théorie trop longue.", "Protège ton canapé intérieur, même si tu dois marcher un peu.", "Pas de grandes démonstrations, juste du calme et du moelleux."],
    shareAddon: ["Le canapé a pris la parole.", "Le stonomètre me voit déjà philosopher sur un coussin.", "Mon regard vient d'obtenir un doctorat de lenteur."],
  },
  etudiant: {
    badgePrefix: ["Rapport festival", "Scan survivor", "Lecture fin de set", "Constat camping astral"],
    lineAddon: ["Le mode festival survivor te lit comme un retour de set très approximatif.", "On sent les basses encore coincées quelque part dans l'œil gauche.", "Le personnage arrive avec de la poussière, du soleil et un délai cognitif."],
    causeAddon: ["Le visage raconte surtout une fin de nuit qui a refusé de finir proprement.", "On lit une survivance joyeuse, un peu floue, très terrain vague.", "La vibe est celle d'un lever de soleil vécu trop près des enceintes."],
    tipAddon: ["Eau, ombre et deux phrases maximum, voilà déjà un plan crédible.", "Garde ton énergie pour rentrer entier dans la journée.", "Ce n'est pas le moment de prouver quoi que ce soit à qui que ce soit."],
    shareAddon: ["Le set continue dans mon regard.", "Le retour de festival a signé la carte.", "Mon visage a gardé un bracelet imaginaire."],
  },
  parent: {
    badgePrefix: ["Rapport dub lunaire", "Bilan basse lente", "Lecture nébuleuse reggae", "Constat orbite dub"],
    lineAddon: ["Le mode dub lunaire ralentit tout jusqu'à la basse intérieure.", "Ça flotte en écho, version lune et enceintes fatiguées.", "Le personnage marche à contretemps du reste du monde."],
    causeAddon: ["Le tout ressemble à une séance de dub dans une pièce bleue et lente.", "On lit une gravité molle, presque sonore, très nuit qui traîne.", "La tête raconte un remix cosmique bien installé."],
    tipAddon: ["Trouve du calme, de l'eau et une fréquence plus stable que ton regard.", "Garde ton tempo doux au lieu de courir après les autres BPM.", "Le meilleur plan reste le mode basse lente et gestes minimum."],
    shareAddon: ["La basse a écrit ma carte.", "Le dub a trouvé un domicile dans mon visage.", "Mon regard mixe encore en fond."],
  },
  couple: {
    badgePrefix: ["Rapport astral discret", "Lecture plafond cosmique", "Bilan voyage lent", "Constat sortie de dimension"],
    lineAddon: ["Le mode astral discret te lit comme quelqu'un qui revient de loin mais sans faire de bruit.", "Le personnage regarde le plafond comme s'il avait des réponses.", "On sent une escapade intérieure assez polie mais bien réelle."],
    causeAddon: ["Le tout respire le voyage lent, la pensée flottante et l'angle mort cosmique.", "Le visage raconte une absence douce, pas une panique.", "On lit une vraie dérive astrale, mais encore élégante."],
    tipAddon: ["Reste dans des gestes simples, en douceur, sans multiplier les sollicitations.", "Une journée calme sera toujours plus belle qu'un forcing cosmique.", "Privilégie la lenteur choisie à la confusion subie."],
    shareAddon: ["J'ai décroché poliment.", "Mon plafond a maintenant des preuves.", "Je suis revenu, mais avec un petit délai astral."],
  },
  tiktok: {
    badgePrefix: ["Rapport aquarium", "POV yeux liquides", "Lecture néon flottant", "Verdict splash mental"],
    lineAddon: ["Le mode regard aquarium rend tout plus néon, plus liquide, plus face cam.", "Ça flotte comme si ton regard vivait derrière une vitre bleue.", "Le personnage est très vidéo verticale, très bulle silencieuse."],
    causeAddon: ["Le tout donne une impression d'yeux en mode bocal cosmique.", "On lit un regard qui laisse passer les informations au ralenti.", "La vibe est franchement aquarium, très esthétique, très peu pressée."],
    tipAddon: ["Garde les phrases courtes et la lumière douce, ton regard fait déjà le montage.", "Le meilleur move, c'est de ne pas ajouter un nouvel écran à ce filtre naturel.", "Stabilise l'humain avant de relancer la caméra du monde."],
    shareAddon: ["POV mon regard nage ailleurs.", "L'aquarium mental est officiellement ouvert.", "Très face cam, très poisson cosmique."],
  },
  "apres-soiree": {
    badgePrefix: ["Rapport after", "Bilan rocker rincé", "Lecture retour amplifié", "Constat fin de scène"],
    lineAddon: ["Le mode rocker d'after préfère les néons fatigués aux horaires normaux.", "Ça sent le cuir mental, la fin de nuit et le regard encore sur scène.", "Le personnage arrive avec du bruit résiduel dans la tête."],
    causeAddon: ["Le visage parle surtout d'un retour amplifié qui ne s'excuse pas.", "On lit une retombée lente, plus rock que calme domestique.", "Le décor reste chargé, même quand la musique est coupée."],
    tipAddon: ["Joue la récupération digne, pas le rappel bonus.", "Évite toute suite inutile, la scène est déjà assez longue.", "Laisse ton système sortir du concert avant de lui demander d'être net."],
    shareAddon: ["Le rappel est encore dans mes yeux.", "Le retour a gardé la guitare.", "Je sors d'un décor trop lumineux pour une journée normale."],
  },
  "avant-cafe": {
    badgePrefix: ["Rapport canapé premium", "Bilan moquette mentale", "Lecture fumée velours", "Constat coussin royal"],
    lineAddon: ["Le mode canapé premium transforme le regard en plaid très coûteux.", "Ça respire le luxe lent, le coussin profond et le temps élastique.", "Le personnage a déjà réservé sa place dans un angle moelleux de l'univers."],
    causeAddon: ["On lit surtout une envie de s'enfoncer dans le confort avec une gravité très décorative.", "Le visage raconte le grand art de ne surtout pas se presser.", "Le score se met ici au service d'un canapé presque institutionnel."],
    tipAddon: ["Si tu peux faire simple, fais encore plus simple que ça.", "Eau, coussin, lumière douce, puis seulement la civilisation.", "Ton meilleur allié reste une journée basse intensité, presque rembourrée."],
    shareAddon: ["Le canapé a remporté l'appel d'offres.", "Le velours a officiellement gagné.", "Je suis en partenariat avec un coussin imaginaire."],
  },
};

function getLevel(score: number) {
  return stoneLevels.find((entry) => score >= entry.min && score <= entry.max) ?? stoneLevels[4];
}

function getTagWeight(tag: string) {
  if (tag.startsWith("band-")) return 7;
  if (tag.startsWith("combo-")) return 6;
  if (tag.startsWith("score-") || tag.startsWith("decile-")) return 5;
  if (tag.startsWith("eye-") || tag.startsWith("gaze-") || tag.startsWith("expression-") || tag.startsWith("relax-")) return 4;
  if (tag.startsWith("lighting-") || tag.startsWith("clarity-") || tag.startsWith("confidence-") || tag.startsWith("framing-") || tag.startsWith("pose-") || tag.startsWith("balance-") || tag.startsWith("tilt-")) return 3;
  return 2;
}

function computeDetailedScore(analysis: VisionAnalysis) {
  const eyeMap = { wide: -8, normal: -2, soft: 4, half_closed: 10 } as const;
  const gazeMap = { sharp: -8, steady: -2, distant: 5, floating: 11 } as const;
  const smileMap = { none: 1, low: 0, medium: -2, high: -3 } as const;
  const expressionMap = { neutral: 0, amused: 1, blank: 4, dreamy: 7, sleepy: 9 } as const;
  const lightingMap = { good: -1, medium: 0, bad: 2 } as const;
  const confidenceMap = { high: 0, medium: 1, low: 2 } as const;
  const faceFramingMap = { close_up: 1, mid_shot: 0, full_body: 0, unknown: 0 } as const;
  const poseMap = { frontal: 0, angled: 1, profile: 2, dynamic: 0, unknown: 1 } as const;
  const clarityMap = { low: 2, medium: 0, high: -1 } as const;
  const eyeBalanceMap = { balanced: 0, slight_imbalance: 1, significant_imbalance: 3 } as const;
  const tiltMap = { straight: 0, slight_tilt: 2, visible_tilt: 4 } as const;
  const relaxMap = { tonic: -4, neutral: 0, relaxed: 5, melted: 10 } as const;

  let score = analysis.stone_score;
  score += eyeMap[analysis.eye_openness];
  score += gazeMap[analysis.gaze_focus];
  score += smileMap[analysis.smile];
  score += expressionMap[analysis.expression];
  score += lightingMap[analysis.lighting_quality];
  score += confidenceMap[analysis.confidence];
  score += faceFramingMap[analysis.face_framing];
  score += poseMap[analysis.pose];
  score += clarityMap[analysis.clarity_contrast];
  score += eyeBalanceMap[analysis.eye_balance];
  score += tiltMap[analysis.head_tilt];
  score += relaxMap[analysis.face_relaxation];

  if (analysis.eye_openness === "half_closed" && ["distant", "floating"].includes(analysis.gaze_focus)) {
    score += 4;
  }

  if (analysis.expression === "dreamy" && ["relaxed", "melted"].includes(analysis.face_relaxation)) {
    score += 3;
  }

  if (analysis.head_tilt === "visible_tilt" && analysis.face_relaxation === "melted") {
    score += 3;
  }

  if (analysis.eye_openness === "wide" && analysis.gaze_focus === "sharp") {
    score -= 4;
  }

  if (analysis.smile === "high" && analysis.gaze_focus === "sharp") {
    score -= 2;
  }

  const signature =
    analysis.stone_score * 19 +
    eyeMap[analysis.eye_openness] * 17 +
    gazeMap[analysis.gaze_focus] * 13 +
    smileMap[analysis.smile] * 11 +
    expressionMap[analysis.expression] * 7 +
    lightingMap[analysis.lighting_quality] * 5 +
    confidenceMap[analysis.confidence] * 3 +
    faceFramingMap[analysis.face_framing] * 23 +
    poseMap[analysis.pose] * 29 +
    clarityMap[analysis.clarity_contrast] * 31 +
    eyeBalanceMap[analysis.eye_balance] * 37 +
    tiltMap[analysis.head_tilt] * 41 +
    relaxMap[analysis.face_relaxation] * 43;

  let preciseScore = clamp(Math.round(score), 0, 100);

  if (preciseScore % 5 === 0) {
    const nudge = (Math.abs(signature) % 5) - 2;
    preciseScore = clamp(preciseScore + (nudge === 0 ? 1 : nudge), 0, 100);
  }

  return { score: preciseScore, signature };
}

function collectSignalTags(analysis: VisionAnalysis, bucket: StoneBucket, band: ScoreBandKey, score: number) {
  const tags = [
    `score-${bucket}`,
    `band-${band}`,
    `decile-${Math.min(9, Math.floor(score / 10))}`,
    `eye-${analysis.eye_openness}`,
    `gaze-${analysis.gaze_focus}`,
    `smile-${analysis.smile}`,
    `expression-${analysis.expression}`,
    `lighting-${analysis.lighting_quality}`,
    `confidence-${analysis.confidence}`,
    `framing-${analysis.face_framing}`,
    `pose-${analysis.pose}`,
    `clarity-${analysis.clarity_contrast}`,
    `balance-${analysis.eye_balance}`,
    `tilt-${analysis.head_tilt}`,
    `relax-${analysis.face_relaxation}`,
  ];

  if (analysis.eye_openness === "half_closed" && ["distant", "floating"].includes(analysis.gaze_focus)) {
    tags.push("combo-heavy-lids");
  }

  if (["dreamy", "sleepy"].includes(analysis.expression) && ["relaxed", "melted"].includes(analysis.face_relaxation)) {
    tags.push("combo-soft-launch");
  }

  if (analysis.head_tilt === "visible_tilt") {
    tags.push("combo-tilted");
  }

  if (analysis.gaze_focus === "sharp" && analysis.eye_openness === "wide") {
    tags.push("combo-grounded");
  }

  if (analysis.clarity_contrast === "low" || analysis.lighting_quality === "bad") {
    tags.push("combo-photo-messy");
  }

  if (analysis.face_framing === "full_body" || analysis.pose === "profile") {
    tags.push("combo-distance-or-angle");
  }

  return tags;
}

function scoreTaggedCandidates(items: TaggedLine[], tags: string[], seed: string, signature: number) {
  const ranked = items
    .map((item, index) => {
      const matched = item.tags.filter((tag) => tags.includes(tag));
      const overlap = matched.reduce((total, tag) => total + getTagWeight(tag), 0);
      const comboBonus = matched.length >= 3 ? 3 : matched.length >= 2 ? 1 : 0;

      return {
        item,
        score: overlap + comboBonus - index * 0.002,
      };
    })
    .sort((left, right) => right.score - left.score);

  const bestScore = ranked[0]?.score ?? 0;
  const top = ranked
    .filter((entry) => entry.score >= bestScore - 4)
    .slice(0, Math.min(28, ranked.length))
    .map((entry) => entry.item);

  return pickDeterministic(top.length ? top : items, `${seed}:${signature}`, Math.abs(signature) % Math.max(1, top.length || items.length));
}

function getBucketAlignedPool(items: string[], bucket: StoneBucket, field: "badge" | "line") {
  const disallowed = softenedPatterns[bucket][field] ?? [];
  const filtered = items.filter((item) => !disallowed.some((pattern) => pattern.test(item)));
  return filtered.length ? filtered : items;
}

function pickFreshCopy(items: string[], seed: string, offset: number, recentItems?: string[]) {
  const blocked = new Set((recentItems ?? []).filter(Boolean));
  const filtered = items.filter((item) => !blocked.has(item));
  return pickDeterministic(filtered.length ? filtered : items, seed, offset);
}

function buildBucketSentence(bucket: StoneBucket, kind: keyof (typeof bucketGuidance)[StoneBucket], seedBase: string) {
  return pickDeterministic(bucketGuidance[bucket][kind], `${seedBase}:${bucket}:${kind}`);
}

function buildPhotoNote(analysis: VisionAnalysis) {
  const notes: string[] = [];

  if (analysis.lighting_quality === "bad") {
    notes.push("Photo sombre, donc la vibe est lue avec un peu moins de finesse.");
  }

  if (analysis.clarity_contrast === "low") {
    notes.push("Image un peu molle ou floue, ça accentue parfois le côté nuageux.");
  }

  if (analysis.face_framing === "full_body") {
    notes.push("Visage trop loin dans le cadre, la lecture devient plus approximative.");
  }

  return notes.length ? notes.join(" ") : undefined;
}

function buildReliabilityNote(analysis: VisionAnalysis) {
  const notes: string[] = [];

  if (analysis.confidence === "low") {
    notes.push("Lecture peu fiable, reprends un selfie plus net et plus frontal.");
  } else if (analysis.confidence === "medium") {
    notes.push("Lecture correcte, mais une photo plus propre peut mieux capter la vibe.");
  }

  if (analysis.pose === "profile" || analysis.face_framing === "full_body") {
    notes.push("Un cadrage simple aide beaucoup le stonomètre.");
  }

  if (analysis.eye_balance === "significant_imbalance") {
    notes.push("L'écart entre les yeux peut charger la lecture planante.");
  }

  return notes.length ? notes.join(" ") : undefined;
}

function buildVibeNote(analysis: VisionAnalysis, score: number) {
  if (analysis.smile === "high" && score >= 60) {
    return "Tu gardes une sociabilité étonnante pour quelqu'un dont le regard a déjà pris une navette parallèle.";
  }

  if (analysis.expression === "blank" && analysis.gaze_focus !== "sharp") {
    return "Ton visage donne surtout une impression de silence intérieur très coûteux à interrompre.";
  }

  if (analysis.eye_openness === "wide" && analysis.gaze_focus === "sharp" && score <= 24) {
    return "Bonne nouvelle, tu regardes encore le monde comme s'il était en résolution normale.";
  }

  if (analysis.head_tilt === "visible_tilt" && score >= 70) {
    return "L'inclinaison ajoute une vraie énergie de personnage qui a déjà quitté la scène principale.";
  }

  return undefined;
}

function buildModeSentence(mode: AppMode, seedBase: string, key: keyof (typeof modeVoices)[AppMode]) {
  return pickDeterministic(modeVoices[mode][key], `${seedBase}:${key}`);
}

export function generateResult(
  analysis: VisionAnalysis,
  mode: AppMode,
  options?: ResultGenerationOptions,
): ResultCardData {
  const { score, signature } = computeDetailedScore(analysis);
  const level = getLevel(score);
  const modeMeta = modes[mode] ?? modes.normal;
  const tagSet = collectSignalTags(analysis, level.bucket, level.band, score);
  const seedBase = `${mode}:${score}:${signature}:${options?.variantSeed ?? "base"}:${analysis.stone_score}:${analysis.eye_openness}:${analysis.gaze_focus}:${analysis.smile}:${analysis.expression}:${analysis.lighting_quality}:${analysis.confidence}:${analysis.face_framing}:${analysis.pose}:${analysis.clarity_contrast}:${analysis.eye_balance}:${analysis.head_tilt}:${analysis.face_relaxation}`;

  const recentSelections = options?.recentSelections;
  const rawBadge = pickFreshCopy(
    getBucketAlignedPool(badges[mode][level.bucket], level.bucket, "badge"),
    `${seedBase}:badge:fresh`,
    Math.abs(signature) % 7,
    recentSelections?.badges,
  );
  const rawLine = pickFreshCopy(
    getBucketAlignedPool(roasts[mode][level.bucket], level.bucket, "line"),
    `${seedBase}:line:fresh`,
    Math.abs(signature) % 11,
    recentSelections?.lines,
  );
  const probableCauseCore = scoreTaggedCandidates(causes[mode][level.bucket], tagSet, `${seedBase}:cause`, signature).text;
  const tipCore = scoreTaggedCandidates(tips[mode][level.bucket], tagSet, `${seedBase}:tip`, signature).text;
  const challenge = pickFreshCopy(
    challenges[mode][level.bucket],
    `${seedBase}:challenge`,
    Math.abs(signature) % 5,
    recentSelections?.challenges,
  );
  const shareLineCore = pickFreshCopy(
    shareLines[mode][level.bucket],
    `${seedBase}:share`,
    Math.abs(signature) % 9,
    recentSelections?.shareLines,
  );

  const badgePrefix = buildModeSentence(mode, seedBase, "badgePrefix");
  const badge = `${badgePrefix} · ${rawBadge}`;
  const line = `${rawLine} ${buildModeSentence(mode, seedBase, "lineAddon")} ${buildBucketSentence(level.bucket, "line", seedBase)}`;
  const probableCause = `${probableCauseCore} ${buildModeSentence(mode, seedBase, "causeAddon")} ${buildBucketSentence(level.bucket, "cause", seedBase)}`;
  const tip = `${tipCore} ${buildModeSentence(mode, seedBase, "tipAddon")} ${buildBucketSentence(level.bucket, "tip", seedBase)}`;
  const shareLine = `${shareLineCore} ${buildModeSentence(mode, seedBase, "shareAddon")} ${buildBucketSentence(level.bucket, "share", seedBase)}`;

  const engineLabel = options?.usedFallback ? FUN_ESTIMATION_LABEL : "Analyse selfie IA + bibliothèque locale";
  const shareText = [
    "J'ai fait le test T'es stone ?",
    `Ref : ${modeMeta.label}`,
    `Score stone : ${score}/100`,
    `Badge : ${badge}`,
    `Cause probable : ${probableCause}`,
    `Conseil de survie : ${tip}`,
    shareLine,
  ].join("\n");

  return {
    score,
    level: level.label,
    tone: level.tone,
    badge,
    line,
    probableCause,
    tip,
    challenge,
    shareLine,
    shareText,
    mode,
    modeLabel: modeMeta.label,
    engineLabel,
    shortDisclaimer: RESULT_DISCLAIMER,
    bucket: level.bucket,
    reliabilityNote: buildReliabilityNote(analysis),
    photoNote: buildPhotoNote(analysis),
    vibeNote: buildVibeNote(analysis, score),
  };
}
