"use client";

import { useState } from "react";

export function ScrapeButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleScrape() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/scrape", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        const totalNew = data.results.reduce(
          (sum: number, r: { newArticles: number }) => sum + r.newArticles,
          0
        );
        setResult(`${totalNew} articles updated`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setResult(`Error: ${data.error}`);
      }
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
