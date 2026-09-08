/**
 * Détection best-effort du monde virtuel (Zwift...) à partir du nom/de la
 * description de l'activité. Il n'existe pas d'API publique pour ça —
 * certaines séances mentionnent le monde dans leur description (ex.
 * "Ocean Lava Cliffside Loop in Watopia"), d'autres non : dans ce cas on
 * retombe sur un libellé générique.
 */
const KNOWN_WORLDS = [
  "Watopia",
  "Makuri Islands",
  "France",
  "Yorkshire",
  "Innsbruck",
  "Richmond",
  "New York",
  "London",
  "Paris",
  "Scotland",
];

export function isVirtualType(type: string): boolean {
  return /^virtual/i.test(type);
}

export function detectVirtualWorld(
  name: string | null | undefined,
  description: string | null | undefined
): string | null {
  const text = `${name ?? ""} ${description ?? ""}`;
  for (const world of KNOWN_WORLDS) {
    if (new RegExp(`\\b${world}\\b`, "i").test(text)) return world;
  }
  return null;
}
