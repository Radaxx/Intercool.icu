/** @jsxImportSource react */
import type { ReactElement } from "react";
import type { SportMeta } from "./sports";
import { routePathFromLatLng, type LatLng } from "./geo";

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
}

export interface TemplateFontSpec {
  family: string;
  weight: number;
}

export interface TemplateDef {
  id: string;
  label: string;
  fonts: TemplateFontSpec[];
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
};

export const DEFAULT_TEMPLATE_ID = "classic";
