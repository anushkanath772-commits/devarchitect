import { NextResponse } from "next/server";
import { runScraper } from "@/lib/scraper";
import { prisma } from "@/lib/db";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sourceId, batch } = body as { sourceId?: string; batch?: number };

    const sources = await prisma.source.findMany({
      where: sourceId ? { id: sourceId } : { active: true },
      orderBy: { name: "asc" },
    });

    if (sources.length === 0) {
      return NextResponse.json({ success: true, results: [], message: "No sources found" });
    }

    // If batch is specified, only scrape that batch (2 sources per batch)
    const batchSize = 2;
    const batchIndex = batch ?? 0;
    const sourcesToScrape = sourceId
      ? sources
      : sources.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);

    const totalBatches = Math.ceil(sources.length / batchSize);

    const results = [];
    for (const source of sourcesToScrape) {
      const result = await runScraper(source.id);
      results.push(...result);
    }

    return NextResponse.json({
      success: true,
      results,
      batch: batchIndex,
      totalBatches,
      hasMore: batchIndex < totalBatches - 1,
      scrapedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to trigger scraping",
    usage: 'POST /api/scrape with optional { sourceId: string } or { batch: number }',
  });
}
