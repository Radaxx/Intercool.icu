"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Loader2, Square, RectangleVertical, X } from "lucide-react";
import type { Activity } from "@/lib/types";
import { getSportMeta } from "@/lib/sports";

type Format = "post" | "story";

export default function ShareModal({
  activity,
  onClose,
}: {
  activity: Activity;
  onClose: () => void;
}) {
  const [format, setFormat] = useState<Format>("post");
  const [downloading, setDownloading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const sport = getSportMeta(activity.type);

  const src = `/api/share/${activity.id}?format=${format}`;

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activity.name || "seance"}-${format}.png`.replace(/\s+/g, "-");
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="flex w-full max-w-md flex-col gap-4 rounded-3xl border border-white/10 bg-base-900 p-5 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-200">
              Partager cette séance
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            className={`relative mx-auto overflow-hidden rounded-2xl bg-gradient-to-br ${sport.gradient} ${
              format === "post" ? "aspect-square w-full" : "aspect-[9/16] w-56"
            }`}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-white/80" />
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={src}
              src={src}
              alt="Aperçu de l'image à partager"
              onLoad={() => setImageLoaded(true)}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setImageLoaded(false);
                setFormat("post");
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                format === "post"
                  ? "bg-white text-black"
                  : "bg-white/10 text-neutral-300 hover:bg-white/15"
              }`}
            >
              <Square className="h-4 w-4" /> Post (1:1)
            </button>
            <button
              onClick={() => {
                setImageLoaded(false);
                setFormat("story");
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                format === "story"
                  ? "bg-white text-black"
                  : "bg-white/10 text-neutral-300 hover:bg-white/15"
              }`}
            >
              <RectangleVertical className="h-4 w-4" /> Story (9:16)
            </button>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Télécharger l&apos;image
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
