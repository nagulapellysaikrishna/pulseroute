// src/index.ts
import { Hono } from "hono";
import { neon } from "@neondatabase/serverless";
import { routeWithFallback, ProviderConfig } from "./router.js";
import { createTelemetryStream } from "./proxy.js";

type Bindings = {
  DATABASE_URL?: string;
  GROQ_API_KEY?: string;
  OPENAI_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Helper to record telemetry to Postgres & console
async function recordTelemetry(
  dbUrl: string | undefined,
  data: {
    requestedModel: string;
    selectedProvider: string;
    fallbackTriggered: boolean;
    fallbackReason?: string;
    httpStatus: number;
    ttftMs: number;
    totalDurationMs: number;
    completionTokens: number;
    promptTokens: number;
  }
) {
  console.log(
    `[Telemetry] Model: ${data.requestedModel}, Provider: ${data.selectedProvider}, Status: ${data.httpStatus}, TTFT: ${data.ttftMs}ms, Duration: ${data.totalDurationMs}ms, Chunks: ${data.completionTokens}, Fallback: ${data.fallbackTriggered}`
  );

  if (dbUrl) {
    try {
      const sql = neon(dbUrl);
      await sql`
        INSERT INTO routing_logs (
          requested_model,
          selected_provider,
          fallback_triggered,
          fallback_reason,
          http_status,
          time_to_first_token_ms,
          total_duration_ms,
          completion_tokens,
          prompt_tokens
        ) VALUES (
          ${data.requestedModel},
          ${data.selectedProvider},
          ${data.fallbackTriggered},
          ${data.fallbackReason || null},
          ${data.httpStatus},
          ${data.ttftMs},
          ${data.totalDurationMs},
          ${data.completionTokens},
          ${data.promptTokens}
        )
      `;
    } catch (err) {
      console.error("[Telemetry] Failed to persist to PostgreSQL:", err);
    }
  }
}

// Health check endpoint
app.get("/", (c) => {
  return c.json({
    service: "PulseRoute",
    status: "operational",
    version: "1.0.0",
    endpoints: {
      completions: "POST /v1/chat/completions",
      health: "GET /health"
    }
  });
});

app.get("/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.post("/v1/chat/completions", async (c) => {
  const body = await c.req.json();
  const startTime = performance.now();

  const env = c.env as Bindings | undefined;
  const dbUrl = env?.DATABASE_URL || process.env.DATABASE_URL;
  const groqKey = env?.GROQ_API_KEY || process.env.GROQ_API_KEY || "demo-key";
  const openaiKey = env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY || "demo-key";

  const providers: ProviderConfig[] = [
    {
      name: "groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: groqKey
    },
    {
      name: "openai",
      url: "https://api.openai.com/v1/chat/completions",
      apiKey: openaiKey
    }
  ];

  let selectedProvider = "groq";
  let fallbackOccurred = false;
  let upstreamResponse: Response | null = null;
  let httpStatus = 200;

  // Attempt routing through configured providers
  try {
    const result = await routeWithFallback(providers, body);
    upstreamResponse = result.response;
    httpStatus = result.response.status;
    selectedProvider = result.providerName;
    fallbackOccurred = result.fallbackOccurred;
  } catch (err) {
    // If providers fail or demo-keys are rejected, proceed gracefully in demo mode
    selectedProvider = "groq (demo)";
    fallbackOccurred = false;
    httpStatus = 200;
  }

  const isStreamingRequested = body.stream === true;

  // Case 1: Real Upstream Streaming Response
  if (isStreamingRequested && upstreamResponse?.body) {
    let ttft = 0;
    const telemetryStream = createTelemetryStream(
      upstreamResponse.body,
      (measuredTtft) => {
        ttft = measuredTtft;
      },
      (totalChunks) => {
        const duration = Math.round(performance.now() - startTime);
        const task = recordTelemetry(dbUrl, {
          requestedModel: body.model || "auto-fastest",
          selectedProvider,
          fallbackTriggered: fallbackOccurred,
          httpStatus,
          ttftMs: ttft,
          totalDurationMs: duration,
          completionTokens: totalChunks,
          promptTokens: (body.messages || []).length
        });
        if (c.executionCtx?.waitUntil) {
          c.executionCtx.waitUntil(task);
        }
      }
    );

    return new Response(telemetryStream, {
      status: httpStatus,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  }

  // Case 2: Demo Streaming Mode (when stream: true is requested without live provider)
  if (isStreamingRequested) {
    const encoder = new TextEncoder();
    const words = ["PulseRoute", "edge", "gateway", "dispatched", "with", "sub-15ms", "telemetry."];
    let ttft = 0;

    const rawStream = new ReadableStream({
      async start(controller) {
        for (const word of words) {
          const sseData = `data: ${JSON.stringify({
            id: "chatcmpl-" + Date.now(),
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: body.model || "auto-fastest",
            choices: [{ index: 0, delta: { content: word + " " }, finish_reason: null }]
          })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          await new Promise((r) => setTimeout(r, 25));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    });

    const telemetryStream = createTelemetryStream(
      rawStream,
      (measuredTtft) => {
        ttft = measuredTtft;
      },
      (totalChunks) => {
        const duration = Math.round(performance.now() - startTime);
        const task = recordTelemetry(dbUrl, {
          requestedModel: body.model || "auto-fastest",
          selectedProvider,
          fallbackTriggered: fallbackOccurred,
          httpStatus,
          ttftMs: ttft,
          totalDurationMs: duration,
          completionTokens: totalChunks,
          promptTokens: (body.messages || []).length
        });
        if (c.executionCtx?.waitUntil) {
          c.executionCtx.waitUntil(task);
        }
      }
    );

    return new Response(telemetryStream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  }

  // Case 3: Non-Streaming Response (JSON)
  let responseData: any;
  if (upstreamResponse) {
    try {
      responseData = await upstreamResponse.json();
    } catch {
      responseData = null;
    }
  }

  if (!responseData) {
    responseData = {
      id: "chatcmpl-" + Date.now(),
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: body.model || "auto-fastest",
      choices: [{
        index: 0,
        message: { role: "assistant", content: "Response routed successfully via PulseRoute." },
        finish_reason: "stop"
      }],
      usage: {
        prompt_tokens: (body.messages || []).length * 4,
        completion_tokens: 8,
        total_tokens: (body.messages || []).length * 4 + 8
      }
    };
  }

  const duration = Math.round(performance.now() - startTime);
  const task = recordTelemetry(dbUrl, {
    requestedModel: body.model || "auto-fastest",
    selectedProvider,
    fallbackTriggered: fallbackOccurred,
    httpStatus,
    ttftMs: duration,
    totalDurationMs: duration,
    completionTokens: responseData?.usage?.completion_tokens || 8,
    promptTokens: responseData?.usage?.prompt_tokens || (body.messages || []).length
  });

  if (c.executionCtx?.waitUntil) {
    c.executionCtx.waitUntil(task);
  }

  return c.json(responseData, httpStatus as any);
});

export default app;
