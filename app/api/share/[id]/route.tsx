import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getActivity, getActivityGps } from "@/lib/intervals";
import { getSportMeta } from "@/lib/sports";
import {
  formatDuration,
  formatElevation,
  formatHeartRate,
  formatPace,
  formatDateLong,
  isCyclingType,
} from "@/lib/format";
import { loadGoogleFont, withCaseVariants } from "@/lib/og-font";
import { TEMPLATES, DEFAULT_TEMPLATE_ID, type ShareFormat } from "@/lib/share-templates";

export const runtime = "edge";

const DIMENSIONS: Record<ShareFormat, { width: number; height: number; pad: number }> = {
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
  const format: ShareFormat =
    req.nextUrl.searchParams.get("format") === "story" ? "story" : "post";
  const dim = DIMENSIONS[format];

  const templateId = req.nextUrl.searchParams.get("template") ?? DEFAULT_TEMPLATE_ID;
  const template = TEMPLATES[templateId] ?? TEMPLATES[DEFAULT_TEMPLATE_ID];

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

  const sport = getSportMeta(activity.type);
  const hero = heroStat(activity);
  const titleParam = req.nextUrl.searchParams.get("title")?.trim();
  const descriptionParam = req.nextUrl.searchParams.get("description")?.trim();
  const title = (titleParam || activity.name || sport.label).slice(0, 60);
  const description = (descriptionParam || "").slice(0, 90);
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
    description,
    ...visibleStats.flatMap((s) => [s.label, s.value]),
    "intercool.icu",
    "via intervals.icu",
  ].join(" ");
  const subsetText = withCaseVariants(allText);

  const fonts = await Promise.all(
    template.fonts.map(async (f) => ({
      name: f.family,
      weight: f.weight as 400 | 500 | 600 | 700 | 800,
      style: "normal" as const,
      data: await loadGoogleFont(f.family, f.weight as 400 | 500 | 600 | 700 | 800, subsetText),
    }))
  );

  return new ImageResponse(
    template.render({
      format,
      dim,
      contentWidth,
      sport,
      title,
      description,
      dateLabel,
      hero,
      stats: visibleStats,
      gpsPoints,
    }),
    { width: dim.width, height: dim.height, fonts }
  );
}
