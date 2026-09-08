# Intercool.icu

Affichage moderne de tes séances de sport, synchronisées depuis
[intervals.icu](https://intervals.icu), avec génération à la volée d'une image
au format Instagram (post carré ou story) pour chaque séance.

## Stack

- Next.js 15 (App Router) + TypeScript
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
- Cliquer sur une séance ouvre une modale de partage : titre et description
  éditables (régénèrent l'image après une courte pause de frappe), choix
  entre 3 styles visuels (voir plus bas), aperçu au format post 1:1 ou story
  9:16 généré par `app/api/share/[id]/route.tsx`, téléchargeable en PNG ou
  partageable directement via le menu système du téléphone (Web Share API —
  voir plus bas).
- Pour les séances avec GPS, le tracé s'affiche en discret sur la carte
  (chargé à la demande via `app/api/activities/[id]/gps`, dès qu'elle entre
  dans le viewport) et dans un panneau dédié (ligne blanche avec effet glow +
  marqueurs départ/arrivée) sur l'image de partage. Les séances sans GPS
  (home trainer sans position, natation en bassin, renfo...) n'affichent
  simplement rien à cet endroit. Certaines activités virtuelles (Zwift...)
  ont un vrai tracé (la position dans le monde du jeu) et l'affichent aussi ;
  d'autres apps de home trainer ne renseignent pas ce flux, d'où des
  différences d'une sortie virtuelle à l'autre — ce n'est pas un bug.

### Note sur le tracé GPS

Le flux `GET /api/v1/activity/{id}/streams?types=latlng` d'intervals.icu ne
renvoie pas des paires `[lat,lng]` imbriquées : le flux `latlng` porte deux
séries parallèles, `data` (latitude) et `data2` (longitude), zippées dans
`getActivityGps` (`lib/intervals.ts`). Le tracé est ensuite projeté
(équirectangulaire simple, pas de fond de carte) par `routePathFromLatLng`
(`lib/geo.ts`).

## Styles d'image de partage

Trois templates au choix (bouton `?template=` sur `/api/share/[id]`),
définis dans `lib/share-templates.tsx` :

- **Classique** — dégradé coloré selon le sport, panneau de tracé GPS avec
  effet glow, cartes de stats en verre dépoli.
- **Éditorial** — fond noir uni, typographie serif (Fraunces), lignes
  fines, look magazine calme et premium.
- **Poster** — blocs de couleur plats à fort contraste, typographie géante
  (Archivo Black), angles nets façon affiche/ticket de concert.

Chaque template déclare les polices Google Fonts dont il a besoin
(`TemplateDef.fonts`) ; `app/api/share/[id]/route.tsx` ne charge que celles
du template demandé. Le sous-ensemble de glyphes envoyé à Google Fonts
inclut systématiquement la variante majuscule du texte
(`withCaseVariants` dans `lib/og-font.ts`), car plusieurs libellés utilisent
`text-transform: uppercase` — sans ça, les lettres manquantes retombent sur
une police de secours et le rendu devient incohérent.

## Partage direct vers Instagram (Web Share API)

Sur mobile (Safari iOS 15+, Chrome Android), un bouton **Partager**
apparaît à côté du téléchargement : il ouvre le menu de partage natif du
téléphone via `navigator.share({ files: [...] })`, dans lequel Instagram
propose de poster l'image en story ou en feed. Aucune clé API, aucun compte
Meta developer requis. Sur desktop (pas d'appli Instagram), seul le bouton
de téléchargement s'affiche.

On a délibérément écarté l'intégration directe de l'API Graph
d'Instagram (Content Publishing) : elle demanderait de convertir le compte
en compte Business/Creator, de le lier à une Page Facebook, de créer une
app Meta developer et de faire valider par Meta la permission
`instagram_content_publish` (App Review, plusieurs semaines, politique de
confidentialité + CGU publiques requises) — disproportionné pour un outil
personnel à un seul utilisateur, sans garantie d'approbation.

## Confidentialité

L'application n'a pas d'authentification : quiconque connaît l'URL de
déploiement peut voir tes séances. Si tu veux la restreindre, active la
**Password Protection** de Vercel (Settings → Deployment Protection) ou
ajoute un middleware d'authentification.
