import { NextRequest, NextResponse } from "next/server";
import { getActivityGps } from "@/lib/intervals";
import { routePathFromLatLng } from "@/lib/geo";

const WIDTH = 400;
const HEIGHT = 200;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const points = await getActivityGps(id);
    if (!points) {
      return NextResponse.json({ path: null });
    }
    const route = routePathFromLatLng(points, WIDTH, HEIGHT, 10);
    return NextResponse.json({
      path: route?.path ?? null,
      viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    });
  } catch {
    return NextResponse.json({ path: null });
  }
}
