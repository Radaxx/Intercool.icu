"use client";

import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import type { Activity } from "@/lib/types";
import { getSportMeta } from "@/lib/sports";
import ActivityCard from "./ActivityCard";
import SummaryBar from "./SummaryBar";
import ShareModal from "./ShareModal";

const RANGES = [
  { label: "7 jours", days: 7 },
  { label: "30 jours", days: 30 },
  { label: "90 jours", days: 90 },
];

export default function Dashboard({
  initialActivities,
}: {
  initialActivities: Activity[];
}) {
  const [activities, setActivities] = useState(initialActivities);
  const [rangeDays, setRangeDays] = useState(90);
  const [sportFilter, setSportFilter] = useState<string | "all">("all");
  const [selected, setSelected] = useState<Activity | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const sportTypes = useMemo(() => {
    const set = new Set(activities.map((a) => a.type));
    return Array.from(set);
  }, [activities]);

  const filtered = useMemo(() => {
    if (sportFilter === "all") return activities;
    return activities.filter((a) => a.type === sportFilter);
  }, [activities, sportFilter]);

  function refresh(days: number) {
    setRangeDays(days);
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/activities?days=${days}`);
        if (!res.ok) throw new Error("Échec de la récupération");
        const data = (await res.json()) as Activity[];
        setActivities(data);
      } catch {
        setError("Impossible de récupérer les séances depuis intervals.icu.");
      }
    });
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-50 sm:text-3xl">
          Mes séances
        </h1>
        <p className="text-sm text-neutral-500">
          Synchronisées depuis intervals.icu — clique sur une séance pour la
          partager.
        </p>
      </header>

      <SummaryBar activities={filtered} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSportFilter("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              sportFilter === "all"
                ? "bg-white text-black"
                : "bg-white/5 text-neutral-400 hover:bg-white/10"
            }`}
          >
            Tous
          </button>
          {sportTypes.map((type) => {
            const meta = getSportMeta(type);
            return (
              <button
                key={type}
                onClick={() => setSportFilter(type)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  sportFilter === type
                    ? "bg-white text-black"
                    : "bg-white/5 text-neutral-400 hover:bg-white/10"
                }`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => refresh(r.days)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                rangeDays === r.days
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "bg-white/5 text-neutral-400 hover:bg-white/10"
              }`}
            >
              {r.label}
            </button>
          ))}
          <button
            onClick={() => refresh(rangeDays)}
            aria-label="Rafraîchir"
            className="rounded-full bg-white/5 p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {filtered.length === 0 && !error ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-neutral-500">
          Aucune séance trouvée sur cette période.
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onShare={setSelected}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {selected && (
        <ShareModal activity={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
