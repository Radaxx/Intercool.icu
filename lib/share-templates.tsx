/** @jsxImportSource react */
import type { ReactElement } from "react";
import type { SportMeta } from "./sports";
import { routePathFromLatLng, type LatLng } from "./geo";
import { computeMapLayout, buildMercatorRoute } from "./mercator";
import { fetchTileDataUri, TILE_ATTRIBUTION } from "./tiles";

export type ShareFormat = "post" | "story";

export interface ShareDim {
  width: number;
  height: number;
  pad: number;
}

export interface ShareStat {
  label: string;
  value: string;
}

export interface ShareHero {
  value: string;
  unit: string;
  label: string;
}

export interface MapLayer {
  tiles: { left: number; top: number; size: number; dataUri: string }[];
  routePath: string | null;
  start: { x: number; y: number } | null;
  end: { x: number; y: number } | null;
  attribution: string;
  /** Nom du monde Zwift détecté (ex. "Watopia"), ou null si activité réelle / monde inconnu. */
  worldLabel: string | null;
}

export interface TemplateData {
  format: ShareFormat;
  dim: ShareDim;
  contentWidth: number;
  sport: SportMeta;
  title: string;
  description: string;
  dateLabel: string;
  hero: ShareHero;
  stats: ShareStat[];
  gpsPoints: LatLng[] | null;
  mapLayer?: MapLayer;
}

export interface TemplateFontSpec {
  family: string;
  weight: number;
}

export interface PrepareContext {
  gpsPoints: LatLng[] | null;
  isVirtual: boolean;
  virtualWorldLabel: string | null;
  contentWidth: number;
  dim: ShareDim;
  format: ShareFormat;
}

export interface TemplateDef {
  id: string;
  label: string;
  fonts: TemplateFontSpec[];
  /** Préparation asynchrone optionnelle (ex: aller chercher des tuiles de carte) avant le rendu. */
  prepare?: (ctx: PrepareContext) => Promise<{ mapLayer?: MapLayer }>;
  render: (data: TemplateData) => ReactElement;
}

// ---------------------------------------------------------------------------
// Template "classic" : le design d'origine (dégradé sport, panneau de tracé
// avec effet glow, cartes de stats en verre dépoli). Conservé tel quel.
// ---------------------------------------------------------------------------
function renderClassic(data: TemplateData): ReactElement {
  const {
    format,
    dim,
    contentWidth,
    sport,
    title,
    description,
    hero,
    stats,
    gpsPoints,
    dateLabel,
  } = data;
  const routePanelHeight = format === "story" ? 460 : 300;
  const routePanelPad = 24;
  const heroFontSize = format === "story" ? 170 : 130;
  const titleFontSize = format === "story" ? 64 : 56;
  const route = gpsPoints
    ? routePathFromLatLng(
        gpsPoints,
        contentWidth - routePanelPad * 2,
        routePanelHeight - routePanelPad * 2,
        6,
        260
      )
    : null;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: dim.pad,
        background: `linear-gradient(135deg, ${sport.gradientHex[0]} 0%, ${sport.gradientHex[1]} 55%, #0b0b14 100%)`,
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -180,
          right: -180,
          width: 480,
          height: 480,
          borderRadius: 9999,
          background: "rgba(255,255,255,0.10)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -220,
          left: -160,
          width: 520,
          height: 520,
          borderRadius: 9999,
          background: "rgba(0,0,0,0.18)",
          display: "flex",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "rgba(255,255,255,0.16)",
            borderRadius: 9999,
            padding: "14px 26px",
          }}
        >
          <span
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "white",
              letterSpacing: 1,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {sport.label}
          </span>
        </div>
        <span
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.85)",
            fontWeight: 600,
            display: "flex",
            textTransform: "capitalize",
          }}
        >
          {dateLabel}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          gap: format === "story" ? 28 : 20,
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontSize: titleFontSize,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.1,
            display: "flex",
            maxWidth: contentWidth,
          }}
        >
          {title}
        </span>

        {route && (
          <div
            style={{
              display: "flex",
              width: contentWidth,
              height: routePanelHeight,
              padding: routePanelPad,
              borderRadius: 32,
              background: "rgba(255,255,255,0.10)",
            }}
          >
            <svg
              width={contentWidth - routePanelPad * 2}
              height={routePanelHeight - routePanelPad * 2}
              viewBox={`0 0 ${contentWidth - routePanelPad * 2} ${
                routePanelHeight - routePanelPad * 2
              }`}
            >
              <path
                d={route.path}
                fill="none"
                stroke="white"
                strokeOpacity={0.35}
                strokeWidth={20}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={route.path}
                fill="none"
                stroke="white"
                strokeWidth={7}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx={route.start.x}
                cy={route.start.y}
                r={11}
                fill="white"
                stroke={sport.gradientHex[0]}
                strokeWidth={5}
              />
              <circle
                cx={route.end.x}
                cy={route.end.y}
                r={11}
                fill={sport.gradientHex[1]}
                stroke="white"
                strokeWidth={5}
              />
            </svg>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
          <span
            style={{
              fontSize: heroFontSize,
              fontWeight: 800,
              color: "white",
              lineHeight: 1,
              display: "flex",
              letterSpacing: -4,
            }}
          >
            {hero.value}
          </span>
          {hero.unit && (
            <span
              style={{
                fontSize: heroFontSize * 0.28,
                fontWeight: 700,
                color: "rgba(255,255,255,0.85)",
                display: "flex",
                paddingBottom: heroFontSize * 0.12,
              }}
            >
              {hero.unit}
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "rgba(255,255,255,0.75)",
            display: "flex",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {hero.label}
        </span>
      </div>

      {description && (
        <span
          style={{
            fontSize: format === "story" ? 30 : 26,
            fontWeight: 400,
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.3,
            display: "flex",
            maxWidth: contentWidth,
            zIndex: 1,
            marginBottom: format === "story" ? 24 : 16,
          }}
        >
          {description}
        </span>
      )}

      {stats.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 16,
            zIndex: 1,
            flexWrap: "wrap",
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                flexDirection: "column",
                background: "rgba(255,255,255,0.14)",
                borderRadius: 22,
                padding: "18px 26px",
                minWidth: 180,
              }}
            >
              <span
                style={{
                  fontSize: 34,
                  fontWeight: 700,
                  color: "white",
                  display: "flex",
                }}
              >
                {s.value}
              </span>
              <span
                style={{
                  fontSize: 20,
                  color: "rgba(255,255,255,0.7)",
                  display: "flex",
                  marginTop: 2,
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: format === "story" ? 48 : 32,
          zIndex: 1,
        }}
      >
        <span style={{ fontSize: 26, fontWeight: 700, color: "white", display: "flex" }}>
          intercool.icu
        </span>
        <span style={{ fontSize: 22, color: "rgba(255,255,255,0.6)", display: "flex" }}>
          via intervals.icu
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Template "editorial" : fond sombre uni, typographie serif, lignes fines,
// aucune carte/glassmorphisme. Look magazine, calme, premium.
// ---------------------------------------------------------------------------
function renderEditorial(data: TemplateData): ReactElement {
  const {
    format,
    dim,
    contentWidth,
    sport,
    title,
    description,
    hero,
    stats,
    gpsPoints,
    dateLabel,
  } = data;
  const heroFontSize = format === "story" ? 240 : 170;
  const titleFontSize = format === "story" ? 46 : 38;
  const routeHeight = format === "story" ? 200 : 140;
  const route = gpsPoints
    ? routePathFromLatLng(gpsPoints, contentWidth, routeHeight, 4, 260)
    : null;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: dim.pad,
        background: "#0b0b0c",
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 20,
          borderBottom: "1px solid rgba(255,255,255,0.16)",
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: sport.accent,
            letterSpacing: 4,
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          {sport.label}
        </span>
        <span
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: 1,
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          {dateLabel}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          gap: format === "story" ? 32 : 22,
        }}
      >
        <span
          style={{
            fontSize: titleFontSize,
            fontWeight: 400,
            color: "rgba(255,255,255,0.92)",
            lineHeight: 1.2,
            display: "flex",
            maxWidth: contentWidth,
            fontFamily: "Fraunces",
          }}
        >
          {title}
        </span>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
          <span
            style={{
              fontSize: heroFontSize,
              fontWeight: 600,
              color: "white",
              lineHeight: 1,
              display: "flex",
              letterSpacing: -3,
              fontFamily: "Fraunces",
            }}
          >
            {hero.value}
          </span>
          {hero.unit && (
            <span
              style={{
                fontSize: heroFontSize * 0.22,
                fontWeight: 400,
                color: "rgba(255,255,255,0.6)",
                display: "flex",
                paddingBottom: heroFontSize * 0.14,
                fontFamily: "Fraunces",
              }}
            >
              {hero.unit}
            </span>
          )}
        </div>

        {route && (
          <svg
            width={contentWidth}
            height={routeHeight}
            viewBox={`0 0 ${contentWidth} ${routeHeight}`}
            style={{ display: "flex" }}
          >
            <path
              d={route.path}
              fill="none"
              stroke={sport.accent}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx={route.start.x}
              cy={route.start.y}
              r={5}
              fill="#0b0b0c"
              stroke={sport.accent}
              strokeWidth={2.5}
            />
            <circle cx={route.end.x} cy={route.end.y} r={5} fill={sport.accent} />
          </svg>
        )}

        {description && (
          <span
            style={{
              fontSize: format === "story" ? 26 : 22,
              fontWeight: 400,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.4,
              display: "flex",
              maxWidth: contentWidth,
            }}
          >
            {description}
          </span>
        )}
      </div>

      {stats.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingTop: 20,
            paddingBottom: 20,
            borderTop: "1px solid rgba(255,255,255,0.16)",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "baseline",
                gap: 10,
                paddingLeft: i === 0 ? 0 : 24,
                marginLeft: i === 0 ? 0 : 24,
                borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.16)",
              }}
            >
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "white",
                  display: "flex",
                }}
              >
                {s.value}
              </span>
              <span
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  display: "flex",
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 16,
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "rgba(255,255,255,0.75)",
            letterSpacing: 2,
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          intercool.icu
        </span>
        <span
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.4)",
            display: "flex",
          }}
        >
          via intervals.icu
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Template "poster" : blocs de couleur plats à fort contraste, typographie
// géante façon affiche de concert / ticket de stade. Aucun dégradé, aucun
// arrondi doux : des angles nets.
// ---------------------------------------------------------------------------
function renderPoster(data: TemplateData): ReactElement {
  const {
    format,
    dim,
    contentWidth,
    sport,
    title,
    description,
    hero,
    stats,
    gpsPoints,
    dateLabel,
  } = data;
  const heroFontSize = format === "story" ? 260 : 190;
  const titleFontSize = format === "story" ? 46 : 38;
  const routeHeight = format === "story" ? 340 : 220;
  const route = gpsPoints
    ? routePathFromLatLng(gpsPoints, contentWidth, routeHeight, 4, 260)
    : null;
  const stubPad = format === "story" ? 40 : 32;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: sport.gradientHex[1],
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: dim.pad,
          gap: format === "story" ? 24 : 16,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 34,
              fontWeight: 400,
              color: "#0a0a0a",
              textTransform: "uppercase",
              letterSpacing: 1,
              display: "flex",
              fontFamily: "Archivo Black",
            }}
          >
            {sport.label}
          </span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "rgba(10,10,10,0.65)",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {dateLabel}
          </span>
        </div>

        <span
          style={{
            fontSize: titleFontSize,
            fontWeight: 700,
            color: "#0a0a0a",
            lineHeight: 1.05,
            display: "flex",
            maxWidth: contentWidth,
          }}
        >
          {title}
        </span>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <span
              style={{
                fontSize: heroFontSize,
                fontWeight: 400,
                color: "#0a0a0a",
                lineHeight: 0.85,
                display: "flex",
                letterSpacing: -6,
                fontFamily: "Archivo Black",
              }}
            >
              {hero.value}
            </span>
            {hero.unit && (
              <span
                style={{
                  fontSize: heroFontSize * 0.22,
                  fontWeight: 700,
                  color: "#0a0a0a",
                  display: "flex",
                  paddingBottom: heroFontSize * 0.06,
                  marginLeft: 12,
                }}
              >
                {hero.unit}
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "rgba(10,10,10,0.65)",
              textTransform: "uppercase",
              letterSpacing: 3,
              display: "flex",
              marginTop: 4,
            }}
          >
            {hero.label}
          </span>
        </div>

        {route && (
          <svg
            width={contentWidth}
            height={routeHeight}
            viewBox={`0 0 ${contentWidth} ${routeHeight}`}
            style={{ display: "flex" }}
          >
            <path
              d={route.path}
              fill="none"
              stroke="#0a0a0a"
              strokeWidth={14}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
          padding: stubPad,
          gap: format === "story" ? 20 : 14,
        }}
      >
        {description && (
          <span
            style={{
              fontSize: format === "story" ? 24 : 20,
              fontWeight: 500,
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.35,
              display: "flex",
              maxWidth: contentWidth,
            }}
          >
            {description}
          </span>
        )}

        {stats.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  paddingLeft: i === 0 ? 0 : 24,
                  borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: "white",
                    display: "flex",
                  }}
                >
                  {s.value}
                </span>
                <span
                  style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    display: "flex",
                    marginTop: 2,
                  }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "white",
              letterSpacing: 1,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            intercool.icu
          </span>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", display: "flex" }}>
            via intervals.icu
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Template "map" : fond de carte plein cadre (tuiles OpenStreetMap/CARTO
// pour les activités réelles, fond stylisé pour les activités virtuelles où
// aucune vraie tuile n'existe), tracé + marqueurs en surimpression, panneau
// de stats en bas sur un dégradé de lisibilité.
// ---------------------------------------------------------------------------
async function prepareMap(ctx: PrepareContext): Promise<{ mapLayer?: MapLayer }> {
  if (!ctx.gpsPoints) return {};

  // Les tuiles couvrent tout le canevas, mais on ne veut PAS que le tracé
  // s'étende derrière le texte : on réserve une marge sûre en haut (header +
  // titre) et en bas (description + stat hero + stats + footer), et on ne
  // choisit le zoom que pour faire tenir le tracé dans la zone restante.
  const topSafe = ctx.dim.pad + (ctx.format === "story" ? 260 : 190);
  const bottomSafe = ctx.dim.pad + (ctx.format === "story" ? 460 : 340);
  const fitHeight = ctx.dim.height - topSafe - bottomSafe;

  const layout = computeMapLayout(ctx.gpsPoints, {
    canvasWidth: ctx.dim.width,
    canvasHeight: ctx.dim.height,
    fitWidth: ctx.dim.width - ctx.dim.pad * 2,
    fitHeight,
    focusY: topSafe + fitHeight / 2,
  });
  if (!layout) return {};

  const routeInfo = buildMercatorRoute(ctx.gpsPoints, layout.project);

  let tiles: MapLayer["tiles"] = [];
  if (!ctx.isVirtual) {
    const fetched = await Promise.all(
      layout.tiles.map(async (t) => {
        const dataUri = await fetchTileDataUri(layout.zoom, t.tx, t.ty);
        return dataUri ? { left: t.left, top: t.top, size: layout.tileSize, dataUri } : null;
      })
    );
    tiles = fetched.filter((t): t is MapLayer["tiles"][number] => t !== null);
  }

  return {
    mapLayer: {
      tiles,
      routePath: routeInfo?.path ?? null,
      start: routeInfo?.start ?? null,
      end: routeInfo?.end ?? null,
      attribution: TILE_ATTRIBUTION,
      worldLabel: ctx.virtualWorldLabel,
    },
  };
}

function renderMap(data: TemplateData): ReactElement {
  const { format, dim, contentWidth, sport, title, description, hero, stats, dateLabel, mapLayer } =
    data;
  const heroFontSize = format === "story" ? 150 : 110;

  // Aucune donnée GPS du tout : repli simple façon "classique" sans carte.
  if (!mapLayer) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: dim.pad,
          background: `linear-gradient(135deg, ${sport.gradientHex[0]} 0%, ${sport.gradientHex[1]} 100%)`,
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "white",
              textTransform: "uppercase",
              letterSpacing: 1,
              display: "flex",
            }}
          >
            {sport.label}
          </span>
          <span style={{ fontSize: 24, color: "rgba(255,255,255,0.85)", display: "flex" }}>
            {dateLabel}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: format === "story" ? 48 : 40,
              fontWeight: 700,
              color: "white",
              display: "flex",
              maxWidth: contentWidth,
            }}
          >
            {title}
          </span>
          <span style={{ fontSize: heroFontSize, fontWeight: 800, color: "white", display: "flex" }}>
            {hero.value}
            {hero.unit ? ` ${hero.unit}` : ""}
          </span>
        </div>
        <span style={{ fontSize: 22, fontWeight: 700, color: "white", display: "flex" }}>
          intercool.icu
        </span>
      </div>
    );
  }

  const hasRealMap = mapLayer.tiles.length > 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        background: "#050507",
        fontFamily: "Inter",
      }}
    >
      {hasRealMap ? (
        mapLayer.tiles.map((t, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={t.dataUri}
            alt=""
            width={t.size}
            height={t.size}
            style={{ position: "absolute", left: t.left, top: t.top, display: "flex" }}
          />
        ))
      ) : (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: dim.width,
            height: dim.height,
            display: "flex",
            background: `radial-gradient(circle at 30% 20%, ${sport.gradientHex[0]}66 0%, transparent 55%), linear-gradient(160deg, #12121c 0%, #05050a 100%)`,
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: dim.width,
          height: Math.round(dim.height * 0.4),
          display: "flex",
          background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: dim.width,
          height: Math.round(dim.height * 0.45),
          display: "flex",
          background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
        }}
      />

      {mapLayer.routePath && (
        <svg
          width={dim.width}
          height={dim.height}
          viewBox={`0 0 ${dim.width} ${dim.height}`}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* Contour sombre : garde le tracé lisible quelle que soit la
              couleur du fond de carte en dessous (rues, eau, verdure...). */}
          <path
            d={mapLayer.routePath}
            fill="none"
            stroke="rgba(0,0,0,0.55)"
            strokeWidth={format === "story" ? 13 : 11}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={mapLayer.routePath}
            fill="none"
            stroke="white"
            strokeOpacity={0.95}
            strokeWidth={format === "story" ? 8 : 6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {mapLayer.start && (
            <circle
              cx={mapLayer.start.x}
              cy={mapLayer.start.y}
              r={10}
              fill="white"
              stroke={sport.gradientHex[0]}
              strokeWidth={5}
            />
          )}
          {mapLayer.end && (
            <circle
              cx={mapLayer.end.x}
              cy={mapLayer.end.y}
              r={10}
              fill={sport.gradientHex[1]}
              stroke="white"
              strokeWidth={5}
            />
          )}
        </svg>
      )}

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: dim.width,
          display: "flex",
          flexDirection: "column",
          padding: dim.pad,
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.16)",
              borderRadius: 9999,
              padding: "12px 22px",
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: 1,
                display: "flex",
              }}
            >
              {sport.label}
            </span>
          </div>
          <span style={{ fontSize: 22, color: "rgba(255,255,255,0.85)", fontWeight: 600, display: "flex" }}>
            {dateLabel}
          </span>
        </div>
        {!hasRealMap && (
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "rgba(255,255,255,0.65)",
              textTransform: "uppercase",
              letterSpacing: 2,
              display: "flex",
            }}
          >
            {mapLayer.worldLabel ? `Monde virtuel · ${mapLayer.worldLabel}` : "Monde virtuel"}
          </span>
        )}
        <span
          style={{
            fontSize: format === "story" ? 46 : 38,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.1,
            display: "flex",
            maxWidth: contentWidth,
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: dim.width,
          display: "flex",
          flexDirection: "column",
          padding: dim.pad,
          gap: 14,
        }}
      >
        {description && (
          <span
            style={{
              fontSize: format === "story" ? 26 : 22,
              color: "rgba(255,255,255,0.85)",
              display: "flex",
              maxWidth: contentWidth,
            }}
          >
            {description}
          </span>
        )}

        <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
          <span
            style={{
              fontSize: heroFontSize,
              fontWeight: 800,
              color: "white",
              lineHeight: 1,
              display: "flex",
              letterSpacing: -3,
            }}
          >
            {hero.value}
          </span>
          {hero.unit && (
            <span
              style={{
                fontSize: heroFontSize * 0.3,
                fontWeight: 700,
                color: "rgba(255,255,255,0.85)",
                display: "flex",
                paddingBottom: heroFontSize * 0.1,
              }}
            >
              {hero.unit}
            </span>
          )}
        </div>

        {stats.length > 0 && (
          <div style={{ display: "flex", flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "rgba(255,255,255,0.14)",
                  borderRadius: 18,
                  padding: "12px 20px",
                }}
              >
                <span style={{ fontSize: 26, fontWeight: 700, color: "white", display: "flex" }}>
                  {s.value}
                </span>
                <span style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", display: "flex" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 4,
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 700, color: "white", display: "flex" }}>
            intercool.icu
          </span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", display: "flex" }}>
            {hasRealMap ? mapLayer.attribution : "via intervals.icu"}
          </span>
        </div>
      </div>
    </div>
  );
}

export const TEMPLATES: Record<string, TemplateDef> = {
  classic: {
    id: "classic",
    label: "Classique",
    fonts: [
      { family: "Inter", weight: 400 },
      { family: "Inter", weight: 600 },
      { family: "Inter", weight: 700 },
      { family: "Inter", weight: 800 },
    ],
    render: renderClassic,
  },
  editorial: {
    id: "editorial",
    label: "Éditorial",
    fonts: [
      { family: "Inter", weight: 400 },
      { family: "Inter", weight: 500 },
      { family: "Inter", weight: 600 },
      { family: "Inter", weight: 700 },
      { family: "Fraunces", weight: 400 },
      { family: "Fraunces", weight: 600 },
    ],
    render: renderEditorial,
  },
  poster: {
    id: "poster",
    label: "Poster",
    fonts: [
      { family: "Inter", weight: 400 },
      { family: "Inter", weight: 500 },
      { family: "Inter", weight: 700 },
      { family: "Inter", weight: 800 },
      { family: "Archivo Black", weight: 400 },
    ],
    render: renderPoster,
  },
  map: {
    id: "map",
    label: "Carte",
    fonts: [
      { family: "Inter", weight: 400 },
      { family: "Inter", weight: 600 },
      { family: "Inter", weight: 700 },
      { family: "Inter", weight: 800 },
    ],
    prepare: prepareMap,
    render: renderMap,
  },
};

export const DEFAULT_TEMPLATE_ID = "classic";
