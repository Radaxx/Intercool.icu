/**
 * Tuiles de fond de carte, basées sur les données OpenStreetMap (licence
 * ODbL). On utilise le style sombre de CARTO plutôt que le rendu OSM par
 * défaut : visuellement adapté à une image de partage sombre, et sans les
 * libellés (rues, villes) qui entreraient en concurrence avec nos propres
 * stats à l'écran.
 *
 * Attribution requise (affichée sur l'image) : © OpenStreetMap contributors © CARTO
 *
 * Pour un usage à plus grand volume qu'un outil personnel, remplacer par un
 * fournisseur de tuiles payant (Mapbox, MapTiler, Stadia Maps...) : les
 * tuiles CARTO gratuites ne sont pas prévues pour un produit public à fort
 * trafic.
 */
const TILE_URL = (z: number, x: number, y: number) =>
  `https://basemaps.cartocdn.com/dark_nolabels/${z}/${x}/${y}.png`;

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
    const buf = await res.arrayBuffer();
    return `data:image/png;base64,${arrayBufferToBase64(buf)}`;
  } catch {
    return null;
  }
}

export const TILE_ATTRIBUTION = "© OpenStreetMap contributors © CARTO";
