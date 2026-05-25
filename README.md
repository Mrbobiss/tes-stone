# Drive Manga Reader

Application web mobile-first type manga/webtoon, pensée comme une vraie bibliothèque native, alimentée en arrière-plan par un dossier Google Drive public.

## Fonctionnalités

- charge automatiquement toute la bibliothèque configurée pour le site
- la page d'accueil affiche directement tous les tomes comme une bibliothèque native
- les pages d'un tome se chargent seulement à l'ouverture du tome pour garder une sensation fluide
- chaque sous-dossier devient un tome
- récupération automatique des images JPG, PNG et WEBP
- tri naturel des pages (`001`, `01`, `020-021`, etc.)
- bibliothèque sombre avec couverture, nombre de pages, progression et favoris
- lecteur vertical optimisé smartphone, scroll fluide, lazy loading et préchargement de l'image suivante
- sauvegarde locale de la dernière page lue et du dernier tome ouvert
- bouton plein écran et raccourcis clavier
- déploiement simple sur Vercel

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- API Routes Next.js
- Google Drive API v3
- localStorage pour la progression et les favoris

## Démarrage rapide

```bash
npm install
cp .env.example .env.local
npm run dev
```

Puis ouvre <http://localhost:3000>

## Variable d'environnement

```env
GOOGLE_API_KEY=
DEFAULT_DRIVE_FOLDER_ID=1Cw6HaLqaswgHWeW5mmcuKzrNbXBd2wRs
```

## Obtenir une clé Google Drive API

1. Va sur <https://console.cloud.google.com/>
2. Crée ou sélectionne un projet
3. Active **Google Drive API**
4. Ouvre **APIs & Services > Credentials**
5. Crée une **API key**
6. Ajoute la clé dans `.env.local`

Le dossier Drive utilisé par l'application doit être partagé publiquement en lecture.

## Format attendu dans Google Drive

```text
Mon Manga/
  Tome 01/
    001.jpg
    002.jpg
  Tome 02/
    001.jpg
    002.jpg
```

Les sous-dossiers sont traités comme des tomes.

Par défaut, le projet est déjà configuré pour ouvrir automatiquement le dossier `1Cw6HaLqaswgHWeW5mmcuKzrNbXBd2wRs`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Structure

```text
app/
  api/library/route.ts
  read/[slug]/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  library-shell.tsx
  reader-shell.tsx
  volume-card.tsx
lib/
  google-drive.ts
  reader-storage.ts
  utils.ts
types/
  manga.ts
public/
  brand.svg
```

## Déploiement Vercel

1. pousse le projet sur GitHub
2. importe le repo dans Vercel
3. ajoute la variable `GOOGLE_API_KEY`
4. build command: `npm run build`
5. framework preset: Next.js

`vercel.json` est inclus pour garder une config minimale.

## UX lecteur

- lecture verticale immersive
- images en pleine largeur mobile
- progression en haut de l'écran
- reprise automatique à la dernière page lue
- double tap pour zoomer sur une page
- raccourcis clavier: `j` / `k`, flèches, `f`

## Notes

- les images sont servies par une route backend Next.js qui proxifie Google Drive, ce qui évite les images cassées dans le lecteur
- les appels Google Drive sont mis en cache côté serveur sur une courte durée
- si aucun sous-dossier n'existe, l'app peut aussi lire directement les images du dossier racine
