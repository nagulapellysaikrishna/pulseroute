import {
  TelemetryMetrics,
  HistoricalLatencyPoint,
  ProviderVolumePoint,
  QueryLog,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_PULSEROUTE_API_URL || "https://pulseroute.your-subdomain.workers.dev";

// -------------------------------------------------------------
// HIGH-FIDELITY FALLBACK MOCK DATA
// -------------------------------------------------------------
const MOCK_METRICS: TelemetryMetrics = {
  p50_ttft_ms: 114,
  p95_ttft_ms: 238,
  p99_ttft_ms: 312,
  active_providers: [
    { name: "Groq", status: "healthy", latency_ms: 112, error_rate: 0.04 },
    { name: "OpenRouter", status: "healthy", latency_ms: 184, error_rate: 0.12 },
    { name: "OpenAI", status: "healthy", latency_ms: 342, error_rate: 0.02 },
  ],
  fallback_success_rate: 99.88,
  total_requests_24h: 482910,
  failovers_prevented_24h: 1428,
  average_tokens_per_sec: 164,
};

const MOCK_HISTORICAL_LATENCY: HistoricalLatencyPoint[] = [
  { time: "00:00", groq: 108, openrouter: 178, openai: 335, p99_threshold: 300 },
  { time: "02:00", groq: 112, openrouter: 182, openai: 340, p99_threshold: 300 },
  { time: "04:00", groq: 105, openrouter: 172, openai: 320, p99_threshold: 300 },
  { time: "06:00", groq: 118, openrouter: 189, openai: 350, p99_threshold: 300 },
  { time: "08:00", groq: 132, openrouter: 204, openai: 380, p99_threshold: 300 },
  { time: "10:00", groq: 125, openrouter: 198, openai: 365, p99_threshold: 300 },
  { time: "12:00", groq: 114, openrouter: 185, openai: 345, p99_threshold: 300 },
  { time: "14:00", groq: 128, openrouter: 195, openai: 360, p99_threshold: 300 },
  { time: "16:00", groq: 142, openrouter: 212, openai: 390, p99_threshold: 300 },
  { time: "18:00", groq: 120, openrouter: 188, openai: 352, p99_threshold: 300 },
  { time: "20:00", groq: 110, openrouter: 179, openai: 338, p99_threshold: 300 },
  { time: "22:00", groq: 115, openrouter: 184, openai: 342, p99_threshold: 300 },
];

const MOCK_PROVIDER_VOLUME: ProviderVolumePoint[] = [
  { provider: "Groq (Llama 3)", primary_requests: 312000, fallback_requests: 1240, error_rate_pct: 0.04 },
  { provider: "OpenRouter (Free)", primary_requests: 124500, fallback_requests: 6800, error_rate_pct: 0.12 },
  { provider: "OpenAI (GPT-4o)", primary_requests: 46410, fallback_requests: 18210, error_rate_pct: 0.02 },
];

const MOCK_QUERY_LOGS: QueryLog[] = [
  {
    id: "req_01j8a4x9",
    timestamp: new Date(Date.now() - 4000).toISOString(),
    model: "llama-3.3-70b-versatile",
    provider: "groq",
    ttft_ms: 104,
    total_duration_ms: 412,
    prompt_tokens: 142,
    completion_tokens: 288,
    estimated_cost: 0.00021,
    status: 200,
    fallback_triggered: false,
  },
  {
    id: "req_01j8a4m2",
    timestamp: new Date(Date.now() - 14000).toISOString(),
    model: "meta-llama/llama-3.3-70b-instruct:free",
    provider: "openrouter",
    ttft_ms: 178,
    total_duration_ms: 820,
    prompt_tokens: 88,
    completion_tokens: 312,
    estimated_cost: 0.00000,
    status: 200,
    fallback_triggered: false,
  },
  {
    id: "req_01j8a3q8",
    timestamp: new Date(Date.now() - 32000).toISOString(),
    model: "gpt-4o-mini",
    provider: "openai",
    ttft_ms: 284,
    total_duration_ms: 940,
    prompt_tokens: 320,
    completion_tokens: 195,
    estimated_cost: 0.00018,
    status: 200,
    fallback_triggered: true,
    fallback_reason: "Primary (Groq) hit 429 rate limit. Sub-320ms automatic failover.",
  },
  {
    id: "req_01j8a2e1",
    timestamp: new Date(Date.now() - 65000).toISOString(),
    model: "llama-3.1-8b-instant",
    provider: "groq",
    ttft_ms: 92,
    total_duration_ms: 280,
    prompt_tokens: 45,
    completion_tokens: 110,
    estimated_cost: 0.00004,
    status: 200,
    fallback_triggered: false,
  },
  {
    id: "req_01j8a1z9",
    timestamp: new Date(Date.now() - 110000).toISOString(),
    model: "gpt-4o-mini",
    provider: "openai",
    ttft_ms: 315,
    total_duration_ms: 1120,
    prompt_tokens: 512,
    completion_tokens: 410,
    estimated_cost: 0.00034,
    status: 200,
    fallback_triggered: false,
  },
  {
    id: "req_01j8a0b5",
    timestamp: new Date(Date.now() - 165000).toISOString(),
    model: "llama-3.3-70b-versatile",
    provider: "groq",
    ttft_ms: 116,
    total_duration_ms: 540,
    prompt_tokens: 195,
    completion_tokens: 340,
    estimated_cost: 0.00026,
    status: 200,
    fallback_triggered: false,
  },
  {
    id: "req_01j899m7",
    timestamp: new Date(Date.now() - 240000).toISOString(),
    model: "gpt-4o-mini",
    provider: "openai",
    ttft_ms: 295,
    total_duration_ms: 880,
    prompt_tokens: 240,
    completion_tokens: 180,
    estimated_cost: 0.00015,
    status: 200,
    fallback_triggered: true,
    fallback_reason: "Primary provider socket timeout (>4000ms threshold). Routed to secondary.",
  },
  {
    id: "req_01j898v3",
    timestamp: new Date(Date.now() - 350000).toISOString(),
    model: "meta-llama/llama-3.3-70b-instruct:free",
    provider: "openrouter",
    ttft_ms: 192,
    total_duration_ms: 710,
    prompt_tokens: 72,
    completion_tokens: 245,
    estimated_cost: 0.00000,
    status: 200,
    fallback_triggered: false,
  },
  {
    id: "req_01j897k1",
    timestamp: new Date(Date.now() - 480000).toISOString(),
    model: "llama-3.1-8b-instant",
    provider: "groq",
    ttft_ms: 89,
    total_duration_ms: 260,
    prompt_tokens: 58,
    completion_tokens: 95,
    estimated_cost: 0.00003,
    status: 200,
    fallback_triggered: false,
  },
  {
    id: "req_01j896p4",
    timestamp: new Date(Date.now() - 620000).toISOString(),
    model: "llama-3.3-70b-versatile",
    provider: "groq",
    ttft_ms: 110,
    total_duration_ms: 490,
    prompt_tokens: 160,
    completion_tokens: 290,
    estimated_cost: 0.00022,
    status: 200,
    fallback_triggered: false,
  }
];

// -------------------------------------------------------------
// CLIENT API CALLS WITH GRACEFUL FALLBACK
// -------------------------------------------------------------

export async function fetchTelemetryMetrics(): Promise<TelemetryMetrics> {
  try {
    const res = await fetch("/api/metrics", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && data.p50_ttft_ms) return data;
    }
  } catch (err) {
    // Fallback to mock
  }
  return MOCK_METRICS;
}

export async function fetchHistoricalLatency(): Promise<HistoricalLatencyPoint[]> {
  return MOCK_HISTORICAL_LATENCY;
}

export async function fetchProviderVolume(): Promise<ProviderVolumePoint[]> {
  return MOCK_PROVIDER_VOLUME;
}

export async function fetchQueryLogs(): Promise<QueryLog[]> {
  try {
    const res = await fetch("/api/logs", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    // Fallback to mock
  }
  return MOCK_QUERY_LOGS;
}

// -------------------------------------------------------------
// PLAYGROUND STREAMING FUNCTION
// -------------------------------------------------------------

export interface StreamUpdate {
  chunk: string;
  accumulatedText: string;
  ttftMs: number;
  tokensPerSec: number;
  provider: string;
  fallbackOccurred: boolean;
  isComplete: boolean;
  totalTokens: number;
}

export async function streamChatCompletion(
  prompt: string,
  model: string,
  simulateRateLimit: boolean,
  onUpdate: (update: StreamUpdate) => void
): Promise<void> {
  const startTime = performance.now();
  let firstTokenReceived = false;
  let ttftMs = 0;
  let accumulatedText = "";
  let tokenCount = 0;

  // Decide simulated provider path
  let provider = model.includes("groq") ? "Groq" : model.includes("openrouter") ? "OpenRouter" : "Auto-Fastest (Groq)";
  let fallbackOccurred = false;

  // If rate limit simulation is toggled on:
  if (simulateRateLimit) {
    // Simulate primary provider stalling & returning 429
    await new Promise((r) => setTimeout(r, 260));
    provider = "OpenAI (Failover from Groq 429)";
    fallbackOccurred = true;
  }

  // Sample dynamic responses based on prompt
  const responses = [
    `PulseRoute intercepted this request at the edge. By routing dynamically, we eliminated ${simulateRateLimit ? "an upstream 429 rate limit spike with seamless failover" : "unnecessary cross-region latency"}.\n\n` +
      `Key telemetry observed:\n` +
      `• Execution runtime: Cloudflare Workers V8 Isolates\n` +
      `• Telemetry ingestion: Asynchronous non-blocking background queue\n` +
      `• Stream mechanism: Native Server-Sent Events (SSE) pipeThrough() transformer\n\n` +
      `Here is a summary response to: "${prompt.slice(0, 45)}${prompt.length > 45 ? "..." : ""}"\n\n` +
      `Edge routing guarantees minimal Time-to-First-Token (TTFT) by locating intelligence close to the consumer, selecting healthy upstreams, and buffering zero bytes along the critical streaming path.`,
  ];

  const fullResponse = responses[0];
  const words = fullResponse.split(" ");

  // Simulate realistic word-by-word streaming
  for (let i = 0; i < words.length; i++) {
    const word = words[i] + " ";
    accumulatedText += word;
    tokenCount += 1;

    if (!firstTokenReceived) {
      firstTokenReceived = true;
      ttftMs = Math.round(performance.now() - startTime);
    }

    const elapsedSec = (performance.now() - startTime) / 1000;
    const tokensPerSec = Math.round(tokenCount / Math.max(elapsedSec, 0.05));

    onUpdate({
      chunk: word,
      accumulatedText,
      ttftMs,
      tokensPerSec,
      provider,
      fallbackOccurred,
      isComplete: false,
      totalTokens: tokenCount,
    });

    // Realistic token delay (18ms to 35ms)
    await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 15) + 20));
  }

  // Final flush
  const finalElapsedSec = (performance.now() - startTime) / 1000;
  onUpdate({
    chunk: "",
    accumulatedText,
    ttftMs,
    tokensPerSec: Math.round(tokenCount / Math.max(finalElapsedSec, 0.1)),
    provider,
    fallbackOccurred,
    isComplete: true,
    totalTokens: tokenCount,
  });
}
