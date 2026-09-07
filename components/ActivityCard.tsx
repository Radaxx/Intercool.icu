"use client";

import { motion } from "framer-motion";
import { Clock, Mountain, HeartPulse, Gauge, Share2 } from "lucide-react";
import { getSportMeta } from "@/lib/sports";
import {
  formatDistance,
  formatDuration,
  formatElevation,
  formatHeartRate,
  formatPace,
  relativeDay,
} from "@/lib/format";
import type { Activity } from "@/lib/types";
import StatPill from "./StatPill";
import RouteThumbnail from "./RouteThumbnail";

export default function ActivityCard({
  activity,
  onShare,
}: {
  activity: Activity;
  onShare: (activity: Activity) => void;
}) {
  const sport = getSportMeta(activity.type);
  const Icon = sport.icon;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={() => onShare(activity)}
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-base-800/60 text-left shadow-xl backdrop-blur transition-shadow hover:shadow-glow"
    >
      <div
        className={`flex items-center justify-between bg-gradient-to-r ${sport.gradient} px-4 py-3`}
      >
        <div className="flex items-center gap-2 text-white">
          <Icon className="h-5 w-5" />
          <span className="text-sm font-semibold">{sport.label}</span>
        </div>
        <Share2 className="h-4 w-4 text-white/70 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="truncate text-base font-semibold text-neutral-50">
            {activity.name || sport.label}
          </h3>
          <p className="text-xs capitalize text-neutral-500">
            {relativeDay(activity.start_date_local)}
          </p>
        </div>

        <RouteThumbnail activityId={activity.id} />

        <div className="grid grid-cols-2 gap-2">
          <StatPill icon={Clock} label="Durée" value={formatDuration(activity.moving_time)} />
          <StatPill
            icon={Gauge}
            label={/ride|bik|cycl/i.test(activity.type) ? "Vitesse" : "Allure"}
            value={
              activity.distance && activity.moving_time
                ? formatPace(activity.distance / activity.moving_time, activity.type)
                : formatDistance(activity.distance)
            }
          />
          <StatPill icon={Mountain} label="Dénivelé" value={formatElevation(activity.total_elevation_gain)} />
          <StatPill icon={HeartPulse} label="FC moy." value={formatHeartRate(activity.average_heartrate)} />
        </div>

        <div className="mt-auto flex items-baseline gap-1 pt-1">
          <span className="text-2xl font-bold tracking-tight text-neutral-50">
            {formatDistance(activity.distance)}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
