import React from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    neutral?: boolean;
  };
  icon: React.ReactNode;
  accent?: "emerald" | "cyan" | "violet" | "amber";
  badge?: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  accent = "emerald",
  badge,
}: MetricCardProps) {
  const accentGlow = {
    emerald: "group-hover:border-emerald-500/40 group-hover:shadow-emerald-500/5",
    cyan: "group-hover:border-cyan-500/40 group-hover:shadow-cyan-500/5",
    violet: "group-hover:border-violet-500/40 group-hover:shadow-violet-500/5",
    amber: "group-hover:border-amber-500/40 group-hover:shadow-amber-500/5",
  }[accent];

  const iconBg = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  }[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition-all duration-300 shadow-sm",
        accentGlow
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400 tracking-wide uppercase">{title}</span>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border", iconBg)}>
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight text-white font-mono">{value}</div>
        {badge && <div>{badge}</div>}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs text-zinc-400">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center rounded-md px-1.5 py-0.5 font-medium font-mono text-[11px]",
                trend.neutral
                  ? "bg-zinc-800 text-zinc-300"
                  : trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              )}
            >
              {trend.value}
            </span>
          )}
          {subtitle && <span className="truncate text-zinc-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
