# Intercool.icu

Affichage moderne de tes séances de sport, synchronisées depuis
[intervals.icu](https://intervals.icu), avec génération à la volée d'une image
au format Instagram (post carré ou story) pour chaque séance.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Framer Motion pour l'UI
- `next/og` (Satori) pour générer les images de partage côté edge

## Configuration

1. Récupère ta clé API sur intervals.icu : **Réglages → Developer Settings → API Key**.
2. Récupère ton identifiant athlète (visible dans l'URL de ton profil, ex. `i123456`).
3. Copie `.env.example` vers `.env.local` et renseigne les deux valeurs :

```bash
cp .env.example .env.local
```

```
INTERVALS_API_KEY=ta_cle_api
INTERVALS_ATHLETE_ID=i123456
```

## Développement local

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Déploiement sur Vercel

1. Importe ce repo dans Vercel.
2. Ajoute les variables d'environnement `INTERVALS_API_KEY` et
   `INTERVALS_ATHLETE_ID` dans les réglages du projet (Settings → Environment
   Variables).
3. Déploie — aucune configuration supplémentaire n'est nécessaire.

## Fonctionnement

- `app/page.tsx` récupère les séances des 90 derniers jours côté serveur.
- Le dashboard permet de filtrer par sport et par période, avec des cartes
  animées affichant distance, durée, dénivelé, FC moyenne, allure/vitesse.
- Cliquer sur une séance ouvre un aperçu de l'image de partage, générée par
  `app/api/share/[id]/route.tsx` (format post 1:1 ou story 9:16),
  téléchargeable en PNG.

## Confidentialité

L'application n'a pas d'authentification : quiconque connaît l'URL de
déploiement peut voir tes séances. Si tu veux la restreindre, active la
**Password Protection** de Vercel (Settings → Deployment Protection) ou
ajoute un middleware d'authentification.
