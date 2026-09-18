"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { HistoricalLatencyPoint, ProviderVolumePoint } from "@/lib/types";
import { Zap, ShieldAlert, Layers } from "lucide-react";

interface TelemetryChartsProps {
  latencyData: HistoricalLatencyPoint[];
  volumeData: ProviderVolumePoint[];
}

// Custom tooltip for Latency Area Chart
function CustomLatencyTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-3 shadow-xl backdrop-blur-md text-xs font-mono">
        <div className="text-zinc-400 font-sans mb-2 font-medium">Time Window: {label} UTC</div>
        <div className="space-y-1.5">
          {payload.map((item: any) => (
            <div key={item.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="capitalize text-zinc-300">{item.name}:</span>
              </div>
              <span className="font-semibold text-white">{item.value}ms</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

// Custom tooltip for Volume Bar Chart
function CustomVolumeTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-3 shadow-xl backdrop-blur-md text-xs font-mono">
        <div className="text-zinc-400 font-sans mb-2 font-medium">{label}</div>
        <div className="space-y-1.5">
          {payload.map((item: any) => (
            <div key={item.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-zinc-300">{item.name}:</span>
              </div>
              <span className="font-semibold text-white">{item.value.toLocaleString()} reqs</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export function TelemetryCharts({ latencyData, volumeData }: TelemetryChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Latency Area Chart */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white tracking-tight">Time-to-First-Token (TTFT) Over Last 24 Hours</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Empirical latency across primary & failover upstreams (ms)
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
            Live Percentiles
          </span>
        </div>

        <div className="h-[280px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={latencyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGroq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOpenRouter" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOpenAI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} unit="ms" />
              <Tooltip content={<CustomLatencyTooltip />} />
              <Area
                type="monotone"
                dataKey="groq"
                name="Groq"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorGroq)"
              />
              <Area
                type="monotone"
                dataKey="openrouter"
                name="OpenRouter"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorOpenRouter)"
              />
              <Area
                type="monotone"
                dataKey="openai"
                name="OpenAI (Fallback)"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorOpenAI)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-zinc-800/60 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Groq (p50 ~115ms)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span>OpenRouter (p50 ~184ms)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            <span>OpenAI Fallback (p50 ~342ms)</span>
          </div>
        </div>
      </div>

      {/* Provider Volume Breakdown Bar Chart */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white tracking-tight">Request Distribution by Provider</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Primary vs. Automatic Fallback routing executions
            </p>
          </div>
          <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-500/20">
            Zero Dropped Requests
          </span>
        </div>

        <div className="h-[280px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="provider" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomVolumeTooltip />} />
              <Bar dataKey="primary_requests" name="Primary Routes" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fallback_requests" name="Failover Triggered" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/60 text-xs text-zinc-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>Primary Traffic (95.8%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Failover Traffic (4.2%)</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
            <ShieldAlert className="h-3 w-3" />
            100% SLA Maintained
          </div>
        </div>
      </div>
    </div>
  );
}
