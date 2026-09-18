"use client";

import React, { useState, useRef, useEffect } from "react";
import { streamChatCompletion, StreamUpdate } from "@/lib/api";
import {
  Send,
  Zap,
  ShieldAlert,
  Gauge,
  Clock,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Terminal,
} from "lucide-react";

export function PlaygroundChat() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("auto-fastest");
  const [simulateRateLimit, setSimulateRateLimit] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Live HUD metrics
  const [ttftMs, setTtftMs] = useState<number | null>(null);
  const [tps, setTps] = useState<number | null>(null);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [activeProvider, setActiveProvider] = useState<string>("auto (Groq)");
  const [fallbackTriggered, setFallbackTriggered] = useState<boolean>(false);

  // Chat conversation
  const [messages, setMessages] = useState<
    Array<{
      role: "user" | "assistant";
      content: string;
      meta?: {
        ttft: number;
        tps: number;
        provider: string;
        fallback: boolean;
        totalTokens: number;
      };
    }>
  >([
    {
      role: "assistant",
      content:
        "Welcome to the PulseRoute edge tester. Try sending a prompt, or toggle 'Simulate 429 Rate Limit' to witness sub-350ms multi-provider failover in real-time.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || isStreaming) return;

    // Append user message
    const userMessage = { role: "user" as const, content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsStreaming(true);
    setTtftMs(null);
    setTps(null);
    setTotalTokens(0);
    setFallbackTriggered(false);

    // Placeholder assistant message
    const assistantIndex = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
      },
    ]);

    try {
      await streamChatCompletion(
        textToSend,
        model,
        simulateRateLimit,
        (update: StreamUpdate) => {
          setTtftMs(update.ttftMs);
          setTps(update.tokensPerSec);
          setTotalTokens(update.totalTokens);
          setActiveProvider(update.provider);
          setFallbackTriggered(update.fallbackOccurred);

          setMessages((prev) => {
            const next = [...prev];
            next[assistantIndex] = {
              role: "assistant",
              content: update.accumulatedText,
              meta: update.isComplete
                ? {
                    ttft: update.ttftMs,
                    tps: update.tokensPerSec,
                    provider: update.provider,
                    fallback: update.fallbackOccurred,
                    totalTokens: update.totalTokens,
                  }
                : undefined,
            };
            return next;
          });
        }
      );
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev];
        next[assistantIndex] = {
          role: "assistant",
          content: "Failed to connect to edge provider. Ensure backend is deployed or run locally.",
        };
        return next;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const quickPrompts = [
    "Explain edge LLM routing and why TTFT matters in 2 sentences.",
    "Write a resilient retry function in TypeScript with exponential backoff.",
    "Simulate a 429 rate limit spike and trigger failover.",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Chat Window */}
      <div className="lg:col-span-2 flex flex-col h-[650px] rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm overflow-hidden shadow-sm">
        {/* Chat Header Controls */}
        <div className="flex flex-wrap items-center justify-between border-b border-zinc-800/80 bg-zinc-950/60 px-4 py-3 gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white">Live Edge Stream</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Model Selector Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="hidden sm:inline">Model:</span>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={isStreaming}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 font-mono"
              >
                <option value="auto-fastest">⚡ Auto - Lowest Latency (PulseRoute)</option>
                <option value="groq-llama3">Groq Llama 3 (Ultra-Fast)</option>
                <option value="openrouter-free">OpenRouter Free / Llama 3.3</option>
                <option value="openai-gpt4o">OpenAI GPT-4o-mini (Resilient)</option>
              </select>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    role: "assistant",
                    content: "Conversation cleared. Ready for your prompt.",
                  },
                ]);
                setTtftMs(null);
                setTps(null);
              }}
              title="Reset conversation"
              className="rounded-md border border-zinc-800 bg-zinc-900 p-1 text-zinc-400 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-brand-600 text-white font-medium"
                    : "border border-zinc-800/90 bg-zinc-950/80 text-zinc-200 font-mono"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {isStreaming && idx === messages.length - 1 && (
                  <span className="inline-block h-3 w-1.5 ml-1 bg-emerald-400 animate-pulse" />
                )}

                {/* Per-Message Telemetry Metadata Tag */}
                {msg.meta && (
                  <div className="mt-3 pt-2.5 border-t border-zinc-800 flex flex-wrap items-center gap-3 text-[10px] text-zinc-400 font-mono">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Clock className="h-3 w-3" />
                      TTFT: {msg.meta.ttft}ms
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Gauge className="h-3 w-3" />
                      {msg.meta.tps} tok/s
                    </span>
                    <span className="text-zinc-400">
                      Provider: <strong className="text-zinc-300">{msg.meta.provider}</strong>
                    </span>
                    {msg.meta.fallback && (
                      <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-amber-400 border border-amber-500/20">
                        Failover
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt chips */}
        <div className="px-4 py-2 border-t border-zinc-800/40 bg-zinc-950/40 flex gap-2 overflow-x-auto text-[11px]">
          {quickPrompts.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              disabled={isStreaming}
              className="whitespace-nowrap rounded-md border border-zinc-800/80 bg-zinc-900/60 px-2.5 py-1 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Prompt Input Form */}
        <div className="border-t border-zinc-800/80 bg-zinc-950/80 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isStreaming}
              placeholder="Ask anything or test failover with a prompt..."
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
            />
            <button
              type="submit"
              disabled={isStreaming || !prompt.trim()}
              className="flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-zinc-950 transition-all hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 shadow-sm shadow-emerald-500/20"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Col: Live Telemetry HUD & Controls */}
      <div className="flex flex-col gap-4">
        {/* Failover Simulator Switch Card */}
        <div
          className={`rounded-xl border p-5 backdrop-blur-sm transition-all shadow-sm ${
            simulateRateLimit
              ? "border-amber-500/40 bg-amber-500/5 shadow-amber-500/10"
              : "border-zinc-800/80 bg-zinc-900/40"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`h-4 w-4 ${simulateRateLimit ? "text-amber-400 animate-pulse" : "text-zinc-400"}`}
                />
                <span className="text-xs font-semibold text-white">Simulate 429 Rate Limit</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Injects an artificial 429 Too Many Requests response into the primary provider to demonstrate sub-350ms instant edge failover.
              </p>
            </div>

            {/* Switch Toggle */}
            <label className="relative inline-flex items-center cursor-pointer ml-3">
              <input
                type="checkbox"
                checked={simulateRateLimit}
                onChange={(e) => setSimulateRateLimit(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="mt-3.5 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Simulation Status:</span>
            {simulateRateLimit ? (
              <span className="font-mono text-amber-400 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                Failover Mode Armed
              </span>
            ) : (
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Direct Routing Normal
              </span>
            )}
          </div>
        </div>

        {/* Real-time Stream Counters HUD */}
        <div className="flex-1 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Live Stream HUD</h3>
            </div>
            {isStreaming && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                STREAMING
              </span>
            )}
          </div>

          {/* TTFT Live Metric */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                Time to First Token (TTFT)
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">&lt; 150ms target</span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-white">
              {ttftMs !== null ? (
                <span className={ttftMs < 200 ? "text-emerald-400" : "text-amber-400"}>{ttftMs} ms</span>
              ) : (
                <span className="text-zinc-600 font-normal">-- ms</span>
              )}
            </div>
          </div>

          {/* Throughput Metric */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-cyan-400" />
                Generation Throughput
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">tokens / sec</span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-cyan-400">
              {tps !== null ? `${tps} tok/s` : <span className="text-zinc-600 font-normal">-- tok/s</span>}
            </div>
          </div>

          {/* Active Route Path */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 space-y-2">
            <div className="text-xs text-zinc-400">Selected Provider Route:</div>
            <div className="text-xs font-mono font-medium text-zinc-200 break-all bg-zinc-900/80 p-2 rounded border border-zinc-800">
              {activeProvider}
            </div>
            {fallbackTriggered && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-mono">
                <ShieldAlert className="h-3.5 w-3.5" />
                Failover triggered: Primary aborted, secondary stream established.
              </div>
            )}
          </div>

          {/* Router Specs Box */}
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-950/30 p-3 text-[11px] text-zinc-400 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span>Edge Gateway:</span>
              <span className="text-zinc-200">Cloudflare Workers</span>
            </div>
            <div className="flex justify-between">
              <span>Protocol:</span>
              <span className="text-zinc-200">Server-Sent Events</span>
            </div>
            <div className="flex justify-between">
              <span>Failover Threshold:</span>
              <span className="text-zinc-200">4000ms / 429 Status</span>
            </div>
            <div className="flex justify-between">
              <span>Telemetry Overhead:</span>
              <span className="text-emerald-400">0ms (Asynchronous)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
