import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulseRoute | Edge LLM Telemetry & Router Gateway",
  description: "Sub-15ms edge reverse proxy with dynamic failover, TTFT telemetry, and MCP protocol integration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-zinc-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
        <div className="fixed inset-0 bg-grid-pattern pointer-events-none z-0 opacity-80" />
        <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
