import { NextRequest, NextResponse } from "next/server";
import { getActivityGps, getActivityDebugInfo } from "@/lib/intervals";
import { routePathFromLatLng } from "@/lib/geo";

const WIDTH = 400;
const HEIGHT = 200;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (req.nextUrl.searchParams.get("debug") === "1") {
    const info = await getActivityDebugInfo(id);
    return NextResponse.json(info);
  }

  try {
    const points = await getActivityGps(id);
    if (!points) {
      return NextResponse.json({ path: null });
    }
    const path = routePathFromLatLng(points, WIDTH, HEIGHT, 10);
    return NextResponse.json({
      path,
      viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    });
  } catch {
    return NextResponse.json({ path: null });
  }
}
