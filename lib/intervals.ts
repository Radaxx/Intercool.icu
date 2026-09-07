import type { Activity } from "./types";

const BASE_URL = "https://intervals.icu/api/v1";

function authHeader(): string {
  const key = process.env.INTERVALS_API_KEY;
  if (!key) {
    throw new Error(
      "INTERVALS_API_KEY manquant. Ajoute-le dans .env.local ou dans les variables d'environnement Vercel."
    );
  }
  return "Basic " + btoa(`API_KEY:${key}`);
}

function athleteId(): string {
  const id = process.env.INTERVALS_ATHLETE_ID;
  if (!id) {
    throw new Error(
      "INTERVALS_ATHLETE_ID manquant. Ajoute-le dans .env.local ou dans les variables d'environnement Vercel."
    );
  }
  return id;
}

export async function getActivities(days = 90, limit = 60): Promise<Activity[]> {
  const newest = new Date();
  const oldest = new Date(Date.now() - days * 86400000);
  const params = new URLSearchParams({
    oldest: oldest.toISOString().slice(0, 10),
    newest: newest.toISOString().slice(0, 10),
  });

  const res = await fetch(
    `${BASE_URL}/athlete/${athleteId()}/activities?${params.toString()}`,
    {
      headers: { Authorization: authHeader() },
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`intervals.icu a renvoyé ${res.status} : ${body}`);
  }

  const data = (await res.json()) as Activity[];
  return data
    .sort(
      (a, b) =>
        new Date(b.start_date_local).getTime() -
        new Date(a.start_date_local).getTime()
    )
    .slice(0, limit);
}

type RawLatLng = [number, number];

/**
 * Récupère le tracé GPS (latitude/longitude) d'une activité via l'endpoint
 * streams d'intervals.icu. Le flux "latlng" y stocke deux séries parallèles :
 * `data` = latitude, `data2` = longitude (pas des paires imbriquées).
 * Les séances sans GPS (home trainer, natation en bassin, renfo...) n'ont
 * pas ce flux : on retourne alors null plutôt que de faire échouer l'appelant.
 */
export async function getActivityGps(id: string): Promise<RawLatLng[] | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/activity/${id}/streams?types=latlng`,
      {
        headers: { Authorization: authHeader() },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return null;

    const data: unknown = await res.json();
    if (!Array.isArray(data)) return null;

    const stream = data.find(
      (s) => s && typeof s === "object" && (s as Record<string, unknown>).type === "latlng"
    ) as Record<string, unknown> | undefined;

    const lats = stream?.data;
    const lngs = stream?.data2;
    if (!Array.isArray(lats) || !Array.isArray(lngs)) return null;

    const points: RawLatLng[] = [];
    const len = Math.min(lats.length, lngs.length);
    for (let i = 0; i < len; i++) {
      const lat = lats[i];
      const lng = lngs[i];
      if (typeof lat === "number" && typeof lng === "number") {
        points.push([lat, lng]);
      }
    }
    return points.length >= 2 ? points : null;
  } catch {
    return null;
  }
}

export async function getActivity(id: string): Promise<Activity> {
  const res = await fetch(`${BASE_URL}/activity/${id}`, {
    headers: { Authorization: authHeader() },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`intervals.icu a renvoyé ${res.status} : ${body}`);
  }

  return (await res.json()) as Activity;
}
