import { NextRequest, NextResponse } from "next/server";
import { getActivities } from "@/lib/intervals";

export async function GET(req: NextRequest) {
  const days = Number(req.nextUrl.searchParams.get("days") ?? 90);

  try {
    const activities = await getActivities(
      Number.isFinite(days) && days > 0 ? days : 90
    );
    return NextResponse.json(activities);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
