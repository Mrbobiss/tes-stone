# T'as Dormi ?

Mini-app mobile-first en Next.js pour prendre un selfie et obtenir une analyse humoristique de fatigue apparente.

> Promesse, **"Prends un selfie, l'IA juge ta tête du matin et te donne ton plan de survie."**

## Ce que fait le MVP

- selfie via caméra mobile ou upload classique
- analyse vision via `/api/analyze`
- retour IA en JSON strict uniquement
- génération finale 100% locale via fichiers JSON dans `/content`
- modes de ton, badges, roasts, causes, conseils, défis, phrases de partage
- fallback automatique en **Mode estimation fun** si l'IA ne répond pas
- partage via Web Share API ou copie presse-papiers
- historique local des scores côté client, stocké uniquement dans le navigateur
- classement perso des pires scores, calculé uniquement depuis l’historique local déjà stocké
- streak quotidien simple calculé à partir des jours d’analyse locaux
- badges locaux à débloquer, reliés à l’historique, au streak et à l’usage des modes
- onboarding v5 plus marqué, plus viral, pensé comme une mini-app story mobile-first
- export PNG de la carte résultat type story 9:16
- partage natif du PNG quand le navigateur supporte le partage de fichiers
- export premium personnalisable avec fonds story, watermark de marque et templates plus marqués selon le mode
- base PWA légère, installable, avec manifest, service worker et icônes générées
- métadonnées Open Graph / Twitter avec image locale de marque
- pages `/privacy` et `/terms`
- aucune base de données

## Garde-fous produit

L'app est pensée comme une expérience de divertissement et de bien-être léger.

Elle **ne** doit jamais :

- faire un diagnostic médical
- déduire l'âge, le genre, l'origine, l'identité, la santé ou un état psychologique sérieux
- stocker la photo après analyse

L'analyse se limite à des signaux visuels simples : fatigue apparente, yeux, cernes, sourire, expression générale, qualité de la lumière.

## Stack

- Next.js App Router
- TypeScript strict-ish
- Tailwind CSS v4
- API Route backend
- JSON locaux dans `/content`
- `html-to-image` pour l’export PNG côté client
- `localStorage` pour l’historique, le classement perso, les badges et l’onboarding 100% navigateur
- service worker léger maison pour le shell offline
- déploiement prévu pour Vercel

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvre ensuite <http://localhost:3000>

## Configuration IA

Renseigne les variables suivantes dans `.env.local` :

```env
AI_PROVIDER=openai
AI_API_KEY=...
AI_MODEL=gpt-4.1-mini
```

Exemples de `AI_PROVIDER` :

- `openai`
- `openrouter`
- une URL OpenAI-compatible complète, par exemple `https://mon-provider/v1`

Le backend envoie le prompt vision puis valide la réponse avec Zod.
Si la réponse échoue ou si la config manque, l'app passe en fallback fun.

## Scripts utiles

```bash
npm run dev
npm run lint
npm run build
npm run start
node scripts/generate-content.mjs
```

## Architecture

```text
content/
  badges.json
  roasts.json
  causes.json
  tips.json
  challenges.json
  shareLines.json
  modes.json
scripts/
  generate-content.mjs
src/
  app/
    api/analyze/route.ts
    apple-icon.tsx
    icon.tsx
    manifest.ts
    opengraph-image.tsx
    twitter-image.tsx
    privacy/page.tsx
    terms/page.tsx
    page.tsx
  components/
    achievements-panel.tsx
    history-panel.tsx
    onboarding-sheet.tsx
    personal-ranking.tsx
    pwa-provider.tsx
    tas-dormi-app.tsx
    mode-picker.tsx
    result-card.tsx
  public/
    offline.html
    sw.js
  lib/
    ai/vision.ts
    analysis-schema.ts
    content.ts
    constants.ts
    fallback.ts
    local-achievements.ts
    local-onboarding.ts
    local-results.ts
    result-engine.ts
    types.ts
    utils.ts
```

### Flux d'analyse

1. le client capture ou upload une image
2. l'image est compressée côté client pour rester légère
3. `/api/analyze` reçoit l'image via `FormData`
4. `src/lib/ai/vision.ts` appelle le provider vision
5. la réponse JSON est validée avec `visionAnalysisSchema`
6. `generateResult()` transforme l'analyse en carte fun via les JSON locaux
7. si l'IA échoue, `buildFallbackAnalysis()` fabrique une estimation raisonnable entre 30 et 85
8. le résultat est ajouté à un historique local dans `localStorage`
9. le classement perso des pires scores et les badges sont recalculés côté client uniquement
10. un streak quotidien est recalculé à partir des dates locales d’analyse
11. la carte résultat peut être exportée en PNG via `html-to-image`
12. si le navigateur le permet, le bouton de partage envoie directement le PNG
13. la couche PWA/social est fournie par les metadata routes Next.js (`manifest.ts`, `icon.tsx`, `opengraph-image.tsx`)
14. `public/sw.js` garde un shell offline léger pour les pages déjà visitées

## Comment enrichir les phrases

### Option 1, éditer les JSON directement

Chaque fichier dans `/content` est organisé par mode puis par niveau de fatigue.

Exemple simplifié :

```json
{
  "normal": {
    "high": ["Zombie sociable", "Cernes certifiées conformes"]
  }
}
```

### Option 2, régénérer la base

Le fichier `scripts/generate-content.mjs` produit les JSON du MVP.
Tu peux enrichir ses templates puis relancer :

```bash
node scripts/generate-content.mjs
```

## PWA et partage social

- `src/app/manifest.ts` définit la base installable de l’app
- `src/app/icon.tsx` et `src/app/apple-icon.tsx` génèrent les icônes
- `src/app/opengraph-image.tsx` et `src/app/twitter-image.tsx` génèrent les visuels sociaux
- `src/components/pwa-provider.tsx` enregistre le service worker et gère le prompt d’installation
- `public/sw.js` et `public/offline.html` assurent un mode hors ligne léger
- le bouton **Exporter en image** télécharge une carte PNG prête pour story ou DM
- le bouton **Partager** essaie d’abord d’envoyer directement l’image PNG

## Déploiement Vercel

1. pousse le dossier sur GitHub
2. importe le repo dans Vercel
3. configure les variables d'environnement :
   - `AI_PROVIDER=openrouter`
   - `AI_API_KEY=...`
   - `AI_MODEL=google/gemini-2.5-flash`
4. build command : `npm run build`
5. output : automatique Next.js
6. garde le projet sur Node runtime, l’endpoint `/api/analyze` expose `maxDuration = 60` pour éviter un timeout trop court côté fonction

### Smoke test local validé

- page d’accueil servie en local après build
- endpoint `/api/analyze` testé en local avec la vraie config IA
- réponse JSON complète reçue sans fallback forcé

## Vérifications recommandées avant prod

- test iPhone / Android sur capture caméra
- test Web Share API
- test fallback sans clé IA
- test photo sombre
- test payload un peu lourd
- test des différents modes

## Prochaines améliorations

- vrai mode offline plus riche avec file d’attente ou sync de brouillons
- meilleure bibliothèque de phrases encore plus riche et éditorialisée
- analytics d'usage
- comptes utilisateurs sync multi-device si un jour on veut sortir du 100% local
- premium et packs de modes
- Stripe
- analytics et A/B tests
- version Expo / React Native
- vraie PWA offline

## Vers une future app Expo

Chemin recommandé :

1. isoler encore plus la logique pure dans `src/lib/`
2. partager `generateResult()` et les types vers un package commun
3. remplacer la capture web par `expo-image-picker` / `expo-camera`
4. garder le backend d'analyse identique au début
5. préparer un export image natif pour les stories

## Checklist future publication Google Play / App Store

- [ ] nom, icône et screenshots finalisés
- [ ] politique de confidentialité publique accessible
- [ ] CGU propres et versionnées
- [ ] suppression complète des traces photo confirmée
- [ ] écran de consentement clair avant upload
- [ ] page support / contact
- [ ] crash reporting
- [ ] analytics privacy-friendly
- [ ] export image de qualité
- [ ] QA multi-device
- [ ] revue des prompts et garde-fous conformité
- [ ] wording store qui insiste sur l'aspect divertissement

## Notes produit

- le texte final n'est **pas** généré librement par l'IA à chaque appel
- l'IA sert uniquement à renvoyer un JSON d'analyse visuelle simple
- tout le fun final vient des fichiers JSON locaux et de `generateResult()`
