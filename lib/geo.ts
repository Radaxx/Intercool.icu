export type LatLng = [number, number];

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Projection équirectangulaire simple : suffisante pour dessiner un tracé
 * local (une sortie de sport), pas destinée à une carte du monde.
 */
function project(points: LatLng[]): { x: number; y: number }[] {
  const avgLat = points.reduce((s, p) => s + p[0], 0) / points.length;
  const cosLat = Math.cos(toRadians(avgLat)) || 1;
  return points.map(([lat, lng]) => ({ x: lng * cosLat, y: -lat }));
}

function fitToBox(
  points: { x: number; y: number }[],
  width: number,
  height: number,
  padding: number
): { x: number; y: number }[] {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  const availW = width - padding * 2;
  const availH = height - padding * 2;
  const scale = Math.min(availW / spanX, availH / spanY);

  const drawW = spanX * scale;
  const drawH = spanY * scale;
  const offsetX = padding + (availW - drawW) / 2;
  const offsetY = padding + (availH - drawH) / 2;

  return points.map((p) => ({
    x: offsetX + (p.x - minX) * scale,
    y: offsetY + (p.y - minY) * scale,
  }));
}

function downsample<T>(arr: T[], maxPoints: number): T[] {
  if (arr.length <= maxPoints) return arr;
  const stride = Math.ceil(arr.length / maxPoints);
  const out: T[] = [];
  for (let i = 0; i < arr.length; i += stride) out.push(arr[i]);
  if (out[out.length - 1] !== arr[arr.length - 1]) out.push(arr[arr.length - 1]);
  return out;
}

export interface RoutePath {
  /** Chemin SVG (`d`) du tracé complet. */
  path: string;
  /** Point de départ, dans le même repère que `path` (pour un marqueur). */
  start: { x: number; y: number };
  /** Point d'arrivée, dans le même repère que `path` (pour un marqueur). */
  end: { x: number; y: number };
}

/**
 * Construit un chemin SVG (`d`) à partir d'une liste de points GPS bruts,
 * mis à l'échelle dans une boîte width x height avec padding.
 * Retourne null si les données sont insuffisantes/invalides.
 */
export function routePathFromLatLng(
  latlngs: LatLng[],
  width: number,
  height: number,
  padding: number,
  maxPoints = 220
): RoutePath | null {
  const valid = latlngs.filter(
    ([lat, lng]) =>
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180 &&
      !(lat === 0 && lng === 0)
  );
  if (valid.length < 2) return null;

  const sampled = downsample(valid, maxPoints);
  const projected = project(sampled);
  const fitted = fitToBox(projected, width, height, padding);

  const path = fitted
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return { path, start: fitted[0], end: fitted[fitted.length - 1] };
}
