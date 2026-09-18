export interface TelemetryMetrics {
  p50_ttft_ms: number;
  p95_ttft_ms: number;
  p99_ttft_ms: number;
  active_providers: Array<{
    name: string;
    status: "healthy" | "degraded" | "throttled";
    latency_ms: number;
    error_rate: number;
  }>;
  fallback_success_rate: number;
  total_requests_24h: number;
  failovers_prevented_24h: number;
  average_tokens_per_sec: number;
}

export interface HistoricalLatencyPoint {
  time: string;
  groq: number;
  openai: number;
  openrouter: number;
  p99_threshold: number;
}

export interface ProviderVolumePoint {
  provider: string;
  primary_requests: number;
  fallback_requests: number;
  error_rate_pct: number;
}

export interface QueryLog {
  id: string;
  timestamp: string;
  model: string;
  provider: "groq" | "openai" | "openrouter";
  ttft_ms: number;
  total_duration_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  estimated_cost: number;
  status: 200 | 429 | 500;
  fallback_triggered: boolean;
  fallback_reason?: string;
}

export interface RouteOption {
  id: string;
  name: string;
  description: string;
  tier: "fastest" | "balanced" | "cheapest";
  defaultProvider: string;
}
