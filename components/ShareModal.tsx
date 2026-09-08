"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Download,
  Loader2,
  Share2,
  Square,
  RectangleVertical,
  X,
} from "lucide-react";
import type { Activity } from "@/lib/types";
import { getSportMeta } from "@/lib/sports";

type Format = "post" | "story";

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 90;

const TEMPLATE_OPTIONS = [
  { id: "classic", label: "Classique" },
  { id: "editorial", label: "Éditorial" },
  { id: "poster", label: "Poster" },
];

export default function ShareModal({
  activity,
  onClose,
}: {
  activity: Activity;
  onClose: () => void;
}) {
  const [format, setFormat] = useState<Format>("post");
  const [template, setTemplate] = useState("classic");
  const [title, setTitle] = useState(activity.name || "");
  const [description, setDescription] = useState("");
  const [draft, setDraft] = useState({ title: activity.name || "", description: "" });
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const sport = getSportMeta(activity.type);

  // Détection de support du Web Share API avec fichiers (Safari iOS 15+,
  // Chrome Android...) : absent sur desktop, où il n'y a de toute façon pas
  // d'appli Instagram à proposer dans le menu de partage.
  useEffect(() => {
    try {
      const testFile = new File([], "test.png", { type: "image/png" });
      setCanShareFiles(
        typeof navigator !== "undefined" &&
          typeof navigator.canShare === "function" &&
          navigator.canShare({ files: [testFile] })
      );
    } catch {
      setCanShareFiles(false);
    }
  }, []);

  // On ne régénère l'image qu'une fois l'utilisateur arrêté de taper, pour
  // éviter un appel à l'API (et à intervals.icu) à chaque frappe.
  useEffect(() => {
    const t = setTimeout(() => {
      setTitle(draft.title);
      setDescription(draft.description);
      setImageLoaded(false);
    }, 500);
    return () => clearTimeout(t);
  }, [draft]);

  const params = new URLSearchParams({ format, template });
  if (title.trim()) params.set("title", title.trim());
  if (description.trim()) params.set("description", description.trim());
  const src = `/api/share/${activity.id}?${params.toString()}`;
  const fileName = `${title || activity.name || "seance"}-${format}.png`.replace(
    /\s+/g,
    "-"
  );

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    setSharing(true);
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: "image/png" });
      await navigator.share({
        files: [file],
        title: title || activity.name || sport.label,
        text: description || undefined,
      });
    } catch (e) {
      // AbortError : l'utilisateur a fermé le menu de partage, rien à faire.
      if (e instanceof Error && e.name !== "AbortError") {
        console.error(e);
      }
    } finally {
      setSharing(false);
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
          className="flex max-h-[90vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-3xl border border-white/10 bg-base-900 p-5 shadow-2xl"
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

          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-400">Titre</span>
              <input
                type="text"
                value={draft.title}
                maxLength={TITLE_MAX}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, title: e.target.value }))
                }
                placeholder={sport.label}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-indigo-400/60"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-400">
                Description{" "}
                <span className="text-neutral-600">
                  ({draft.description.length}/{DESCRIPTION_MAX})
                </span>
              </span>
              <textarea
                value={draft.description}
                maxLength={DESCRIPTION_MAX}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value }))
                }
                placeholder="Ajoute une légende..."
                rows={2}
                className="resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-indigo-400/60"
              />
            </label>
          </div>

          <div className="flex gap-2">
            {TEMPLATE_OPTIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setImageLoaded(false);
                  setTemplate(t.id);
                }}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  template === t.id
                    ? "bg-white text-black"
                    : "bg-white/10 text-neutral-300 hover:bg-white/15"
                }`}
              >
                {t.label}
              </button>
            ))}
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

          {canShareFiles ? (
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                disabled={sharing}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
              >
                {sharing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
                Partager
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-neutral-200 transition hover:bg-white/15 disabled:opacity-60"
                aria-label="Télécharger l'image"
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </button>
            </div>
          ) : (
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
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
