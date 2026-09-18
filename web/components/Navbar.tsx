"use client";

import React from "react";
import { Activity, ShieldCheck, Github, ExternalLink, Zap, Terminal } from "lucide-react";

interface NavbarProps {
  activeTab: "telemetry" | "spend" | "playground";
  setActiveTab: (tab: "telemetry" | "spend" | "playground") => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("telemetry")}>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
                <Zap className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-white text-base">PulseRoute</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                  Edge v1.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">LLM Reverse Proxy & Telemetry Gateway</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-zinc-800">
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "telemetry"
                  ? "bg-zinc-800/90 text-white shadow-sm border border-zinc-700/60"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              Telemetry & Performance
            </button>

            <button
              onClick={() => setActiveTab("spend")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "spend"
                  ? "bg-zinc-800/90 text-white shadow-sm border border-zinc-700/60"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              Spend & Cost Tracker
            </button>

            <button
              onClick={() => setActiveTab("playground")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "playground"
                  ? "bg-zinc-800/90 text-white shadow-sm border border-zinc-700/60"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              <Terminal className="h-3.5 w-3.5 text-amber-400" />
              Playground / Router Tester
            </button>
          </nav>
        </div>

        {/* Right Status & Links */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-xs text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium tracking-wide">Edge Routing Active</span>
          </div>

          <a
            href="https://github.com/nagulapellysaikrishna/pulseroute"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="flex md:hidden border-t border-zinc-800/60 px-4 py-2 gap-2 overflow-x-auto bg-zinc-950">
        <button
          onClick={() => setActiveTab("telemetry")}
          className={`flex-1 whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ${
            activeTab === "telemetry" ? "bg-zinc-800 text-white" : "text-zinc-400"
          }`}
        >
          Telemetry
        </button>
        <button
          onClick={() => setActiveTab("spend")}
          className={`flex-1 whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ${
            activeTab === "spend" ? "bg-zinc-800 text-white" : "text-zinc-400"
          }`}
        >
          Spend & Logs
        </button>
        <button
          onClick={() => setActiveTab("playground")}
          className={`flex-1 whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ${
            activeTab === "playground" ? "bg-zinc-800 text-white" : "text-zinc-400"
          }`}
        >
          Playground
        </button>
      </div>
    </header>
  );
}
