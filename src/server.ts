// src/server.ts
import { serve } from "@hono/node-server";
import app from "./index.js";

const port = Number(process.env.PORT) || 8787;

console.log(`[PulseRoute] Server starting on http://localhost:${port}`);
console.log(`[PulseRoute] Endpoints available:`);
console.log(`  - Health:      GET  http://localhost:${port}/health`);
console.log(`  - Completions: POST http://localhost:${port}/v1/chat/completions`);

serve({
  fetch: app.fetch,
  port
});
