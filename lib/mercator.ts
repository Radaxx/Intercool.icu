import type { LatLng } from "./geo";

const TILE_SIZE = 256;

function lngToPixelX(lng: number, zoom: number): number {
  return ((lng + 180) / 360) * TILE_SIZE * 2 ** zoom;
}

function latToPixelY(lat: number, zoom: number): number {
  const rad = (lat * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
    TILE_SIZE *
    2 ** zoom
  );
}

export interface TilePlacement {
  tx: number;
  ty: number;
  left: number;
  top: number;
}

export interface MapLayout {
  zoom: number;
  tileSize: number;
  tiles: TilePlacement[];
  /** Projette un point lat/lng vers des coordonnées pixel dans le canevas (alignées sur les tuiles). */
  project: (point: LatLng) => { x: number; y: number };
}

export interface MercatorRoute {
  path: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
}

/**
 * Construit un chemin SVG pour le tracé dans le MÊME repère pixel que les
 * tuiles (contrairement à routePathFromLatLng, qui fait sa propre
 * projection/mise à l'échelle indépendante).
 */
export function buildMercatorRoute(
  points: LatLng[],
  project: MapLayout["project"],
  maxPoints = 260
): MercatorRoute | null {
  const valid = points.filter(
    ([lat, lng]) =>
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 85 &&
      Math.abs(lng) <= 180
  );
  if (valid.length < 2) return null;

  const stride = valid.length > maxPoints ? Math.ceil(valid.length / maxPoints) : 1;
  const sampled: LatLng[] = [];
  for (let i = 0; i < valid.length; i += stride) sampled.push(valid[i]);
  if (sampled[sampled.length - 1] !== valid[valid.length - 1]) {
    sampled.push(valid[valid.length - 1]);
  }

  const projected = sampled.map(project);
  const path = projected
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return { path, start: projected[0], end: projected[projected.length - 1] };
}

export interface MapFitOptions {
  /** Dimensions complètes du canevas final (les tuiles le couvrent en entier). */
  canvasWidth: number;
  canvasHeight: number;
  /**
   * Zone dans laquelle le tracé doit tenir, pour choisir le zoom — peut être
   * plus petite que le canevas afin de laisser une marge "sûre" pour le
   * texte (titre en haut, stats en bas) qui, elle, sera recouverte par la
   * carte mais pas par le tracé.
   */
  fitWidth: number;
  fitHeight: number;
  /** Centre de la zone fitBox en pixels canevas (par défaut : centre du canevas). */
  focusX?: number;
  focusY?: number;
  minZoom?: number;
  maxZoom?: number;
}

/**
 * Calcule le niveau de zoom et la fenêtre de tuiles nécessaires pour que le
 * tracé tienne dans la zone `fitWidth x fitHeight`, façon "fit bounds" des
 * libs de cartes slippy (Leaflet, Mapbox...), puis positionne les tuiles
 * pour couvrir tout le canevas `canvasWidth x canvasHeight` autour de ce
 * point focal.
 */
export function computeMapLayout(points: LatLng[], opts: MapFitOptions): MapLayout | null {
  const {
    canvasWidth,
    canvasHeight,
    fitWidth,
    fitHeight,
    focusX = canvasWidth / 2,
    focusY = canvasHeight / 2,
    minZoom = 3,
    maxZoom = 16,
  } = opts;

  const valid = points.filter(
    ([lat, lng]) =>
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 85 &&
      Math.abs(lng) <= 180
  );
  if (valid.length < 2) return null;

  const lats = valid.map((p) => p[0]);
  const lngs = valid.map((p) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const availW = Math.max(fitWidth, 40);
  const availH = Math.max(fitHeight, 40);

  let zoom = maxZoom;
  for (let z = maxZoom; z >= minZoom; z--) {
    const spanX = lngToPixelX(maxLng, z) - lngToPixelX(minLng, z);
    const spanY = latToPixelY(minLat, z) - latToPixelY(maxLat, z);
    if (spanX <= availW && spanY <= availH) {
      zoom = z;
      break;
    }
    zoom = z;
  }

  const topLeft = { x: lngToPixelX(minLng, zoom), y: latToPixelY(maxLat, zoom) };
  const bottomRight = { x: lngToPixelX(maxLng, zoom), y: latToPixelY(minLat, zoom) };
  const geoCenterX = (topLeft.x + bottomRight.x) / 2;
  const geoCenterY = (topLeft.y + bottomRight.y) / 2;

  // Le point géographique central du tracé doit tomber sur (focusX, focusY)
  // dans le canevas final.
  const originX = geoCenterX - focusX;
  const originY = geoCenterY - focusY;

  const worldTiles = 2 ** zoom;
  const txMin = Math.floor(originX / TILE_SIZE);
  const txMax = Math.floor((originX + canvasWidth) / TILE_SIZE);
  const tyMin = Math.floor(originY / TILE_SIZE);
  const tyMax = Math.floor((originY + canvasHeight) / TILE_SIZE);

  const tiles: TilePlacement[] = [];
  for (let ty = tyMin; ty <= tyMax; ty++) {
    if (ty < 0 || ty >= worldTiles) continue;
    for (let tx = txMin; tx <= txMax; tx++) {
      const wrapped = ((tx % worldTiles) + worldTiles) % worldTiles;
      tiles.push({
        tx: wrapped,
        ty,
        left: tx * TILE_SIZE - originX,
        top: ty * TILE_SIZE - originY,
      });
    }
  }

  return {
    zoom,
    tileSize: TILE_SIZE,
    tiles,
    project: ([lat, lng]) => ({
      x: lngToPixelX(lng, zoom) - originX,
      y: latToPixelY(lat, zoom) - originY,
    }),
  };
}
