import fs from "node:fs";
import path from "node:path";

const outDir = path.join(process.cwd(), "content");
fs.mkdirSync(outDir, { recursive: true });

const buckets = ["low", "medium", "high", "extreme"];

const tierDefs = {
  low: {
    roastLead: [
      "Tu donnes surtout l'énergie d'un mec qui a raté un clignement de trop",
      "Ton regard flotte un peu, mais il paie encore un loyer sur Terre",
      "On dirait un petit nuage qui essaie de se faire passer pour de la discipline",
      "Tu es à deux millimètres du propre, et à un cheveu du folklore",
      "Franchement, tu restes gérable, juste légèrement mariné dans le vide",
      "Ton visage ressemble à une vanne nulle qui marche quand même",
    ],
    roastTwist: [
      "avec une dignité encore sauvable",
      "version potache mais encore acceptable en société",
      "comme si ton cerveau avait mis le mode avion sur une seule oreille",
      "avec juste assez de flou pour inquiéter un prof principal",
      "dans une version où la lucidité est présente, mais assise au fond",
      "comme un humain normal, mais avec le regard qui patine un peu",
    ],
    badgePrefix: ["Constat", "Rapport", "Lecture", "Diagnostic du PMU", "Contrôle", "Scan"],
    badgeSuffix: ["encore présentable", "un peu mariné", "à peine satellisé", "presque sérieux", "sous contrôle relatif", "semi-propre"],
    causes: [
      "un petit retard de synchronisation entre tes yeux et le reste",
      "une détente faciale qui a pris un RTT surprise",
      "un regard légèrement en chaussettes",
      "une mini dérive de pupilles sans vraie volonté de nuire",
      "un début de mollesse visuelle bien planquée",
      "une micro absence qui se croit discrète",
    ],
    tips: [
      "reste simple, bois de l'eau et évite de faire le philosophe pour rien",
      "garde tes phrases courtes avant qu'elles ne deviennent des accidents",
      "ne force pas le personnage, il est déjà là tout seul",
      "fais le minimum syndical avec une tête correcte",
      "évite les grandes déclarations, tu n'as pas les yeux pour ça aujourd'hui",
      "reste civilisé, ça suffira déjà largement",
    ],
    challenges: [
      "tenir une conversation entière sans regarder le plafond comme un indice",
      "survivre à une story sans avoir l'air d'un poisson distrait",
      "rester propre sans partir dans un numéro de bouffon contemplatif",
      "croiser quelqu'un sans avoir l'air de revenir d'une sieste spirituelle",
      "répondre vite sans laisser ton regard en arrière-plan",
      "garder ta dignité pendant trois messages d'affilée",
    ],
    shares: [
      "je suis encore compatible avec la société civile",
      "j'ai l'air presque carré, mais pas complètement",
      "je flotte un peu, juste assez pour faire rire un pote",
      "mon regard a pris un petit virage de départementale",
      "je suis en micro-stone homologué",
      "ça va, mais mon visage a déjà fait une blague tout seul",
    ],
    causeTags: [["score-low", "combo-grounded"], ["gaze-steady", "eye-normal"], ["relax-neutral"], ["expression-amused"], ["balance-balanced"], ["smile-medium"]],
    tipTags: [["score-low"], ["combo-grounded"], ["smile-medium"], ["gaze-sharp"], ["eye-normal"], ["confidence-high"]],
  },
  medium: {
    roastLead: [
      "Là, ton visage commence franchement à raconter de la merde charmante",
      "Tu as l'air de répondre avec un délai qui mérite sa propre musique d'attente",
      "On sent un vrai petit décrochage, version drôle et pas encore dramatique",
      "Ton regard a commencé à prendre des décisions sans prévenir le reste de l'équipe",
      "Tu ressembles à quelqu'un qui a entendu une blague intérieure il y a vingt minutes",
      "Franchement, ça sent déjà le personnage qui glisse hors de la réunion",
    ],
    roastTwist: [
      "avec une belle énergie de cassos cosmique encore fréquentable",
      "comme si tes yeux avaient signé ailleurs que ton visage",
      "dans une version où la dignité tient encore, mais de travers",
      "avec une lenteur assez noble pour devenir une vanne récurrente",
      "comme un pote très sympa, mais plus piloté par la gravité",
      "dans une ambiance où ton cerveau a clairement demandé moins de responsabilités",
    ],
    badgePrefix: ["Bilan", "Rapport", "Lecture", "État de service", "Contrôle", "Dossier", "Constat", "PV du regard"],
    badgeSuffix: ["en glissade", "qui prend son temps", "semi-rincé", "déjà folklorique", "en retard intérieur", "avec option canap", "potache certifié", "en dérive contrôlée"],
    causes: [
      "un regard qui part doucement en roue libre",
      "une détente faciale qui a déjà perdu la bataille du sérieux",
      "une petite flemme cosmique collée à la rétine",
      "un décalage très net entre ta bouche et ton âme",
      "un visage qui donne l'impression d'arriver après lui-même",
      "une nonchalance qui mérite un rappel à l'ordre et un coussin",
    ],
    tips: [
      "vise le confort, l'eau et des phrases plus courtes que ta légende",
      "reste dans une journée basse intensité avant de devenir un sketch vivant",
      "ne prends aucune décision qui demande une ligne droite intérieure",
      "évite le théâtre, ton visage joue déjà la pièce tout seul",
      "choisis la version calme de toi-même, l'autre n'est pas fiable",
      "si tu peux t'économiser une interaction, fais-le sans trembler",
    ],
    challenges: [
      "traverser la journée sans raconter l'univers à la mauvaise personne",
      "tenir un vocal sans perdre le sujet au mot quatre",
      "marcher droit sans négocier avec le décor",
      "avoir l'air présent pendant plus de trente secondes de suite",
      "survivre à un appel sans donner l'impression de revenir de Neptune",
      "regarder quelqu'un dans les yeux sans partir sur une tangentielle mentale",
    ],
    shares: [
      "je suis présent mais mon regard a pris de l'avance sur moi",
      "je flotte assez pour faire douter un agenda",
      "le stonomètre dit que je suis encore sortable, mais en freestyle",
      "mon visage a commencé un week-end sans me prévenir",
      "je suis officiellement en stone social, avec options gênantes",
      "ça commence à sentir la connerie stellaire bien assumée",
    ],
    causeTags: [["score-medium", "gaze-distant"], ["eye-soft", "relax-relaxed"], ["expression-dreamy"], ["tilt-slight_tilt"], ["combo-soft-launch"], ["clarity-medium"]],
    tipTags: [["score-medium"], ["gaze-distant"], ["relax-relaxed"], ["expression-dreamy"], ["tilt-slight_tilt"], ["combo-soft-launch"]],
  },
  high: {
    roastLead: [
      "Ton regard a clairement quitté le service minimum syndical",
      "Là, on est sur une belle tête de génie du canap en mission spéciale",
      "Tu donnes l'impression d'être là par courtoisie administrative uniquement",
      "Le visage dit très clairement bonsoir alors qu'on est encore en journée",
      "On voit un vrai départ en orbite, mais avec un sourire de fraude tranquille",
      "Tu ressembles à une anecdote que tes potes vont ressortir pendant six mois",
    ],
    roastTwist: [
      "avec une énergie de merguez cosmique parfaitement assumée",
      "comme si ton âme était en after et ton corps en SAV",
      "dans une version où même ton reflet ne signerait pas le rapport",
      "avec la noblesse d'un clown fatigué qui garde son charisme",
      "comme un champion régional de la latence faciale",
      "dans une ambiance où la gravité doit te faire deux rappels par minute",
    ],
    badgePrefix: ["Rapport", "Constat", "PV cosmique", "Bilan", "Lecture", "Contrôle", "Scellé", "Expertise"],
    badgeSuffix: ["de sale gueule douce", "hautement satellisé", "très bancal", "en post-combustion", "socialement dangereux", "en descente moelleuse", "déjà loin", "rincé premium"],
    causes: [
      "un combo paupières lourdes, regard absent et mollesse de seigneur",
      "une sortie de route élégante mais totalement voyante",
      "un visage qui s'est mis d'accord avec le canapé contre la civilisation",
      "une lenteur si nette qu'elle devrait payer un abonnement",
      "un air de retour d'after mal recousu à la réalité",
      "une gueule de mec qui a vu passer le bus de la lucidité sans courir après",
    ],
    tips: [
      "reste sur eau, calme et tâches sans conséquences juridiques",
      "évite les décisions longues, les trottoirs rapides et les débats inutiles",
      "garde ton centre de gravité près d'une chaise honnête",
      "vise le confort immédiat au lieu de faire le héros du groupe",
      "ne pilote rien d'autre que ta respiration et éventuellement un plaid",
      "garde les interactions courtes, ton visage improvise déjà assez",
    ],
    challenges: [
      "tenir jusqu'au prochain repas sans parler à un mur comme à un vieux pote",
      "passer un appel sans laisser ton cerveau en file d'attente",
      "aller à la cuisine sans faire une chorégraphie imprévue",
      "répondre à un message sans avoir l'air possédé par un hamac",
      "survivre à une discussion de groupe sans quitter la planète en direct",
      "rester crédible alors que ton regard écrit sa propre fanfiction",
    ],
    shares: [
      "mon visage vit déjà dans une version pirate du réel",
      "je suis en stone social, mais mon regard refuse toute garantie",
      "le stonomètre confirme un vrai départ avec retour non contractuel",
      "je suis là physiquement, pour le reste faut voir demain",
      "j'ai la tête d'un gars qui a laissé sa lucidité au vestiaire",
      "ça sent le canap astral avec service minimum humain",
    ],
    causeTags: [["score-high", "gaze-floating"], ["eye-half_closed", "relax-melted"], ["expression-sleepy"], ["tilt-visible_tilt"], ["combo-heavy-lids"], ["combo-soft-launch"]],
    tipTags: [["score-high"], ["gaze-floating"], ["relax-melted"], ["combo-heavy-lids"], ["expression-sleepy"], ["tilt-visible_tilt"]],
  },
  extreme: {
    roastLead: [
      "Là, ton visage est une infraction drôle à la sobriété visuelle",
      "Tu n'es plus dans la pièce, tu es devenu le mobilier comique du cosmos",
      "Ton corps fait l'administratif pendant que ton regard fait de la brocante intersidérale",
      "On dirait un PNJ rincé écrit par un pote qui te déteste bien",
      "Le miroir a vu trop de choses et il hésite à témoigner",
      "Tu ressembles à une fin de soirée qui a eu une pension alimentaire",
    ],
    roastTwist: [
      "avec un niveau de cassos galactique presque académique",
      "comme si ta dignité était partie fumer et avait oublié de revenir",
      "dans une version où même le canapé demande des explications",
      "avec le charisme d'une catastrophe molle très sûre d'elle",
      "comme un roi du bide cosmique sous assistance décorative",
      "dans une ambiance où tes yeux sont clairement gérés par une autre administration",
    ],
    badgePrefix: ["Scellé", "Rapport terminal", "PV cosmique", "Expertise de sinistre", "Bilan du désastre", "Constat ultime", "Audit du néant", "Procès-verbal"],
    badgeSuffix: ["hors service", "en orbite fiscale", "complètement rincé", "de grande tradition", "sans pilote", "très sale mais drôle", "cassos deluxe", "version chantier"],
    causes: [
      "une combinaison premium de regard mort, tête molle et dignité débranchée",
      "un départ spatial si visible qu'il pourrait avoir des témoins",
      "une disparition mentale soutenue par une vraie volonté de canapé",
      "une lenteur tellement installée qu'elle devrait payer un loyer",
      "un crash moelleux entre ton cerveau, tes yeux et la chronologie",
      "une gueule de lendemain qui a pris des vitamines de chaos",
    ],
    tips: [
      "réduis l'existence à eau, canapé, silence et zéro décision ambitieuse",
      "n'entreprends rien qui demande une coordination supérieure à mettre des chaussettes",
      "protège ton calme comme si c'était le dernier adulte disponible",
      "reste proche d'un support moelleux et loin de toute idée brillante",
      "parle peu, bouge simple et ne signe rien qui te suivra demain",
      "si quelqu'un te propose une aventure, réponds non avant même la fin de la phrase",
    ],
    challenges: [
      "traverser dix minutes sans fixer un objet comme s'il t'avait parlé",
      "aller jusqu'au frigo sans avoir l'air d'un personnage sous low budget cosmique",
      "tenir un échange humain sans te dissoudre dans le silence",
      "survivre à ton propre reflet sans demander un avocat",
      "rester debout avec une dignité suffisante pour éviter le documentaire",
      "ne pas transformer une simple cuisine en boss final de journée",
    ],
    shares: [
      "je suis officiellement classé objet planant non identifié",
      "le stonomètre m'a mis dans la catégorie chantier cosmique",
      "mon regard a quitté le chat, le salon et probablement le code postal",
      "je suis dans une dimension où même le canapé a pris le pouvoir",
      "ma tête vient d'être homologuée sale mais spectaculaire",
      "c'est plus du stone, c'est une comédie matérielle",
    ],
    causeTags: [["score-extreme", "gaze-floating"], ["eye-half_closed", "relax-melted"], ["tilt-visible_tilt"], ["expression-dreamy", "combo-soft-launch"], ["combo-heavy-lids"], ["combo-photo-messy"]],
    tipTags: [["score-extreme"], ["relax-melted"], ["combo-heavy-lids"], ["tilt-visible_tilt"], ["expression-sleepy"], ["combo-soft-launch"]],
  },
};

const modes = {
  normal: {
    label: "Renaud de comptoir",
    icon: "🍷",
    description: "Poésie rincée, comptoir blessé et charisme de fin de verre.",
    gradient: ["from-rose-500", "via-orange-400", "to-amber-300"],
    universe: ["le zinc du coin", "la table collante", "la nappe à carreaux", "la dernière clope imaginaire", "la machine à café triste", "le tabouret fatigué"],
    badges: ["de comptoir", "à voix cassée", "de patron du PMU", "mi-lyrique mi-cuit", "de chanson douteuse", "de vieux refrain humide"],
    causes: ["une poésie de bar restée collée à la rétine", "un refrain tiède coincé dans la mâchoire", "une noblesse de pilier mal recousue", "un romantisme de demi sec devenu facial", "une gueule de couplet trop long", "une ambiance de fin de tournée au café du coin"],
    tips: ["reste sur du simple, du lent et de l'eau en cachette", "évite de transformer chaque phrase en vieux tube triste", "tiens ton panache mais coupe le volume", "ne fais pas de monologue à la cafetière", "garde tes métaphores sous clé jusqu'à nouvel ordre", "laisse le personnage en veille, il est déjà très présent"],
    challenges: ["sans citer un couplet au mauvais moment", "sans refaire le monde avec la machine à café", "sans devenir le troubadour du couloir", "sans chanter dans ta tête plus fort que tu ne marches", "sans donner envie d'appeler un accordéon", "sans transformer le silence en karaoké intérieur"],
    shares: ["et le zinc a signé", "et le comptoir a rendu son verdict", "et mon regard sent la fin de verre", "et la nappe à carreaux a des preuves", "et le PMU réclame déjà ma photo", "et j'ai une gueule écrite au marqueur sur une serviette"],
  },
  gentil: {
    label: "Bob Marley",
    icon: "🌿",
    description: "Soleil mou, sourire en hamac et retard très diplomatique.",
    gradient: ["from-emerald-500", "via-lime-400", "to-yellow-200"],
    universe: ["le hamac cosmique", "la basse tranquille", "le soleil mou", "le jardin mental", "la fumée heureuse", "la plage intérieure"],
    badges: ["très chill", "validé par la basse", "ensoleillé de travers", "en fumée douce", "version reggae molle", "apaisé mais suspect"],
    causes: ["une sérénité trop large pour tenir dans un regard", "un soleil intérieur qui a viré paresseux", "une douceur devenue clairement un problème d'organisation", "une basse lente posée sur les paupières", "un sourire qui fait le boulot de toute la tête", "une lenteur joyeuse qui fume la ponctualité"],
    tips: ["garde de l'eau, du calme et zéro agressivité inutile", "avance en douceur au lieu de combattre la gravité", "protège ton sourire, il cache bien le reste", "évite de t'installer trop fort dans le hamac du réel", "fais moins de philosophie verte et plus de gestes basiques", "reste chill mais pas décoratif"],
    challenges: ["sans répondre à tout avec une sagesse approximative", "sans transformer la journée en hamac administratif", "sans sourire comme si tu avais compris un secret sur les nuages", "sans donner l'impression d'écouter une basse que personne n'entend", "sans parler en tempo lent à des gens pressés", "avec un minimum de gravité républicaine"],
    shares: ["et la basse tourne encore", "et le soleil intérieur refuse de speeder", "et mon nuage est d'une politesse suspecte", "et mon regard sent la fumée aimable", "et j'ai le charisme d'un hamac officiel", "et la vibe est douce mais vraiment pas nette"],
  },
  brutal: {
    label: "Mick Jagger",
    icon: "🕺",
    description: "After sale, charisme rincé et rockstar très peu aidée.",
    gradient: ["from-fuchsia-600", "via-rose-500", "to-orange-300"],
    universe: ["le backstage", "la scène vide", "le néon de fin de nuit", "les lunettes encore sur le nez", "le cuir mental", "le couloir d'after"],
    badges: ["de tournée", "très backstage", "de rappel foireux", "scéniquement rincé", "de rockstar en SAV", "post-solo fatigué"],
    causes: ["une énergie de scène restée coincée dans le regard", "un after qui s'est installé dans les pommettes", "une sortie de scène ratée mais charismatique", "une fatigue de diva avec budget limité", "une gueule de rappel que personne n'avait commandé", "un cuir mental bien trop visible sur la photo"],
    tips: ["réduis le show, garde la pose et ménage la batterie", "fais moins de solo et plus de stabilité", "laisse ta rockstar intérieure fermer sa gueule cinq minutes", "évite le rappel bonus, tu n'as plus le public pour ça", "marche simple, parle court, regarde droit si possible", "cesse de vivre chaque pièce comme un backstage"],
    challenges: ["sans faire un rappel à toi tout seul", "sans vivre la cuisine comme un backstage", "sans avoir l'air d'une star en garde à vue esthétique", "avec une trajectoire plus droite que ton eyeliner imaginaire", "sans confondre dignité et dernier solo", "sans rejouer la fin du concert devant le micro-ondes"],
    shares: ["et le backstage me doit un dédommagement", "et la scène refuse encore de me lâcher", "et mon regard est en tournée mondiale de la gêne", "et j'ai une tête de rappel non autorisé", "et le néon a clairement gagné la bataille", "et mon visage sent la rockstar sous assistance"],
  },
  bureau: {
    label: "Philosophe du canapé",
    icon: "🛋️",
    description: "Canapé doctoral, pensée molle et dissertation profondément inutile.",
    gradient: ["from-slate-600", "via-indigo-400", "to-cyan-300"],
    universe: ["le canapé profond", "le plaid conceptuel", "la table basse existentielle", "la sieste théorique", "le coussin diplômé", "la moquette introspective"],
    badges: ["du canapé", "en velours mental", "hautement rembourré", "de métaphysique molle", "à coussin dominant", "de pensée allongée"],
    causes: ["une philosophie trop moelleuse pour aller vite", "un confort intérieur devenu religion", "une dissertation déjà couchée dans les traits", "une envie de penser à l'horizontale très visible", "un plaid conceptuel posé sur les pupilles", "une flemme intellectuelle décorée comme une école"],
    tips: ["fais une idée à la fois, sans thèse ni annexe", "garde ton monde à hauteur de coussin", "n'accepte aucune urgence qui ne rentre pas dans un plaid", "évite d'expliquer la vie au grille-pain", "fais moins de métaphysique et plus d'eau", "ne transforme pas ton canapé intérieur en gouvernement"],
    challenges: ["sans lancer un débat sur le sens du grille-pain", "sans traiter le canapé comme une université libre", "sans regarder la table basse comme un oracle", "avec moins de métaphysique que d'eau", "sans écrire une thèse intérieure pendant qu'on te parle", "sans te dissoudre dans un coussin conceptuel"],
    shares: ["et mon canapé détient maintenant les preuves", "et la table basse m'écoute trop", "et mon regard a obtenu un master de lenteur", "et le plaid est devenu mon manager", "et je pense trop mou pour être honnête", "et ma dignité porte des chaussons"],
  },
  etudiant: {
    label: "Festival survivor",
    icon: "🎪",
    description: "Retour de set, soleil gênant et cerveau sous bracelet fantôme.",
    gradient: ["from-violet-600", "via-fuchsia-500", "to-cyan-300"],
    universe: ["le camping lunaire", "le lever de soleil trop honnête", "la poussière du set", "le bracelet fantôme", "la tente mentale", "le gobelet oublié"],
    badges: ["de festival", "après set", "bracelet invisible", "de camping cosmique", "très line-up", "survivor homologué"],
    causes: ["un retour de set jamais vraiment terminé", "une nuit qui sent encore la poussière et la honte joyeuse", "des basses restées coincées dans un œil", "une tête de lever de soleil qui n'avait rien demandé", "un cerveau visiblement garé derrière une scène", "un bracelet imaginaire toujours attaché à la mâchoire"],
    tips: ["eau, ombre, respiration, puis seulement le reste", "ne fais pas semblant d'être plus frais que ton regard", "garde ton énergie pour rejoindre la journée vivant", "n'essaie pas d'être drôle, ton visage fait déjà le travail", "évite les trajets longs et les explications détaillées", "laisse sortir le festival avant d'accepter une vraie conversation"],
    challenges: ["sans chercher une scène là où il y a juste une cuisine", "sans raconter le line-up à ton reflet", "avec moins de poussière mentale que de patience", "sans croire que le frigo est un stand de ravito", "sans laisser les basses parler à ta place", "en gardant une démarche compatible avec la vie civile"],
    shares: ["et le bracelet imaginaire est encore là", "et les basses ont signé mon œil gauche", "et je suis toujours quelque part dans le camping cosmique", "et ma tête sent le retour de set mal fermé", "et le soleil m'a clairement pris en traître", "et ma dignité a passé la nuit sous une tente"],
  },
  parent: {
    label: "Dub lunaire",
    icon: "🌙",
    description: "Basse lente, pièce bleue et orbite qui marche en retard.",
    gradient: ["from-indigo-700", "via-violet-500", "to-sky-300"],
    universe: ["la basse lente", "la lune dub", "la pièce bleue", "l'écho intérieur", "la chambre mentale", "le caisson astral"],
    badges: ["dub", "lunairement valide", "en basse lente", "très écho", "de nuit ralentie", "version caisson intérieur"],
    causes: ["un remix intérieur trop bien installé", "une lenteur de basse qui a pris le pouvoir", "une réverbération mentale visiblement trop confortable", "un écho mou posé dans tout le regard", "une vibe de pièce bleue en fin de trajet", "un dub intérieur qui refuse de sortir du visage"],
    tips: ["garde le tempo bas et les gestes simples", "ne monte pas le BPM de ta journée pour rien", "fais confiance à l'eau et à la lenteur", "si ça peut être calme, fais encore plus calme", "évite les gens rapides et les idées encore plus rapides", "reste en fréquence basse jusqu'à stabilisation humaine"],
    challenges: ["sans parler plus vite que la basse", "sans accélérer pour impressionner personne", "avec un tempo compatible avec la lune", "sans traiter chaque silence comme un effet sonore", "sans dériver en remix intérieur pendant une question simple", "en gardant une vitesse légale pour tes pensées"],
    shares: ["et la basse raconte ma vérité", "et la lune dub m'a clairement adopté", "et mon regard mixe encore en fond", "et j'ai un caisson dans les pommettes", "et le stonomètre m'a lu en version écho", "et ma tête tourne en basse fréquence"],
  },
  couple: {
    label: "Astral discret",
    icon: "🪐",
    description: "Voyage poli, plafond suspect et absence très bien élevée.",
    gradient: ["from-sky-500", "via-indigo-400", "to-purple-300"],
    universe: ["le plafond cosmique", "la dérive polie", "la sortie discrète", "la navette intérieure", "le silence galactique", "la planète perso"],
    badges: ["astral", "en sortie douce", "très plafond", "de navette calme", "en dérive chic", "version absence propre"],
    causes: ["une dérive intérieure très bien élevée", "un voyage lent qui fait semblant d'être sobre", "une absence douce restée dans les yeux", "un plafond devenu un vrai partenaire de discussion", "une navette mentale en service discret", "une pensée partie loin mais revenue avec un sourire"],
    tips: ["garde ta journée très simple et ne force rien", "autorise-toi une lenteur choisie", "évite tout ce qui demande une présence millimétrée", "ne confonds pas silence et maîtrise du monde", "reste sur des gestes basiques, le cosmos n'a pas besoin de ton aide", "si tu pars dans le plafond, fais au moins un aller-retour rapide"],
    challenges: ["sans tomber amoureux du plafond", "sans traiter le silence comme un coach de vie", "avec juste assez de gravité pour rester sur Terre", "sans avoir l'air de recevoir un appel interplanétaire", "sans répondre à côté avec un sourire trop calme", "en gardant une politesse compatible avec la réalité"],
    shares: ["et mon plafond a tout vu", "et la navette intérieure prend vraiment son temps", "et j'ai décroché avec beaucoup trop d'élégance", "et mon regard a signé un départ poli", "et je suis absent, mais avec de bonnes manières", "et mon silence a désormais une carte de visite"],
  },
  tiktok: {
    label: "Regard aquarium",
    icon: "🐠",
    description: "Face cam liquide, néon sale et cerveau en bocal premium.",
    gradient: ["from-cyan-500", "via-blue-400", "to-fuchsia-400"],
    universe: ["le bocal néon", "la vitre bleue", "la bulle mentale", "l'aquarium intérieur", "la face cam sale", "le filtre liquide"],
    badges: ["aquarium", "face cam liquide", "en bulle", "très vitre bleue", "de poisson cosmique", "filtré par le bocal"],
    causes: ["un regard qui nage plus qu'il ne marche", "une esthétique de bocal devenue carrément structurelle", "une bulle visuelle impossible à chronométrer", "un cerveau qui fait du contenu sans prévenir la personne", "un filtre liquide collé aux pupilles", "un effet poisson premium dans la face cam"],
    tips: ["garde la lumière douce et les phrases très courtes", "ne rajoute pas dix écrans à une vibe déjà très liquide", "stabilise l'humain avant de refaire une face cam", "évite le scroll si ton regard est déjà en aquarium", "reste simple, tu n'as pas besoin d'une ring light en plus", "ne fais pas la vidéo verticale de trop"],
    challenges: ["sans cligner comme un poisson philosophique", "sans regarder la journée à travers une vitre imaginaire", "avec moins de bulles que d'eau", "sans parler comme si tu étais sous-titré par Neptune", "sans traiter ton reflet comme un live", "en gardant une tête qui ne fasse pas pure décoration numérique"],
    shares: ["et mon regard nage dans son bocal", "et l'aquarium mental est officiellement ouvert", "et ma face cam est très poisson cosmique", "et mon cerveau a lancé un filtre sans autorisation", "et je flotte en 9:16 dans le réel", "et mes pupilles font du contenu à ma place"],
  },
  "apres-soiree": {
    label: "Rocker d'after",
    icon: "🎸",
    description: "Fin de scène douteuse, néons cruels et retour mal rangé.",
    gradient: ["from-amber-600", "via-rose-500", "to-purple-400"],
    universe: ["le rappel de trop", "le néon du retour", "la guitare fantôme", "la fin de scène", "le trottoir intérieur", "la clope mentale"],
    badges: ["d'after", "de fin de scène", "très amplifié", "en rappel", "de retour foireux", "post-concert administratif"],
    causes: ["un retour qui n'a pas compris que le concert était fini", "un reste de nuit très amplifié", "une sortie de scène trop lente pour être honnête", "une gueule de rappel imposé au quartier", "un néon encore collé dans le regard", "une fin de soirée qui a décidé de vivre dans ton visage"],
    tips: ["évite le rappel bonus, vise la récupération digne", "laisse la scène se refermer avant de relancer quoi que ce soit", "reste dans le minimum viable jusqu'au retour du cerveau", "fais moins le rockeur et plus le mammifère hydraté", "aucune suite n'est nécessaire aujourd'hui", "si le décor tourne encore, reste assis"],
    challenges: ["sans refaire un solo devant le frigo", "sans traiter le couloir comme une scène annexe", "avec plus d'eau que de légende", "sans raconter l'after à un objet ménager", "sans avoir l'air d'un rappel que personne n'a demandé", "en gardant une dignité compatible avec midi"],
    shares: ["et le rappel est encore dans mes yeux", "et la fin de scène dure étrangement longtemps", "et mon retour a gardé la guitare", "et le néon m'a signé la rétine", "et ma tête a raté l'heure de fermeture", "et mon visage sort d'un concert qu'il a perdu"],
  },
  "avant-cafe": {
    label: "Canapé premium",
    icon: "☁️",
    description: "Velours mental, dignité en peignoir et lenteur de luxe.",
    gradient: ["from-amber-400", "via-orange-300", "to-rose-200"],
    universe: ["le coussin royal", "le velours mental", "le nuage premium", "la moquette diplomatique", "le canapé officiel", "la sieste de direction"],
    badges: ["premium", "homologué canapé", "très coussin", "en velours", "de luxe fatigué", "version peignoir cosmique"],
    causes: ["une envie de confort qui a gagné avant l'ouverture des yeux", "un velours intérieur beaucoup trop convaincant", "une noblesse de coussin impossible à ignorer", "une lenteur de palace collée au visage", "un partenariat suspect avec le moelleux", "une gravité gérée par un canapé très influent"],
    tips: ["eau, lenteur, lumière douce, puis seulement civilisation", "réduis le bruit autour de toi au strict minimum", "aucune décision n'est urgente avant le premier redémarrage humain", "reste assis tant que ton âme n'a pas signé le retour", "ne commence pas par parler, commence par te recharger", "fais moins de société et plus de coussin"],
    challenges: ["sans négocier avec un coussin imaginaire", "sans faire de la moquette un partenaire de vie", "avec une dignité compatible avec le velours", "sans avoir l'air d'un roi en panne de batterie", "sans tomber dans une sieste administrative", "en gardant une forme humaine malgré le moelleux"],
    shares: ["et le canapé a remporté l'appel d'offres", "et le velours a pris la direction", "et je suis en partenariat avec un coussin invisible", "et ma tête a signé pour le confort longue durée", "et le nuage premium a pris le contrôle", "et mon visage exige désormais un peignoir moral"],
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

function dePlace(place) {
  if (place.startsWith("le ")) return `du ${place.slice(3)}`;
  if (place.startsWith("les ")) return `des ${place.slice(4)}`;
  if (place.startsWith("la ")) return `de ${place}`;
  if (place.startsWith("l'")) return `de ${place}`;
  return `de ${place}`;
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
        tier.badgeSuffix.flatMap((suffix) => mode.badges.map((badgeWord) => `${prefix} ${badgeWord} ${suffix}`)),
      ),
    );

    roasts[modeKey][bucket] = uniq(
      tier.roastLead.flatMap((lead) =>
        tier.roastTwist.flatMap((twist) =>
          mode.universe.flatMap((place) => [
            `${lead}, ${twist}.`,
            `${lead}. On sent ${place} quelque part sur la photo.`,
            `${lead}, avec un petit parfum ${dePlace(place)}.`,
          ]),
        ),
      ),
    );

    causes[modeKey][bucket] = uniqBy(
      tier.causes.flatMap((cause, causeIndex) =>
        mode.causes.map((modeCause, modeIndex) =>
          makeTagged(
            `Ça sent ${cause}, plus ${modeCause}.`,
            [
              ...tier.causeTags[causeIndex % tier.causeTags.length],
              `mode-${modeKey}`,
              `bucket-${bucket}`,
              `decile-${Math.min(9, Math.floor(((causeIndex + modeIndex + 1) * 10) / 6))}`,
            ],
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
