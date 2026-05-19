import { RESULT_DISCLAIMER, FUN_ESTIMATION_LABEL } from "@/lib/constants";
import { causes, challenges, modes, roasts, shareLines, tips } from "@/lib/content";
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

const modeBadgeWords: Record<AppMode, string[]> = {
  normal: ["zinc", "comptoir", "refrain", "demi-sec"],
  gentil: ["reggae", "hamac", "soleil mou", "fumée douce"],
  brutal: ["backstage", "cuir", "rappel", "rockstar rincée"],
  bureau: ["canapé", "plaid", "velours", "coussin"],
  etudiant: ["festival", "camping", "bracelet", "retour de set"],
  parent: ["dub", "basse lente", "lune", "écho"],
  couple: ["astral", "plafond", "navette", "silence cosmique"],
  tiktok: ["aquarium", "face cam", "néon", "bocal"],
  "apres-soiree": ["after", "retour", "néon", "fin de scène"],
  "avant-cafe": ["velours", "coussin", "canapé premium", "peignoir cosmique"],
};

const bandBadgeWords: Record<ScoreBandKey, string[]> = {
  clear: ["quasi propre", "à peine flou", "encore net", "presque sage"],
  spark: ["un peu mariné", "légèrement de travers", "déjà bancal", "mini nuage"],
  float: ["en glissade", "version folklore", "en retard intérieur", "semi-rincé"],
  lifted: ["bien flottant", "déjà douteux", "potache certifié", "en roue libre"],
  social: ["socialement douteux", "déjà loin", "rincé premium", "en sale orbite"],
  orbital: ["hautement satellisé", "très bancal", "version chantier", "en orbite douce"],
  cosmic: ["hors service", "sans pilote", "cassos deluxe", "chantier cosmique"],
};

const bandLineClosers: Record<ScoreBandKey, string[]> = {
  clear: [
    "Franchement, t'es surtout un peu à côté, pas stone.",
    "Ça reste léger, donc on te chambre plus qu'on ne t'enterre.",
    "Rien de dramatique, c'est juste une petite tête de travers bien rentable.",
  ],
  spark: [
    "Ça reste petit bras, mais assez pour te faire afficher dans le groupe.",
    "On commence à sentir le mini décrochage, juste ce qu'il faut pour la vanne.",
    "T'es encore récupérable, mais déjà très moquable.",
  ],
  float: [
    "Là, oui, ça commence à sentir la vraie dérive marrante.",
    "Tu flottes déjà assez pour que le roast soit mérité.",
    "On n'est plus dans la simple sale photo, on est dans la vibe suspecte.",
  ],
  lifted: [
    "Là, ta note commence à parler plus fort que tes excuses.",
    "Tu es dans la bonne zone pour devenir un souvenir de groupe.",
    "Ça flotte franchement, et ça se voit sans zoom.",
  ],
  social: [
    "Là, ton visage commence vraiment à raconter des choses graves pour ta réputation.",
    "On est sur un vrai départ contrôlé, mais certainement pas discret.",
    "Ta note autorise clairement le roast sale et bien mérité.",
  ],
  orbital: [
    "Là, ça devient une vraie pièce à conviction.",
    "Tu n'es plus juste flou, tu es officiellement en croisière faciale.",
    "On entre dans la belle zone de honte parfaitement défendable.",
  ],
  cosmic: [
    "Là, on tient un dossier, pas juste une photo.",
    "Ta note est trop haute pour qu'on fasse semblant d'être polis.",
    "On est dans la catégorie légende locale, archive et fou rire collectif.",
  ],
};

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
      "Le score reste bas, donc on parle plus de petite sale tête drôle que de crash orbital.",
      "À ce niveau-là, c'est surtout une micro tête de travers, pas encore un chantier cosmique.",
      "Le score dit surtout humain fonctionnel avec supplément connerie visuelle légère.",
      "On est sur du potache de proximité, pas sur un départ sans retour.",
    ],
    cause: [
      "Le score reste bas, donc le malaise est surtout esthétique et très moquable.",
      "Ici, ça joue plus sur la tête un peu molle que sur la disparition complète de ton âme.",
      "On lit surtout une petite embrouille entre ton regard et la discipline.",
      "Le bazar reste léger, juste assez pour mériter une vanne de pote.",
    ],
    tip: [
      "Pas besoin d'un plan Marshall, juste d'eau, deux respirations et un peu de dignité.",
      "Le bon move ici, c'est d'éviter d'en faire plus que ta gueule n'autorise.",
      "Avec ce score, un petit reset propre évite de finir en sketch gratuit.",
      "Reste sobre dans l'attitude, ton visage fait déjà assez le clown.",
    ],
    share: [
      "Le score reste soft, donc le roast peut se permettre d'être mesquin sans devenir absurde.",
      "On est sur du léger, juste assez pour humilier gentiment dans le groupe.",
      "La carte reste drôle parce que la note reste encore récupérable humainement.",
      "C'est de la petite potacherie bien fraîche, pas du sinistre total.",
    ],
  },
  medium: {
    line: [
      "Là, oui, on commence à voir une vraie gueule de retard intérieur.",
      "On est sur une vibe stone crédible, déjà bien assez floue pour faire rire les copains.",
      "Le score annonce quelqu'un de présent, mais clairement pas câblé en direct.",
      "Ça commence à sentir la tête qui fait du hors-piste sans prévenir.",
    ],
    cause: [
      "Le visage raconte une détente floue, un regard bancal et une vraie envie de canapé.",
      "Ici, le score parle d'un beau glissement vers le folklore, pas encore d'un effondrement total.",
      "Le tout donne une vraie énergie de cassos stellaire encore fréquentable.",
      "Ça sent la perte légère de sérieux, version drôle mais bien visible.",
    ],
    tip: [
      "Le plus utile ici, c'est de rester simple et de ne pas rajouter du bordel au bordel.",
      "À ce niveau, vise le confort, l'eau et les phrases plus courtes que ton regard.",
      "Le plan n'est pas de performer, juste d'éviter de devenir un running gag vivant.",
      "Fais petit, calme et basique, avant que ta tête n'écrive un sketch toute seule.",
    ],
    share: [
      "La note autorise déjà une vraie carte bien honteuse, mais pas encore le musée des catastrophes.",
      "Ça flotte sérieusement, tout en restant encore racontable sans avocat.",
      "Le score donne une vraie couleur stone, avec assez de marge pour un roast bien sale.",
      "On est dans la bonne zone pour humilier affectueusement et proprement.",
    ],
  },
  high: {
    line: [
      "Là, le score raconte franchement une tête qui a quitté l'open space intérieur.",
      "On n'est plus sur un simple nuage, mais sur une vraie sale orbite bien visible.",
      "Le niveau affiché autorise clairement un roast qui tape plus fort sans mentir.",
      "Ton visage commence officiellement à ressembler à un alibi mal préparé.",
    ],
    cause: [
      "Le visage mélange regard lent, détente massive et présence très mal défendue.",
      "Le score raconte quelqu'un dont l'âme a clairement demandé un délai supplémentaire.",
      "Ici, la vibe stone devient assez nette pour te transformer en personnage secondaire de légende.",
      "Ça sent la tête de mec qui a signé pour le canap plus que pour la journée.",
    ],
    tip: [
      "À ce niveau-là, évite les grandes décisions, les grandes phrases et les grands couloirs.",
      "L'idée, c'est d'aller au plus simple et de garder ton centre de gravité quelque part près du sol.",
      "Tout doit viser le confort, pas l'héroïsme conversationnel ni le freestyle debout.",
      "Sois humble, hydraté et proche d'une chaise responsable.",
    ],
    share: [
      "Là, le score peut clairement assumer une carte bien sale et très drôle.",
      "Le visuel autorise un ton plus cosmique parce que la note soutient vraiment la honte.",
      "On entre dans une zone où le partage peut partir en orbite sans forcer le trait.",
      "C'est le bon niveau pour du trash potache très assumé.",
    ],
  },
  extreme: {
    line: [
      "Ici, le score autorise clairement la grande humiliation cosmique.",
      "À ce niveau, ton visage a quitté la pièce pendant que ton corps fait semblant de gérer.",
      "Le niveau affiché justifie un ton sale, potache et totalement assumé.",
      "Là, on entre dans la zone chantier intersidéral certifié.",
    ],
    cause: [
      "Le regard, la détente et la lenteur visuelle racontent un crash moelleux déjà bien installé.",
      "Le score est assez haut pour soutenir une vraie narration de désastre très rigolo.",
      "À ce stade, la vibe dépasse le simple flottement et part en chantier parallèle.",
      "Ça sent la tête de légende locale qu'on ressortira au prochain apéro.",
    ],
    tip: [
      "Le plus sage ici, c'est eau, canapé, calme et zéro décision qui pourrait laisser des traces.",
      "On passe en mode protection douce, sans ambition inutile ni débat de plus de six mots.",
      "À ce niveau, tout doit servir la stabilité, le moelleux et la survie sociale minimale.",
      "Ne tente rien d'ambitieux, même ton reflet n'y croit plus.",
    ],
    share: [
      "Le score est assez haut pour assumer une carte franchement sale et spectaculaire.",
      "Ici, même le ton extrême reste en dessous de ce que raconte réellement ta tête.",
      "Le visuel permet clairement une sortie en orbite bien honteuse et bien drôle.",
      "C'est la zone où le roast devient patrimoine collectif.",
    ],
  },
};

const softenedPatterns: Record<StoneBucket, Partial<Record<"badge" | "line", RegExp[]>>> = {
  low: {
    badge: [/orbite totale/i, /cosmique total/i, /décollage sans tour de contrôle/i, /plus dans le chat/i, /cassos deluxe/i, /hors service/i, /chantier/i, /sinistre/i],
    line: [/quitté la dimension/i, /orbite totale/i, /corps gère l'administratif/i, /plus dans la pièce/i, /chantier/i, /désastre/i, /catastrophe/i, /avocat/i],
  },
  medium: {
    badge: [/cosmique total/i, /sans tour de contrôle/i, /plus dans le chat/i, /hors service/i, /sinistre/i],
    line: [/orbite totale/i, /corps gère l'administratif/i, /dimension parallèle/i, /désastre/i, /catastrophe/i],
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
    badgePrefix: ["Rapport du zinc", "PV du comptoir", "Lecture demi-sec", "Bilan serviette sale"],
    lineAddon: ["Version Renaud de comptoir, noble et franchement un peu éclatée.", "Le mode de base te lit comme un pilier drôle qui a dormi dans sa vanne.", "On sent le verre tiède, le refrain triste et la dignité qui tousse."],
    causeAddon: ["Le tout reste dans une vraie ambiance de PMU poétique mal rincé.", "On lit une nonchalance de comptoir très moquable mais presque classe.", "Ça raconte un personnage qui sent le couplet humide et la chaise branlante."],
    tipAddon: ["Fais simple et évite de transformer chaque phrase en chanson de fin de soirée.", "L'idée, c'est d'avoir l'air vivant sans devenir le troubadour du couloir.", "Reste calme, le zinc fait déjà le travail de sape."],
    shareAddon: ["Le comptoir a déposé plainte.", "Le stonomètre a rincé le couplet.", "Le PMU a désormais une photo officielle."],
  },
  gentil: {
    badgePrefix: ["Scan reggae", "Bilan hamac", "Lecture fumée douce", "PV soleil mou"],
    lineAddon: ["Le mode Bob Marley rend le désastre beaucoup trop sympathique.", "Ça flotte en hamac, mais le hamac t'a clairement volé dix points de sérieux.", "La vibe est douce, le roast aussi, la tête un peu moins."],
    causeAddon: ["Ici, tout respire le chill solaire qui fout la ponctualité à la poubelle.", "Le visage raconte une détente gentille mais très suspecte niveau organisation.", "La lecture reste cool, même quand ta face commence à faire n'importe quoi."],
    tipAddon: ["Vise la lumière, l'eau et le calme, pas le grand discours du sage du jardin.", "Reste dans une journée douce sans devenir un meuble heureux.", "Protège la vibe tranquille au lieu de lui ajouter du flou."],
    shareAddon: ["La basse tourne et toi un peu aussi.", "Le stonomètre m'a fumé avec le sourire.", "Le nuage est validé, version gentil cassos."],
  },
  brutal: {
    badgePrefix: ["Audit Jagger", "Contrôle backstage", "Procès du regard", "Constat cuir mental"],
    lineAddon: ["Le mode Mick Jagger te lit comme une rockstar rincée qui a perdu le mode d'emploi.", "Ici, on parle plus de vieux solo sale que de spiritualité élégante.", "Le visage dégage une vraie énergie de rappel que tout le monde voulait éviter."],
    causeAddon: ["Le décor raconte un after resté collé à ta gueule comme un ticket de vestiaire humide.", "Le rapport est sec, méchant et malheureusement crédible.", "On lit une légende fatiguée, très charismatique, très en vrac."],
    tipAddon: ["Réduis le show, garde l'équilibre et ferme le cabaret intérieur.", "Aujourd'hui, tu vises l'attitude minimale viable, pas la tournée mondiale.", "Évite le grand solo, tu n'as déjà plus le technicien lumière."],
    shareAddon: ["Le backstage a envoyé le dossier.", "Le miroir a lancé la version rockstar en SAV.", "Le roast pique, mais il danse encore."],
  },
  bureau: {
    badgePrefix: ["Rapport canapé", "Bilan velours", "Lecture salon profond", "Dossier plaid premium"],
    lineAddon: ["Le mode philosophe du canapé transforme ta tête en dissertation molle et assez ridicule.", "Ça réfléchit à l'univers sans même réussir à tenir son cou normalement.", "Le personnage préfère nettement le coussin à toute forme de responsabilité."],
    causeAddon: ["On lit une pensée lente qui a clairement élu domicile dans le moelleux.", "Le visage respire le débat abstrait mené à moitié allongé et complètement inutile.", "Tout tient du grand confort mental, du plaid et de la perte de timing."],
    tipAddon: ["Garde le décor simple, une idée à la fois, sans conférence TED au grille-pain.", "Protège ton canapé intérieur, mais garde au moins une allure humaine.", "Pas de grandes démonstrations, juste du calme, de l'eau et zéro thèse."],
    shareAddon: ["Le canapé a témoigné contre moi.", "Le stonomètre me voit déjà disserter sur un coussin sale.", "Mon regard vient d'obtenir un doctorat de lenteur honteuse."],
  },
  etudiant: {
    badgePrefix: ["Rapport festival", "Scan survivor", "Lecture fin de set", "Constat camping astral"],
    lineAddon: ["Le mode festival survivor te lit comme un retour de set sale et franchement peu défendable.", "On sent les basses encore coincées quelque part entre l'œil gauche et la dignité.", "Le personnage arrive avec de la poussière, du soleil et un vrai retard cognitif."],
    causeAddon: ["Le visage raconte une fin de nuit qui s'est clairement recousue à l'agrafeuse.", "On lit une survivance joyeuse, un peu crade, très terrain vague.", "La vibe est celle d'un lever de soleil vécu beaucoup trop près des enceintes et très loin du shampoing."],
    tipAddon: ["Eau, ombre et deux phrases maximum, c'est déjà héroïque.", "Garde ton énergie pour rentrer entier dans la journée et éviter les témoignages.", "Ce n'est pas le moment de faire le malin, ta tête a déjà parlé."],
    shareAddon: ["Le set continue dans mes pupilles.", "Le retour de festival a signé le procès-verbal.", "Mon visage a gardé un bracelet et perdu le reste."],
  },
  parent: {
    badgePrefix: ["Rapport dub lunaire", "Bilan basse lente", "Lecture nébuleuse reggae", "Constat orbite dub"],
    lineAddon: ["Le mode dub lunaire ralentit tout jusqu'à la moelle, et franchement ça se voit.", "Ça flotte en écho, version lune, enceintes fatiguées et cerveau sous perfusion de basse.", "Le personnage marche à contretemps du reste du monde et ça l'arrange beaucoup trop."],
    causeAddon: ["Le tout ressemble à une séance de dub dans une pièce bleue qui sent la démission douce.", "On lit une gravité molle, presque sonore, très nuit qui s'accroche aux rideaux.", "La tête raconte un remix cosmique bien installé et mal rangé."],
    tipAddon: ["Trouve du calme, de l'eau et une fréquence plus stable que ta tronche.", "Garde ton tempo doux au lieu de courir après des BPM que tu ne peux plus moralement suivre.", "Le meilleur plan reste la basse lente et les gestes minimum, presque éducatifs."],
    shareAddon: ["La basse a rédigé le rapport.", "Le dub a squatté mon visage sans prévenir.", "Mon regard mixe encore, et pas très proprement."],
  },
  couple: {
    badgePrefix: ["Rapport astral discret", "Lecture plafond cosmique", "Bilan voyage lent", "Constat sortie de dimension"],
    lineAddon: ["Le mode astral discret te lit comme quelqu'un qui revient de loin mais avec un air très condescendant envers la gravité.", "Le personnage regarde le plafond comme s'il était payé pour ça.", "On sent une escapade intérieure polie, mais vraiment bien installée dans la tronche."],
    causeAddon: ["Le tout respire le voyage lent, la pensée flottante et la disparition très bien élevée.", "Le visage raconte une absence douce, presque chic, mais franchement utile à personne.", "On lit une vraie dérive astrale, élégante comme une connerie en veste."],
    tipAddon: ["Reste dans des gestes simples, en douceur, sans te prendre pour un oracle silencieux.", "Une journée calme sera toujours plus belle qu'un forcing cosmique ridicule.", "Privilégie la lenteur choisie à la confusion décorative."],
    shareAddon: ["J'ai décroché poliment, mais sévèrement.", "Mon plafond dispose désormais des preuves matérielles.", "Je suis revenu avec un vrai délai astral et peu d'excuses."],
  },
  tiktok: {
    badgePrefix: ["Rapport aquarium", "POV yeux liquides", "Lecture néon flottant", "Verdict splash mental"],
    lineAddon: ["Le mode regard aquarium rend tout plus néon, plus liquide et franchement plus débile en face cam.", "Ça flotte comme si ton regard vivait derrière une vitre bleue avec abonnement premium.", "Le personnage est très vidéo verticale, très bulle silencieuse, très peu câblé."],
    causeAddon: ["Le tout donne une impression d'yeux en mode bocal cosmique bien chargé.", "On lit un regard qui laisse passer les informations avec la vitesse d'un poisson triste.", "La vibe est franchement aquarium, très esthétique, très peu concernée par le réel."],
    tipAddon: ["Garde les phrases courtes et la lumière douce, ton regard fait déjà du montage pirate.", "Le meilleur move, c'est de ne pas ajouter un écran à ce carnage liquide.", "Stabilise l'humain avant de relancer la caméra du monde et du malaise."],
    shareAddon: ["POV mon regard a ouvert son bocal.", "L'aquarium mental est officiellement en activité criminelle.", "Très face cam, très poisson cosmique, très peu responsable."],
  },
  "apres-soiree": {
    badgePrefix: ["Rapport after", "Bilan rocker rincé", "Lecture retour amplifié", "Constat fin de scène"],
    lineAddon: ["Le mode rocker d'after préfère les néons fatigués aux horaires normaux et ça se paie cash sur la photo.", "Ça sent le cuir mental, la fin de nuit et le regard qui n'a jamais reçu le mail de fin de service.", "Le personnage arrive avec du bruit résiduel dans la tête et très peu d'excuses recevables."],
    causeAddon: ["Le visage parle d'un retour amplifié qui ne s'excuse pas et n'aide personne.", "On lit une retombée lente, plus rock que calme domestique, plus sale que sage.", "Le décor reste chargé, même quand la musique est coupée et que la dignité demande pause."],
    tipAddon: ["Joue la récupération digne, pas le rappel bonus devant les meubles.", "Évite toute suite inutile, la scène a déjà fait assez de dégâts.", "Laisse ton système sortir du concert avant de lui demander un comportement citoyen."],
    shareAddon: ["Le rappel vit encore dans mes orbites.", "Le retour a gardé la guitare et perdu la retenue.", "Je sors d'un décor trop lumineux pour mériter autre chose que des moqueries."],
  },
  "avant-cafe": {
    badgePrefix: ["Rapport canapé premium", "Bilan moquette mentale", "Lecture fumée velours", "Constat coussin royal"],
    lineAddon: ["Le mode canapé premium transforme le regard en plaid très coûteux et très peu productif.", "Ça respire le luxe lent, le coussin profond et la grosse flemme institutionnelle.", "Le personnage a déjà réservé sa place dans un angle moelleux de l'univers et il n'a pas prévu de rendre la clé."],
    causeAddon: ["On lit surtout une envie de t'enfoncer dans le confort avec une gravité carrément insultante pour la journée.", "Le visage raconte le grand art de ne surtout pas se presser, ni maintenant, ni jamais.", "Le score se met ici au service d'un canapé qui a clairement pris le pouvoir."],
    tipAddon: ["Si tu peux faire simple, fais encore plus simple, presque végétatif.", "Eau, coussin, lumière douce, puis seulement un semblant de civilisation.", "Ton meilleur allié reste une journée basse intensité, très rembourrée et peu bavarde."],
    shareAddon: ["Le canapé a gagné par KO technique.", "Le velours a officiellement pris la direction des opérations.", "Je suis en partenariat stratégique avec un coussin imaginaire."],
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

function buildBadge(mode: AppMode, band: ScoreBandKey, seedBase: string) {
  const left = pickDeterministic(modeBadgeWords[mode], `${seedBase}:badge-mode`);
  const right = pickDeterministic(bandBadgeWords[band], `${seedBase}:badge-band`);
  return `${left} ${right}`;
}

function buildLine(rawLine: string, band: ScoreBandKey, seedBase: string) {
  return `${rawLine} ${pickDeterministic(bandLineClosers[band], `${seedBase}:line-closer`)}`;
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

  const badge = buildBadge(mode, level.band, seedBase);
  const line = buildLine(rawLine, level.band, seedBase);
  const probableCause = `${probableCauseCore} ${buildBucketSentence(level.bucket, "cause", seedBase)}`;
  const tip = `${tipCore} ${buildBucketSentence(level.bucket, "tip", seedBase)}`;
  const shareLine = `${shareLineCore} ${buildModeSentence(mode, seedBase, "shareAddon")}`;

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
