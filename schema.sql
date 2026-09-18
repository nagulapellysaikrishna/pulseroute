-- Database Schema for PulseRoute
-- Deploy this schema on a free tier of Neon.tech or Supabase:

CREATE TABLE routing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requested_model VARCHAR(64) NOT NULL,
    selected_provider VARCHAR(64) NOT NULL,
    fallback_triggered BOOLEAN DEFAULT FALSE,
    fallback_reason VARCHAR(128),
    http_status INT NOT NULL,
    time_to_first_token_ms INT,
    total_duration_ms INT NOT NULL,
    completion_tokens INT,
    prompt_tokens INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for high-speed p95/p99 analytical queries
CREATE INDEX idx_routing_provider_status ON routing_logs (selected_provider, http_status);
CREATE INDEX idx_routing_created_at ON routing_logs (created_at DESC);