# T'es stone ?

Mini-app mobile-first en Next.js pour prendre un selfie et obtenir un score stone humoristique, une carte partageable et un historique local.

> Promesse, **"Prends un selfie, l'IA juge ton niveau de vibe planante."**

## Ce que fait le MVP

- selfie via caméra intégrée ou upload classique
- analyse vision via `/api/analyze`
- retour IA en JSON strict uniquement
- génération finale 100% locale via fichiers JSON dans `/content`
- refs de ton, badges, punchlines, causes, conseils, défis et phrases de partage
- fallback automatique en **Mode estimation planante** si l'IA ne répond pas
- partage via Web Share API ou copie presse-papiers
- historique local des scores côté client, stocké uniquement dans le navigateur
- classement perso des plus gros scores, calculé uniquement depuis l’historique local
- streak quotidien simple calculé à partir des jours d’analyse locaux
- badges locaux à débloquer, reliés à l’historique et à l’usage des refs
- export PNG de la carte résultat type story 9:16
- partage natif du PNG quand le navigateur supporte le partage de fichiers
- base PWA légère, installable, avec manifest, service worker et icônes générées
- pages `/privacy` et `/terms`
- aucune base de données

## Garde-fous produit

L'app est pensée comme une expérience de divertissement.

Elle **ne** doit jamais :

- faire un diagnostic médical
- détecter une substance réelle
- déduire l'âge, le genre, l'origine, l'identité ou l'état de santé
- stocker la photo après analyse

L'analyse se limite à des signaux visuels simples, par exemple l'ouverture des yeux, le focus du regard, la détente du visage, l'inclinaison de la tête ou la qualité de la lumière.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- API Route backend
- JSON locaux dans `/content`
- `html-to-image` pour l’export PNG côté client
- `localStorage` pour l’historique, le classement perso, les badges et l’onboarding
- service worker léger pour le shell offline
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
Si la réponse échoue ou si la config manque, l'app passe en fallback planant.

## Scripts utiles

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run content:generate
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
    tas-dormi-app.tsx  # composant principal de l'app T'es stone ?
    mode-picker.tsx
    result-card.tsx
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

## Flux d'analyse

1. le client capture ou upload une image
2. l'image est compressée côté client pour rester légère
3. `/api/analyze` reçoit l'image via `FormData`
4. `src/lib/ai/vision.ts` appelle le provider vision
5. la réponse JSON est validée avec `visionAnalysisSchema`
6. `generateResult()` transforme l'analyse en carte fun via les JSON locaux
7. si l'IA échoue, `buildFallbackAnalysis()` fabrique une estimation raisonnable
8. le résultat est ajouté à un historique local dans `localStorage`
9. le classement perso et les badges sont recalculés côté client uniquement
10. un streak quotidien est recalculé à partir des dates locales d’analyse
11. la carte résultat peut être exportée en PNG via `html-to-image`
12. si le navigateur le permet, le bouton de partage envoie directement le PNG

## Comment enrichir les phrases

Le fichier `scripts/generate-content.mjs` produit les JSON du MVP.
Tu peux enrichir ses templates puis relancer :

```bash
npm run content:generate
```

## Déploiement Vercel

1. pousse le dossier sur GitHub
2. importe le repo dans Vercel
3. configure les variables d'environnement :
   - `AI_PROVIDER=openrouter`
   - `AI_API_KEY=...`
   - `AI_MODEL=google/gemini-2.5-flash`
4. build command : `npm run build`
5. output : automatique Next.js

## Vérifications recommandées avant prod

- test iPhone / Android sur capture caméra
- test Web Share API
- test fallback sans clé IA
- test photo sombre
- test payload un peu lourd
- test des différentes refs

## Notes produit

- le texte final n'est **pas** généré librement par l'IA à chaque appel
- le modèle renvoie uniquement une lecture visuelle structurée
- la carte finale, les badges, les punchlines et les conseils viennent de la bibliothèque locale
- le projet doit rester dans un cadre **fun / entertainment only**
