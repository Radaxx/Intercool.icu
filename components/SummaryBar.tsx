"use client";

import { motion } from "framer-motion";
import type { Activity } from "@/lib/types";
import { formatDistance, formatDuration } from "@/lib/format";

export default function SummaryBar({ activities }: { activities: Activity[] }) {
  const totalDistance = activities.reduce((s, a) => s + (a.distance ?? 0), 0);
  const totalTime = activities.reduce((s, a) => s + (a.moving_time ?? 0), 0);
  const totalElevation = activities.reduce(
    (s, a) => s + (a.total_elevation_gain ?? 0),
    0
  );

  const items = [
    { label: "Séances", value: activities.length.toString() },
    { label: "Distance totale", value: formatDistance(totalDistance) },
    { label: "Temps total", value: formatDuration(totalTime) },
    { label: "D+ cumulé", value: `${Math.round(totalElevation)} m` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.06] to-transparent p-4"
        >
          <div className="text-2xl font-bold text-neutral-50">{item.value}</div>
          <div className="text-xs text-neutral-500">{item.label}</div>
        </div>
      ))}
    </motion.div>
  );
}
