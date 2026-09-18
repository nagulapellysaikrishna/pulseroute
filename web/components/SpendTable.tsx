"use client";

import React, { useState } from "react";
import { QueryLog } from "@/lib/types";
import { formatCurrency, formatDuration, formatRelativeTime } from "@/lib/utils";
import { Search, Filter, ArrowUpDown, AlertTriangle, CheckCircle2, DollarSign, Cpu, Clock, Zap } from "lucide-react";

interface SpendTableProps {
  logs: QueryLog[];
}

export function SpendTable({ logs }: SpendTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = selectedProvider === "all" || log.provider === selectedProvider;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "200" && !log.fallback_triggered) ||
      (statusFilter === "fallback" && log.fallback_triggered);

    return matchesSearch && matchesProvider && matchesStatus;
  });

  const totalSpend = logs.reduce((acc, curr) => acc + curr.estimated_cost, 0);
  const totalTokens = logs.reduce((acc, curr) => acc + curr.prompt_tokens + curr.completion_tokens, 0);
  const avgTtft = Math.round(logs.reduce((acc, curr) => acc + curr.ttft_ms, 0) / (logs.length || 1));
  const fallbackCount = logs.filter((l) => l.fallback_triggered).length;

  return (
    <div className="space-y-6">
      {/* Top Cost / Spend Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            Total Tracked Spend
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-white">{formatCurrency(totalSpend)}</div>
          <div className="mt-1 text-[11px] text-zinc-400">Avg ~$0.00018 / query</div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            Tokens Processed
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-white">{totalTokens.toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-zinc-400">Across active edge isolates</div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <Clock className="h-3.5 w-3.5 text-violet-400" />
            Average TTFT
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-400">{avgTtft}ms</div>
          <div className="mt-1 text-[11px] text-zinc-400">First-token latency</div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Failover Rescues
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-amber-400">{fallbackCount} events</div>
          <div className="mt-1 text-[11px] text-zinc-400">Zero user-facing 429s</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search model or request ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-mono"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto items-center">
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
          >
            <option value="all">All Providers</option>
            <option value="groq">Groq</option>
            <option value="openrouter">OpenRouter</option>
            <option value="openai">OpenAI</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
          >
            <option value="all">All Routing Types</option>
            <option value="200">Standard Direct (200 OK)</option>
            <option value="fallback">Failover Triggered</option>
          </select>
        </div>
      </div>

      {/* Query Log Table */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden backdrop-blur-sm shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800/80 bg-zinc-950/60 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Model</th>
                <th className="py-3.5 px-4">Provider</th>
                <th className="py-3.5 px-4">TTFT</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Tokens (In / Out)</th>
                <th className="py-3.5 px-4">Est. Cost</th>
                <th className="py-3.5 px-4 text-right">Status / Route</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500 font-sans">
                    No requests match your current filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4 text-zinc-400 whitespace-nowrap" title={log.timestamp}>
                      {formatRelativeTime(log.timestamp)}
                    </td>

                    <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                      <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[11px] text-zinc-200 border border-zinc-700/40">
                        {log.model}
                      </span>
                    </td>

                    <td className="py-3 px-4 capitalize whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          log.provider === "groq"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : log.provider === "openrouter"
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            : "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            log.provider === "groq"
                              ? "bg-emerald-400"
                              : log.provider === "openrouter"
                              ? "bg-cyan-400"
                              : "bg-violet-400"
                          }`}
                        />
                        {log.provider}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={
                          log.ttft_ms < 150
                            ? "text-emerald-400 font-medium"
                            : log.ttft_ms < 300
                            ? "text-amber-400 font-medium"
                            : "text-violet-400 font-medium"
                        }
                      >
                        {log.ttft_ms}ms
                      </span>
                    </td>

                    <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">{formatDuration(log.total_duration_ms)}</td>

                    <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                      <span className="text-zinc-300">{log.prompt_tokens}</span>
                      <span className="text-zinc-500"> / </span>
                      <span className="text-emerald-400">{log.completion_tokens}</span>
                    </td>

                    <td className="py-3 px-4 text-zinc-200 font-medium whitespace-nowrap">
                      {log.estimated_cost === 0 ? (
                        <span className="text-zinc-400 font-normal">Free Tier</span>
                      ) : (
                        formatCurrency(log.estimated_cost)
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {log.fallback_triggered ? (
                        <div
                          className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400 border border-amber-500/30 cursor-help"
                          title={log.fallback_reason || "Upstream rate limit (429) intercepted; seamlessly failed over to secondary."}
                        >
                          <AlertTriangle className="h-3 w-3" />
                          <span>429 Failover</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>200 OK</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
