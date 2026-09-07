"use client";

import { useEffect, useRef, useState } from "react";

export default function RouteThumbnail({ activityId }: { activityId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState("0 0 400 200");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        fetch(`/api/activities/${activityId}/gps`)
          .then((res) => (res.ok ? res.json() : { path: null }))
          .then((data: { path: string | null; viewBox?: string }) => {
            if (data.path) {
              setPath(data.path);
              if (data.viewBox) setViewBox(data.viewBox);
            }
          })
          .catch(() => setPath(null));
      },
      { rootMargin: "150px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [activityId]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden rounded-xl bg-black/20 transition-[height] duration-300 ${
        path ? "h-16" : "h-0"
      }`}
    >
      {path && (
        <svg viewBox={viewBox} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          <path
            d={path}
            fill="none"
            stroke="white"
            strokeOpacity={0.9}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
