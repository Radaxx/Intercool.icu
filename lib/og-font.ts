/**
 * Récupère un fichier de police statique depuis Google Fonts pour l'utiliser
 * dans next/og (satori n'a pas accès aux polices système ni à @font-face).
 * Le sous-ensemble `text` limite le poids du fichier téléchargé.
 */
export async function loadGoogleFont(
  family: string,
  weight: 400 | 500 | 600 | 700 | 800,
  text: string
): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  )}:wght@${weight}&text=${encodeURIComponent(text)}`;

  const css = await fetch(url).then((r) => r.text());
  const match = css.match(
    /src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/
  );

  if (!match) {
    throw new Error(`Impossible de trouver la police ${family}/${weight}`);
  }

  const res = await fetch(match[1]);
  return res.arrayBuffer();
}
