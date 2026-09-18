// src/proxy.ts
export function createTelemetryStream(
  upstreamStream: ReadableStream,
  onFirstToken: (ttft: number) => void,
  onComplete: (totalChunks: number) => void
) {
  const startTime = performance.now();
  let firstTokenLogged = false;
  let chunkCount = 0;

  const transformer = new TransformStream({
    transform(chunk, controller) {
      if (!firstTokenLogged) {
        const text = new TextDecoder().decode(chunk);
        if (text.includes('"delta"') || text.includes('content')) {
          onFirstToken(Math.round(performance.now() - startTime));
          firstTokenLogged = true;
        }
      }
      chunkCount++;
      controller.enqueue(chunk);
    },
    flush() {
      onComplete(chunkCount);
    }
  });

  return upstreamStream.pipeThrough(transformer);
}