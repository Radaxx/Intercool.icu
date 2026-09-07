import {
  Bike,
  Dumbbell,
  Footprints,
  Mountain,
  Activity as ActivityIcon,
  Waves,
  PersonStanding,
  type LucideIcon,
} from "lucide-react";

export interface SportMeta {
  label: string;
  icon: LucideIcon;
  /** classes tailwind pour un dégradé (utilisé dans l'UI) */
  gradient: string;
  /** couleurs hexa pour le dégradé (utilisées dans l'image OG, sans tailwind) */
  gradientHex: [string, string];
  accent: string;
}

const SPORTS: Record<string, SportMeta> = {
  Run: {
    label: "Course à pied",
    icon: Footprints,
    gradient: "from-orange-500 to-red-500",
    gradientHex: ["#fb923c", "#ef4444"],
    accent: "#fb923c",
  },
  VirtualRun: {
    label: "Course virtuelle",
    icon: Footprints,
    gradient: "from-orange-500 to-red-500",
    gradientHex: ["#fb923c", "#ef4444"],
    accent: "#fb923c",
  },
  Ride: {
    label: "Vélo",
    icon: Bike,
    gradient: "from-sky-500 to-blue-600",
    gradientHex: ["#38bdf8", "#2563eb"],
    accent: "#38bdf8",
  },
  VirtualRide: {
    label: "Vélo virtuel",
    icon: Bike,
    gradient: "from-sky-500 to-blue-600",
    gradientHex: ["#38bdf8", "#2563eb"],
    accent: "#38bdf8",
  },
  Swim: {
    label: "Natation",
    icon: Waves,
    gradient: "from-cyan-400 to-teal-500",
    gradientHex: ["#22d3ee", "#14b8a6"],
    accent: "#22d3ee",
  },
  WeightTraining: {
    label: "Renfo",
    icon: Dumbbell,
    gradient: "from-fuchsia-500 to-purple-600",
    gradientHex: ["#e879f9", "#9333ea"],
    accent: "#e879f9",
  },
  Workout: {
    label: "Entraînement",
    icon: Dumbbell,
    gradient: "from-fuchsia-500 to-purple-600",
    gradientHex: ["#e879f9", "#9333ea"],
    accent: "#e879f9",
  },
  Hike: {
    label: "Randonnée",
    icon: Mountain,
    gradient: "from-emerald-500 to-green-600",
    gradientHex: ["#34d399", "#16a34a"],
    accent: "#34d399",
  },
  Walk: {
    label: "Marche",
    icon: PersonStanding,
    gradient: "from-lime-500 to-green-500",
    gradientHex: ["#a3e635", "#22c55e"],
    accent: "#a3e635",
  },
  Rowing: {
    label: "Aviron",
    icon: Waves,
    gradient: "from-indigo-500 to-blue-500",
    gradientHex: ["#6366f1", "#3b82f6"],
    accent: "#6366f1",
  },
};

const DEFAULT_SPORT: SportMeta = {
  label: "Séance",
  icon: ActivityIcon,
  gradient: "from-indigo-500 to-violet-600",
  gradientHex: ["#6366f1", "#7c3aed"],
  accent: "#818cf8",
};

export function getSportMeta(type: string | undefined | null): SportMeta {
  if (!type) return DEFAULT_SPORT;
  return SPORTS[type] ?? DEFAULT_SPORT;
}

export function knownSportTypes(): string[] {
  return Object.keys(SPORTS);
}
