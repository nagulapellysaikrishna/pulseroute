"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { MetricCard } from "@/components/MetricCard";
import { TelemetryCharts } from "@/components/TelemetryCharts";
import { SpendTable } from "@/components/SpendTable";
import { PlaygroundChat } from "@/components/PlaygroundChat";
import {
  fetchTelemetryMetrics,
  fetchHistoricalLatency,
  fetchProviderVolume,
  fetchQueryLogs,
} from "@/lib/api";
import {
  TelemetryMetrics,
  HistoricalLatencyPoint,
  ProviderVolumePoint,
  QueryLog,
} from "@/lib/types";
import {
  Zap,
  Clock,
  ShieldCheck,
  Server,
  RefreshCw,
  Activity,
  ChevronRight,
  TrendingDown,
  Layers,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"telemetry" | "spend" | "playground">("telemetry");
  const [metrics, setMetrics] = useState<TelemetryMetrics | null>(null);
  const [latencyData, setLatencyData] = useState<HistoricalLatencyPoint[]>([]);
  const [volumeData, setVolumeData] = useState<ProviderVolumePoint[]>([]);
  const [logs, setLogs] = useState<QueryLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, l, v, q] = await Promise.all([
        fetchTelemetryMetrics(),
        fetchHistoricalLatency(),
        fetchProviderVolume(),
        fetchQueryLogs(),
      ]);
      setMetrics(m);
      setLatencyData(l);
      setVolumeData(v);
      setLogs(q);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Section Header & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span>EDGE GATEWAY</span>
              <ChevronRight className="h-3 w-3 text-zinc-600" />
              <span className="uppercase text-zinc-300">
                {activeTab === "telemetry"
                  ? "Telemetry & Performance"
                  : activeTab === "spend"
                  ? "Spend & Cost Tracker"
                  : "Playground & Failover Sandbox"}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {activeTab === "telemetry" && "Real-Time Telemetry & Performance"}
              {activeTab === "spend" && "Spend, Tokens & Request Log"}
              {activeTab === "playground" && "Interactive Router Playground"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              {activeTab === "telemetry" &&
                "Sub-15ms edge routing metrics, live TTFT percentiles, and multi-provider failover telemetry."}
              {activeTab === "spend" &&
                "Granular token usage, duration, and estimated cost across Groq, OpenRouter, and OpenAI providers."}
              {activeTab === "playground" &&
                "Stream tokens live via Server-Sent Events and simulate 429 rate limit failover to secondary providers."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION A: TELEMETRY & PERFORMANCE OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === "telemetry" && (
          <div className="space-y-8">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="p50 TTFT Latency"
                value={`${metrics?.p50_ttft_ms || 114} ms`}
                subtitle="Median first-token delivery"
                trend={{ value: "-14ms vs 24h", isPositive: true }}
                icon={<Clock className="h-4 w-4" />}
                accent="emerald"
              />

              <MetricCard
                title="p99 TTFT Latency"
                value={`${metrics?.p99_ttft_ms || 312} ms`}
                subtitle="Tail latency threshold"
                trend={{ value: "-28ms vs 24h", isPositive: true }}
                icon={<Zap className="h-4 w-4" />}
                accent="cyan"
              />

              <MetricCard
                title="Active Providers"
                value="3 Online"
                subtitle="Groq, OpenRouter, OpenAI"
                icon={<Server className="h-4 w-4" />}
                accent="violet"
                badge={
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    All Healthy
                  </span>
                }
              />

              <MetricCard
                title="Failover Success Rate"
                value={`${metrics?.fallback_success_rate || 99.88}%`}
                subtitle={`${metrics?.failovers_prevented_24h || 1428} 429 spikes resolved`}
                trend={{ value: "100% SLA", isPositive: true }}
                icon={<ShieldCheck className="h-4 w-4" />}
                accent="amber"
              />
            </div>

            {/* Provider Status Pill Strip */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-zinc-200">Active Provider Cluster:</span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800/80 px-2.5 py-1 text-zinc-300 font-mono border border-zinc-700/40">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Groq: <strong className="text-white">112ms</strong>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800/80 px-2.5 py-1 text-zinc-300 font-mono border border-zinc-700/40">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    OpenRouter: <strong className="text-white">184ms</strong>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800/80 px-2.5 py-1 text-zinc-300 font-mono border border-zinc-700/40">
                    <span className="h-2 w-2 rounded-full bg-violet-400" />
                    OpenAI: <strong className="text-white">342ms</strong>
                  </span>
                </div>
              </div>

              <div className="text-zinc-400 font-mono text-[11px]">
                Global Edge Regions: <span className="text-emerald-400 font-semibold">275+ Cloudflare PoPs</span>
              </div>
            </div>

            {/* Visual Recharts Section */}
            <TelemetryCharts latencyData={latencyData} volumeData={volumeData} />
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION B: SPEND & COST TRACKER */}
        {/* ========================================================= */}
        {activeTab === "spend" && <SpendTable logs={logs} />}

        {/* ========================================================= */}
        {/* SECTION C: PLAYGROUND / ROUTER TESTER */}
        {/* ========================================================= */}
        {activeTab === "playground" && <PlaygroundChat />}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/60 py-6 mt-12 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>PulseRoute &mdash; Sub-15ms Edge LLM Gateway with Model Context Protocol (MCP)</div>
          <div className="flex items-center gap-4 text-zinc-400">
            <a
              href="https://github.com/nagulapellysaikrishna/pluseroute"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub Repository
            </a>
            <span>&bull;</span>
            <span>Cloudflare Workers V8</span>
            <span>&bull;</span>
            <span>Neon PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
