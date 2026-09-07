import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getActivity, getActivityGps } from "@/lib/intervals";
import { getSportMeta } from "@/lib/sports";
import { routePathFromLatLng } from "@/lib/geo";
import {
  formatDuration,
  formatElevation,
  formatHeartRate,
  formatPace,
  formatDateLong,
  isCyclingType,
} from "@/lib/format";
import { loadGoogleFont } from "@/lib/og-font";

export const runtime = "edge";

type Format = "post" | "story";

const DIMENSIONS: Record<Format, { width: number; height: number; pad: number }> = {
  post: { width: 1080, height: 1080, pad: 72 },
  story: { width: 1080, height: 1920, pad: 96 },
};

function splitDistance(meters: number): { value: string; unit: string } {
  const km = meters / 1000;
  return { value: km.toFixed(km >= 10 ? 0 : 1), unit: "km" };
}

function heroStat(activity: Awaited<ReturnType<typeof getActivity>>) {
  if (activity.distance && activity.distance > 0) {
    const { value, unit } = splitDistance(activity.distance);
    return { value, unit, label: "Distance" };
  }
  return { value: formatDuration(activity.moving_time), unit: "", label: "Durée" };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const format = (req.nextUrl.searchParams.get("format") as Format) || "post";
  const dim = DIMENSIONS[format === "story" ? "story" : "post"];

  let activity;
  let gpsPoints: Awaited<ReturnType<typeof getActivityGps>> = null;
  try {
    [activity, gpsPoints] = await Promise.all([
      getActivity(id),
      getActivityGps(id),
    ]);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return new Response(message, { status: 502 });
  }

  const contentWidth = dim.width - dim.pad * 2;
  const routePanelHeight = format === "story" ? 460 : 300;
  const routePanelPad = 24;
  const route = gpsPoints
    ? routePathFromLatLng(
        gpsPoints,
        contentWidth - routePanelPad * 2,
        routePanelHeight - routePanelPad * 2,
        6,
        260
      )
    : null;

  const sport = getSportMeta(activity.type);
  const hero = heroStat(activity);
  const title = (activity.name || sport.label).slice(0, 42);
  const dateLabel = formatDateLong(activity.start_date_local);

  type Stat = { label: string; value: string };
  const stats: Stat[] = [];
  if (hero.label !== "Durée") {
    stats.push({ label: "Durée", value: formatDuration(activity.moving_time) });
  }
  if (activity.total_elevation_gain) {
    stats.push({ label: "D+", value: formatElevation(activity.total_elevation_gain) });
  }
  if (activity.average_heartrate) {
    stats.push({ label: "FC moy.", value: formatHeartRate(activity.average_heartrate) });
  }
  if (hero.label === "Distance" && activity.distance && activity.moving_time) {
    stats.push({
      label: isCyclingType(activity.type) ? "Vitesse" : "Allure",
      value: formatPace(activity.distance! / activity.moving_time!, activity.type),
    });
  }

  const visibleStats = stats.slice(0, 3);

  const allText = [
    sport.label,
    dateLabel,
    title,
    hero.value,
    hero.unit,
    hero.label,
    ...visibleStats.flatMap((s) => [s.label, s.value]),
    "intercool.icu",
    "via intervals.icu",
  ].join(" ");

  const [interBold, interSemibold, interRegular] = await Promise.all([
    loadGoogleFont("Inter", 800, allText),
    loadGoogleFont("Inter", 600, allText),
    loadGoogleFont("Inter", 400, allText),
  ]);

  const heroFontSize = format === "story" ? 170 : 130;
  const titleFontSize = format === "story" ? 64 : 56;

  return new ImageResponse(
    (
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
              maxWidth: dim.width - dim.pad * 2,
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

        {visibleStats.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 16,
              zIndex: 1,
              flexWrap: "wrap",
            }}
          >
            {visibleStats.map((s) => (
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
          <span
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "white",
              display: "flex",
            }}
          >
            intercool.icu
          </span>
          <span
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.6)",
              display: "flex",
            }}
          >
            via intervals.icu
          </span>
        </div>
      </div>
    ),
    {
      width: dim.width,
      height: dim.height,
      fonts: [
        { name: "Inter", data: interRegular, weight: 400, style: "normal" },
        { name: "Inter", data: interSemibold, weight: 600, style: "normal" },
        { name: "Inter", data: interBold, weight: 800, style: "normal" },
      ],
    }
  );
}
