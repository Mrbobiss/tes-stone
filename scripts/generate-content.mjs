import fs from "node:fs";
import path from "node:path";

const outDir = path.join(process.cwd(), "content");
fs.mkdirSync(outDir, { recursive: true });

const buckets = ["low", "medium", "high", "extreme"];

const tierDefs = {
  low: {
    roastLead: [
      "Tu donnes plus une énergie terrasse lente qu'orbite incontrôlée",
      "Ton regard flotte un peu, mais il paie encore son loyer sur Terre",
      "On sent un mini nuage, pas un vrai départ cosmique",
      "Tu es encore très compréhensible pour l'administration",
    ],
    badgePrefix: ["Présence", "Vibe", "Nuage", "Regard"],
    badgeSuffix: ["encore terrestre", "à peine flou", "sous contrôle", "presque sage"],
    causes: [
      "un relâchement très léger du visage",
      "un regard un peu plus lent que ton wifi",
      "une détente visuelle presque élégante",
      "une petite dérive esthétique sans drame",
    ],
    tips: [
      "garde ton calme, un verre d'eau et le minimum syndical",
      "profite du fait d'être encore très terrestre pour rester simple",
      "ne surjoue rien, la vibe marche déjà toute seule",
      "préserve ta clarté au lieu de courir après un supplément de chaos",
    ],
    challenges: [
      "tenir une conversation entière sans regarder le plafond deux fois",
      "rester cool sans te transformer en poète du parking",
      "garder cette petite brume au stade décoratif",
      "survivre à une story sans cligner philosophiquement",
    ],
    shares: [
      "je suis encore gérable par la société civile",
      "mon regard a mis un filtre doux sur la réalité",
      "je flotte un peu mais je réponds encore présent",
      "je suis en micro-nuage homologué",
    ],
    causeTags: [["score-low", "combo-grounded"], ["gaze-steady", "eye-normal"], ["relax-neutral"], ["expression-amused"]],
    tipTags: [["score-low"], ["combo-grounded"], ["smile-medium"], ["gaze-sharp"]],
  },
  medium: {
    roastLead: [
      "Là, la conversation peut partir mais revenir un peu plus tard",
      "Ton visage a commencé à négocier avec une autre dimension",
      "On est sur une vraie vibe planante, encore sortable mais déjà lente",
      "Tu as l'air de répondre avec un léger délai spirituel",
    ],
    badgePrefix: ["Planage", "Nuage", "Canal", "Fréquence"],
    badgeSuffix: ["installé", "qui prend son temps", "à géométrie variable", "en basse altitude"],
    causes: [
      "un regard qui glisse doucement hors du powerpoint intérieur",
      "une détente faciale qui préfère clairement le canapé au timing",
      "une nonchalance assez visible pour mériter son badge",
      "une vibe qui ralentit tout sans demander la permission",
    ],
    tips: [
      "vise le confort, l'eau et des phrases plus courtes que d'habitude",
      "reste dans une journée basse intensité et évite le théâtre",
      "protège ta vibe avec du calme, pas avec une nouvelle aventure",
      "garde les décisions simples et les gestes encore plus simples",
    ],
    challenges: [
      "traverser la journée sans expliquer l'univers à quelqu'un",
      "rester assis sans faire de dissertation cosmique",
      "garder tes réponses plus courtes que tes pensées",
      "survivre à un vocal sans partir en méta",
    ],
    shares: [
      "je suis présent mais avec un léger délai astral",
      "mon regard a quitté la conversation avant moi",
      "je flotte assez pour inquiéter un agenda",
      "je suis en mode nuage mais encore socialisable",
    ],
    causeTags: [["score-medium", "gaze-distant"], ["eye-soft", "relax-relaxed"], ["expression-dreamy"], ["tilt-slight_tilt"]],
    tipTags: [["score-medium"], ["gaze-distant"], ["relax-relaxed"], ["expression-dreamy"]],
  },
  high: {
    roastLead: [
      "Ton regard a déjà pris la navette et ton corps gère l'accueil",
      "Là, on entre dans une vraie orbite douce mais parfaitement visible",
      "Tu donnes une énergie de personne présente uniquement par courtoisie",
      "Le visage dit clairement qu'il vit ailleurs mais qu'il reste poli",
    ],
    badgePrefix: ["Orbite", "Canapé", "Cosmos", "Plafond"],
    badgeSuffix: ["sociale", "sponsor officiel", "très proche", "déjà rentable"],
    causes: [
      "un combo regard lent, paupières lourdes et détente haut de gamme",
      "une belle sortie de route vers une fréquence plus molle que la moyenne",
      "un visage qui choisit clairement la voie du grand flottement",
      "une vibe visuelle qui a déjà pris un billet pour la lenteur",
    ],
    tips: [
      "garde de l'eau à portée et évite toute situation qui demande de la précision",
      "reste dans le simple, le stable et le canapé-compatible",
      "réduis le monde à trois priorités maximum et une seule à la fois",
      "la meilleure stratégie reste le confort discipliné",
    ],
    challenges: [
      "tenir jusqu'au déjeuner sans regarder un mur comme une œuvre",
      "passer un appel sans perdre le fil au mot trois",
      "garder un axe de déplacement crédible dans l'appartement",
      "survivre à une discussion de groupe sans dérive astrale ouverte",
    ],
    shares: [
      "mon visage vit déjà dans une version plus lente du monde",
      "je suis en orbite douce avec papiers en règle",
      "le stonomètre confirme un vrai départ contrôlé",
      "je suis social mais mon regard ne garantit rien",
    ],
    causeTags: [["score-high", "gaze-floating"], ["eye-half_closed", "relax-melted"], ["expression-sleepy"], ["tilt-visible_tilt"]],
    tipTags: [["score-high"], ["gaze-floating"], ["relax-melted"], ["combo-heavy-lids"]],
  },
  extreme: {
    roastLead: [
      "Tu n'es plus absent, tu es décoratif dans une autre dimension",
      "Ton corps fait l'administratif pendant que ton regard explore la moquette cosmique",
      "On est sur une légende de canapé, pas sur un simple petit nuage",
      "Le miroir a perdu la garde de ton attention il y a déjà un moment",
    ],
    badgePrefix: ["Dimension", "Canapé", "Tour de contrôle", "Service"],
    badgeSuffix: ["hors bureau", "impérial", "sans réponse", "en grève douce"],
    causes: [
      "une combinaison très premium de regard lointain, tête molle et orbite assumée",
      "une sortie complète vers une dimension parallèle beaucoup plus douce que la réalité",
      "une disparition visuelle suffisamment noble pour mériter sa propre galerie",
      "une lenteur spatiale qui a gagné la négociation très tôt",
    ],
    tips: [
      "eau, canapé, lumière douce et surtout aucune décision avec un verbe compliqué",
      "réduis la journée à l'essentiel absolu, puis encore un peu en dessous",
      "la seule vraie ambition ici, c'est la stabilité moelleuse",
      "protège ton calme comme un trésor de fin de niveau",
    ],
    challenges: [
      "traverser dix minutes sans fixer un objet comme s'il avait une âme",
      "ne pas lancer de théorie sur le temps, l'espace ou le frigo",
      "aller jusqu'à la cuisine avec une trajectoire diplomatique",
      "survivre à ton propre reflet sans signer un traité",
    ],
    shares: [
      "je suis officiellement en orbite avec assistance décorative",
      "mon regard a quitté le chat et m'a laissé le ticket",
      "je suis dans une dimension où le canapé a valeur constitutionnelle",
      "le stonomètre m'a classé patrimoine moelleux",
    ],
    causeTags: [["score-extreme", "gaze-floating"], ["eye-half_closed", "relax-melted"], ["tilt-visible_tilt"], ["expression-dreamy", "combo-soft-launch"]],
    tipTags: [["score-extreme"], ["relax-melted"], ["combo-heavy-lids"], ["tilt-visible_tilt"]],
  },
};

const modes = {
  normal: {
    label: "Renaud de comptoir",
    icon: "🍷",
    description: "Poésie de bar, ironie tendre et regard qui chante déjà la suite.",
    gradient: ["from-rose-500", "via-orange-400", "to-amber-300"],
    universe: ["le zinc du coin", "le comptoir", "la dernière clope imaginaire", "la nappe à carreaux"],
    badges: ["de comptoir", "qui connaît la chanson", "mi-lyrique mi-perdu", "à voix cassée"],
    causes: ["une ambiance de bar restée dans la rétine", "un personnage coincé dans un refrain", "une poésie de comptoir trop bien installée"],
    tips: ["reste sur du simple, du lent et du verre d'eau discret", "évite de transformer chaque phrase en chanson triste", "garde juste assez de panache pour tenir jusqu'au midi"],
    challenges: ["sans citer un vieux couplet au mauvais moment", "sans refaire le monde avec la machine à café", "sans devenir le troubadour de la cuisine"],
    shares: ["et le comptoir a validé", "et mon regard a gardé le refrain", "et le zinc me réclame déjà"],
  },
  gentil: {
    label: "Bob Marley",
    icon: "🌿",
    description: "Chill solaire, sourire lent et nuage très diplomatique.",
    gradient: ["from-emerald-500", "via-lime-400", "to-yellow-200"],
    universe: ["le hamac cosmique", "la basse tranquille", "le soleil doux", "le jardin mental"],
    badges: ["ensoleillé", "très chill", "en basse fréquence", "validé par la basse"],
    causes: ["une sérénité beaucoup trop confortable", "une vibe reggae qui ralentit tout", "un soleil intérieur visiblement très paresseux"],
    tips: ["garde du calme, de l'eau et zéro agressivité inutile", "avance en douceur au lieu de combattre la gravité", "protège ton sourire, il travaille pour toi"],
    challenges: ["sans répondre à tout avec une sagesse approximative", "sans transformer la journée en hamac administratif", "avec la même douceur jusqu'au goûter"],
    shares: ["et la basse tourne encore", "et le soleil intérieur refuse de speeder", "et mon nuage reste très aimable"],
  },
  brutal: {
    label: "Mick Jagger",
    icon: "🕺",
    description: "Rock sale, after en cuir et charisme légèrement rincé.",
    gradient: ["from-fuchsia-600", "via-rose-500", "to-orange-300"],
    universe: ["le backstage", "la scène vide", "le néon de fin de nuit", "les lunettes encore sur le nez"],
    badges: ["de tournée", "en post-rappel", "scéniquement entamé", "très backstage"],
    causes: ["une énergie de scène restée coincée dans le regard", "un reste d'after beaucoup trop photogénique", "un personnage qui a clairement raté sa sortie de scène"],
    tips: ["réduis le show, garde la pose et ménage la batterie", "fais moins de solo et plus de stabilité", "le charisme suffit, pas besoin d'une performance bonus"],
    challenges: ["sans faire un rappel à toi tout seul", "sans vivre la cuisine comme un backstage", "en gardant une trajectoire plus droite que ton eyeliner imaginaire"],
    shares: ["et le backstage me connaît par prénom", "et la scène refuse encore de me lâcher", "et mon regard est en tournée mondiale"],
  },
  bureau: {
    label: "Philosophe du canapé",
    icon: "🛋️",
    description: "Grand confort, pensée lente et dissertation allongée.",
    gradient: ["from-slate-600", "via-indigo-400", "to-cyan-300"],
    universe: ["le canapé profond", "le plaid conceptuel", "la table basse existentielle", "la sieste théorique"],
    badges: ["du canapé", "hautement rembourré", "très coussin", "en velours mental"],
    causes: ["une philosophie trop moelleuse pour aller vite", "un confort intérieur devenu doctrine", "une envie forte de penser à l'horizontale"],
    tips: ["fais une idée à la fois, sans thèse ni annexe", "garde ton monde à hauteur de coussin", "n'accepte aucune urgence qui ne rentre pas dans un plaid"],
    challenges: ["sans lancer un débat sur le sens du grille-pain", "sans traiter le canapé comme une université libre", "avec moins de métaphysique que d'eau"],
    shares: ["et mon canapé détient maintenant la preuve", "et la table basse m'écoute trop", "et mon âme a pris un fauteuil"],
  },
  etudiant: {
    label: "Festival survivor",
    icon: "🎪",
    description: "Bracelet imaginaire, lever de soleil douteux et basses dans l'œil gauche.",
    gradient: ["from-violet-600", "via-fuchsia-500", "to-cyan-300"],
    universe: ["le camping lunaire", "le lever de soleil trop honnête", "la poussière du set", "le bracelet fantôme"],
    badges: ["de festival", "bracelet invisible", "après set", "encore dans le line-up"],
    causes: ["un retour de set jamais vraiment terminé", "une nuit qui garde encore le goût du terrain", "des basses qui n'ont pas trouvé la sortie"],
    tips: ["eau, ombre, respiration, puis seulement le reste", "ne fais pas semblant d'être plus frais que ton regard", "garde ton énergie pour rejoindre la journée vivant"],
    challenges: ["sans chercher une scène là où il y a juste une cuisine", "sans raconter un line-up à ton reflet", "avec moins de poussière mentale que de patience"],
    shares: ["et le bracelet imaginaire est toujours là", "et les basses ont signé mon œil gauche", "et je suis encore quelque part dans le camping cosmique"],
  },
  parent: {
    label: "Dub lunaire",
    icon: "🌙",
    description: "Basses lentes, nuit bleue et orbite à tempo réduit.",
    gradient: ["from-indigo-700", "via-violet-500", "to-sky-300"],
    universe: ["la basse lente", "la lune dub", "la pièce bleue", "l'écho intérieur"],
    badges: ["dub", "en basse lente", "lunairement valide", "très écho"],
    causes: ["un remix intérieur trop bien installé", "une lenteur de basse qui a pris le pouvoir", "une réverbération mentale très confortable"],
    tips: ["garde le tempo bas et les gestes simples", "ne monte pas le BPM de ta journée pour rien", "fais confiance à l'eau et à la lenteur"],
    challenges: ["sans parler plus vite que la basse", "sans accélérer pour impressionner personne", "avec un tempo compatible avec la lune"],
    shares: ["et la basse raconte ma vérité", "et la lune dub m'a adopté", "et mon regard mixe encore"],
  },
  couple: {
    label: "Astral discret",
    icon: "🪐",
    description: "Petit voyage intérieur, plafond intéressant et absence polie.",
    gradient: ["from-sky-500", "via-indigo-400", "to-purple-300"],
    universe: ["le plafond cosmique", "la dérive polie", "la sortie discrète", "la navette intérieure"],
    badges: ["astral", "en sortie douce", "très plafond", "en navette calme"],
    causes: ["une dérive intérieure très bien élevée", "un voyage lent qui ne fait pas de bruit", "une absence douce restée dans les yeux"],
    tips: ["garde ta journée très simple et ne force rien", "autorise-toi une lenteur choisie", "évite tout ce qui demande une présence millimétrée"],
    challenges: ["sans tomber amoureux du plafond", "sans traiter le silence comme un guide", "avec juste assez de gravité pour rester sur Terre"],
    shares: ["et mon plafond a tout vu", "et la navette intérieure prend son temps", "et j'ai décroché avec élégance"],
  },
  tiktok: {
    label: "Regard aquarium",
    icon: "🐠",
    description: "Néon liquide, bulle silencieuse et face cam très bocal cosmique.",
    gradient: ["from-cyan-500", "via-blue-400", "to-fuchsia-400"],
    universe: ["le bocal néon", "la vitre bleue", "la bulle mentale", "l'aquarium intérieur"],
    badges: ["aquarium", "en bulle", "face cam liquide", "très vitre bleue"],
    causes: ["un regard qui nage plus qu'il ne marche", "une esthétique de bocal parfaitement assumée", "une bulle visuelle très difficile à chronométrer"],
    tips: ["garde la lumière douce et les phrases très courtes", "ne rajoute pas dix écrans à une vibe déjà très liquide", "stabilise l'humain avant de refaire une face cam"],
    challenges: ["sans cligner comme un poisson philosophique", "sans regarder la journée à travers une vitre imaginaire", "avec moins de bulles que d'eau"],
    shares: ["et mon regard nage dans son bocal", "et l'aquarium mental a ouvert", "et ma face cam est très poisson cosmique"],
  },
  "apres-soiree": {
    label: "Rocker d'after",
    icon: "🎸",
    description: "Fin de scène, néons fatigués et retour amplifié.",
    gradient: ["from-amber-600", "via-rose-500", "to-purple-400"],
    universe: ["le rappel de trop", "le néon du retour", "la guitare fantôme", "la fin de scène"],
    badges: ["d'after", "en rappel", "très amplifié", "de fin de scène"],
    causes: ["un retour qui n'a pas compris que le concert était fini", "un reste de nuit très amplifié", "une sortie de scène trop lente pour être honnête"],
    tips: ["évite le rappel bonus, vise la récupération digne", "laisse la scène se refermer avant de relancer quoi que ce soit", "reste dans le minimum viable jusqu'au retour du cerveau"],
    challenges: ["sans refaire un solo devant le frigo", "sans traiter le couloir comme une scène annexe", "avec plus d'eau que de légende"],
    shares: ["et le rappel est encore dans mes yeux", "et la fin de scène dure étrangement longtemps", "et mon retour a gardé la guitare"],
  },
  "avant-cafe": {
    label: "Canapé premium",
    icon: "☁️",
    description: "Velours mental, coussin imaginaire et luxe de la lenteur.",
    gradient: ["from-amber-400", "via-orange-300", "to-rose-200"],
    universe: ["le coussin royal", "le velours mental", "le nuage premium", "la moquette diplomatique"],
    badges: ["premium", "très coussin", "en velours", "homologué canapé"],
    causes: ["une envie de confort qui a gagné très tôt", "un velours intérieur beaucoup trop convaincant", "une noblesse de coussin impossible à ignorer"],
    tips: ["eau, lenteur, lumière douce, puis seulement civilisation", "réduis le bruit autour de toi au strict minimum", "aucune décision n'est urgente avant le premier redémarrage humain"],
    challenges: ["sans négocier avec un coussin imaginaire", "sans faire de la moquette un partenaire de vie", "avec une dignité compatible avec le velours"],
    shares: ["et le canapé a remporté l'appel d'offres", "et le velours a pris la direction", "et je suis en partenariat avec un coussin invisible"],
  },
};

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function uniqBy(values, keyFn) {
  const seen = new Set();
  return values.filter((value) => {
    const key = keyFn(value);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function makeTagged(text, tags) {
  return { text, tags: uniq(tags) };
}

function writeJson(name, value) {
  fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`);
}

const badges = {};
const roasts = {};
const causes = {};
const tips = {};
const challenges = {};
const shareLines = {};
const modePayload = {};

for (const [modeKey, mode] of Object.entries(modes)) {
  modePayload[modeKey] = {
    label: mode.label,
    icon: mode.icon,
    description: mode.description,
    gradient: mode.gradient,
  };

  badges[modeKey] = {};
  roasts[modeKey] = {};
  causes[modeKey] = {};
  tips[modeKey] = {};
  challenges[modeKey] = {};
  shareLines[modeKey] = {};

  for (const bucket of buckets) {
    const tier = tierDefs[bucket];

    badges[modeKey][bucket] = uniq(
      tier.badgePrefix.flatMap((prefix) =>
        tier.badgeSuffix.flatMap((suffix) =>
          mode.badges.map((badgeWord) => `${prefix} ${badgeWord} ${suffix}`),
        ),
      ),
    );

    roasts[modeKey][bucket] = uniq(
      tier.roastLead.flatMap((lead) =>
        mode.universe.flatMap((place) => [
          `${lead}, version ${mode.label.toLowerCase()} entre ${place} et patience civile.`,
          `${lead}, avec une vraie ambiance ${mode.label.toLowerCase()} plongée dans ${place}.`,
          `${lead}. On sent ${place} quelque part derrière tes yeux.`,
        ]),
      ),
    );

    causes[modeKey][bucket] = uniqBy(
      tier.causes.flatMap((cause, causeIndex) =>
        mode.causes.map((modeCause, modeIndex) =>
          makeTagged(
            `Ça sent ${cause}, plus ${modeCause}.`,
            [...tier.causeTags[causeIndex % tier.causeTags.length], `mode-${modeKey}`, `bucket-${bucket}`, `decile-${Math.min(9, Math.floor((causeIndex + modeIndex + 1) * 10 / 4))}`],
          ),
        ),
      ),
      (item) => item.text,
    );

    tips[modeKey][bucket] = uniqBy(
      tier.tips.flatMap((tip, tipIndex) =>
        mode.tips.map((modeTip) =>
          makeTagged(
            `Le meilleur move, c'est ${tip}, puis ${modeTip}.`,
            [...tier.tipTags[tipIndex % tier.tipTags.length], `mode-${modeKey}`, `bucket-${bucket}`],
          ),
        ),
      ),
      (item) => item.text,
    );

    challenges[modeKey][bucket] = uniq(
      tier.challenges.flatMap((challenge) => mode.challenges.map((modeChallenge) => `${challenge}, ${modeChallenge}.`)),
    );

    shareLines[modeKey][bucket] = uniq(
      tier.shares.flatMap((share) =>
        mode.shares.flatMap((modeShare) => [
          `${share}, ${modeShare}.`,
          `${mode.icon} ${modeShare}, ${share}.`,
          `${share} version ${mode.label.toLowerCase()}, ${modeShare}.`,
        ]),
      ),
    );
  }
}

writeJson("modes.json", modePayload);
writeJson("badges.json", badges);
writeJson("roasts.json", roasts);
writeJson("causes.json", causes);
writeJson("tips.json", tips);
writeJson("challenges.json", challenges);
writeJson("shareLines.json", shareLines);

console.log(
  JSON.stringify(
    {
      badges: Object.values(badges).reduce((sum, perMode) => sum + Object.values(perMode).reduce((a, b) => a + b.length, 0), 0),
      roasts: Object.values(roasts).reduce((sum, perMode) => sum + Object.values(perMode).reduce((a, b) => a + b.length, 0), 0),
      causes: Object.values(causes).reduce((sum, perMode) => sum + Object.values(perMode).reduce((a, b) => a + b.length, 0), 0),
      tips: Object.values(tips).reduce((sum, perMode) => sum + Object.values(perMode).reduce((a, b) => a + b.length, 0), 0),
      challenges: Object.values(challenges).reduce((sum, perMode) => sum + Object.values(perMode).reduce((a, b) => a + b.length, 0), 0),
      shareLines: Object.values(shareLines).reduce((sum, perMode) => sum + Object.values(perMode).reduce((a, b) => a + b.length, 0), 0),
    },
    null,
    2,
  ),
);
