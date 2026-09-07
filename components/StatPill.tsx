import type { LucideIcon } from "lucide-react";

export default function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-neutral-400" />
      <div className="leading-tight">
        <div className="text-sm font-semibold text-neutral-100">{value}</div>
        <div className="text-[11px] text-neutral-500">{label}</div>
      </div>
    </div>
  );
}
