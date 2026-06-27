"use client";

import { useState } from "react";

export function ScrapeButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleScrape() {
    setLoading(true);
    setResult(null);

    try {
      let totalNew = 0;
      let batch = 0;
      let hasMore = true;

      while (hasMore) {
        setResult(`Scraping batch ${batch + 1}...`);
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ batch }),
        });
        const data = await res.json();

        if (!data.success) {
          setResult(`Error: ${data.error}`);
          return;
        }

        totalNew += data.results.reduce(
          (sum: number, r: { newArticles: number }) => sum + r.newArticles,
          0
        );
        hasMore = data.hasMore;
        batch++;
      }

      setResult(`${totalNew} articles updated`);
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setResult("Failed to connect");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleScrape}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
            Scraping...
          </>
        ) : (
          "Scrape Now"
        )}
      </button>
      {result && (
        <span className="text-xs text-gray-500">{result}</span>
      )}
    </div>
  );
}
