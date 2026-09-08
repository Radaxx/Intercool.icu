/**
 * Tuiles de fond de carte : serveur de tuiles officiel OpenStreetMap
 * (licence des données : ODbL), gratuit et sans clé API.
 *
 * On a d'abord utilisé le style sombre gratuit de CARTO, plus adapté
 * visuellement à une image de partage sombre, mais CARTO exige désormais une
 * clé API même sur son offre gratuite — on utilise donc le rendu OSM
 * standard (clair, avec libellés), et on compense par des dégradés de
 * lisibilité plus marqués + un tracé avec contour sombre dans le template.
 *
 * Attribution requise (affichée sur l'image) : © OpenStreetMap contributors
 *
 * Usage raisonnable uniquement (User-Agent explicite, pas de requêtes en
 * boucle) : le serveur tile.openstreetmap.org n'est pas prévu pour un usage
 * important — voir https://operations.osmfoundation.org/policies/tiles/.
 * Pour un usage à plus grand volume qu'un outil personnel, passer par un
 * fournisseur de tuiles dédié (Mapbox, MapTiler, Stadia Maps, ou CARTO avec
 * une clé API).
 */
const TILE_URL = (z: number, x: number, y: number) =>
  `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

const USER_AGENT = "intercool.icu (personal training dashboard)";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function fetchTileDataUri(
  zoom: number,
  x: number,
  y: number
): Promise<string | null> {
  try {
    const res = await fetch(TILE_URL(zoom, x, y), {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) return null;
    // Un fournisseur peut répondre 200 avec une image d'erreur ("clé API
    // requise", quota dépassé...) au lieu d'un vrai statut d'échec : on
    // vérifie le type de contenu pour éviter d'afficher ce genre de tuile.
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return null;
    const buf = await res.arrayBuffer();
    return `data:image/png;base64,${arrayBufferToBase64(buf)}`;
  } catch {
    return null;
  }
}

export const TILE_ATTRIBUTION = "© OpenStreetMap contributors";
