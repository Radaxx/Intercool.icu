export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "–";
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}`;
  return `${m} min`;
}

export function formatDistance(meters: number | null | undefined): string {
  if (!meters || meters <= 0) return "–";
  const km = meters / 1000;
  return `${km.toFixed(km >= 10 ? 0 : 1)} km`;
}

export function formatElevation(meters: number | null | undefined): string {
  if (!meters || meters <= 0) return "–";
  return `${Math.round(meters)} m`;
}

export function formatHeartRate(bpm: number | null | undefined): string {
  if (!bpm) return "–";
  return `${Math.round(bpm)} bpm`;
}

export function formatPower(watts: number | null | undefined): string {
  if (!watts) return "–";
  return `${Math.round(watts)} W`;
}

/** Allure en min/km, utile pour la course à pied. */
export function formatPace(
  metersPerSecond: number | null | undefined,
  type: string
): string {
  if (!metersPerSecond || metersPerSecond <= 0) return "–";
  if (isCyclingType(type)) {
    const kmh = metersPerSecond * 3.6;
    return `${kmh.toFixed(1)} km/h`;
  }
  const secPerKm = 1000 / metersPerSecond;
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${s.toString().padStart(2, "0")} /km`;
}

export function isCyclingType(type: string): boolean {
  return /ride|bik|cycl|velomobile/i.test(type);
}

/**
 * Activités "virtuelles" (Zwift, home trainer connecté...) : certaines
 * remontent quand même un flux latlng, mais c'est la position dans le monde
 * du jeu, pas un vrai itinéraire GPS — on ne veut jamais l'afficher.
 */
export function isVirtualType(type: string): boolean {
  return /^virtual/i.test(type);
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(d);
}

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function isYesterday(iso: string): boolean {
  const d = new Date(iso);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.toDateString() === y.toDateString();
}

export function relativeDay(iso: string): string {
  if (isToday(iso)) return "Aujourd'hui";
  if (isYesterday(iso)) return "Hier";
  return formatDateLong(iso);
}
