// src/router.ts
export interface ProviderConfig {
  name: string;
  url: string;
  apiKey: string;
}

export async function routeWithFallback(providers: ProviderConfig[], body: any) {
  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s failover threshold

      const response = await fetch(provider.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${provider.apiKey}`
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // If rate limited or server error, trigger next provider in the chain
      if (response.status === 429 || response.status >= 500) {
        console.warn(`Provider ${provider.name} failed with ${response.status}. Falling back...`);
        continue;
      }

      return { response, providerName: provider.name, fallbackOccurred: provider !== providers[0] };
    } catch (err) {
      lastError = err as Error;
      console.warn(`Provider ${provider.name} timed out or failed. Falling back...`);
    }
  }

  throw new Error(`All upstream providers exhausted. Last error: ${lastError?.message}`);
}