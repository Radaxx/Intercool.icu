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

function normalizeLatLngEntries(raw: unknown): RawLatLng[] {
  if (!Array.isArray(raw)) return [];
  const out: RawLatLng[] = [];
  for (const item of raw) {
    if (
      Array.isArray(item) &&
      item.length === 2 &&
      typeof item[0] === "number" &&
      typeof item[1] === "number"
    ) {
      out.push([item[0], item[1]]);
    } else if (item && typeof item === "object") {
      const lat = (item as Record<string, unknown>).lat;
      const lng =
        (item as Record<string, unknown>).lng ??
        (item as Record<string, unknown>).lon;
      if (typeof lat === "number" && typeof lng === "number") {
        out.push([lat, lng]);
      }
    }
  }
  return out;
}

/**
 * Récupère le tracé GPS (latitude/longitude) d'une activité via l'endpoint
 * streams d'intervals.icu. Les séances sans GPS (home trainer, natation en
 * bassin, renfo...) n'ont pas ce flux : on retourne alors null plutôt que de
 * faire échouer l'appelant.
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

    let rawStream: unknown = null;
    if (Array.isArray(data)) {
      const match = data.find(
        (s) =>
          s &&
          typeof s === "object" &&
          ["latlng", "lat_lng", "latLng", "position"].includes(
            (s as Record<string, unknown>).type as string
          )
      ) as Record<string, unknown> | undefined;
      rawStream = match?.data ?? null;
    } else if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      rawStream =
        obj.latlng ?? obj.lat_lng ?? obj.latLng ?? obj.position ?? null;
      if (
        rawStream &&
        typeof rawStream === "object" &&
        !Array.isArray(rawStream)
      ) {
        rawStream = (rawStream as Record<string, unknown>).data ?? null;
      }
    }

    const points = normalizeLatLngEntries(rawStream);
    return points.length >= 2 ? points : null;
  } catch {
    return null;
  }
}

/**
 * Diagnostic temporaire : renvoie la réponse brute d'intervals.icu pour
 * l'activité et pour l'endpoint streams, afin de comprendre pourquoi le
 * tracé GPS ne remonte pas (mauvais endpoint, format inattendu, etc.).
 */
export async function getActivityDebugInfo(id: string) {
  const result: Record<string, unknown> = {};

  try {
    const res = await fetch(`${BASE_URL}/activity/${id}`, {
      headers: { Authorization: authHeader() },
    });
    const text = await res.text();
    result.activity = {
      status: res.status,
      ok: res.ok,
      bodyPreview: text.slice(0, 3000),
    };
    try {
      result.activityKeys = Object.keys(JSON.parse(text));
    } catch {
      /* body non-JSON, ignoré */
    }
  } catch (e) {
    result.activityError = e instanceof Error ? e.message : String(e);
  }

  try {
    const res = await fetch(
      `${BASE_URL}/activity/${id}/streams?types=latlng`,
      { headers: { Authorization: authHeader() } }
    );
    const text = await res.text();
    result.streams = {
      status: res.status,
      ok: res.ok,
      bodyPreview: text.slice(0, 1500),
      bodyLength: text.length,
    };
  } catch (e) {
    result.streamsError = e instanceof Error ? e.message : String(e);
  }

  return result;
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
