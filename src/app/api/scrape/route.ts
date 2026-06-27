import { NextResponse } from "next/server";
import { runScraper } from "@/lib/scraper";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sourceId } = body as { sourceId?: string };

    const sources = await prisma.source.findMany({
      where: { active: true },
    });

    if (sources.length === 0) {
      await prisma.source.create({
        data: {
          name: "Engineering at Meta",
          url: "https://engineering.fb.com/",
        },
      });
    }

    const results = await runScraper(sourceId);

    return NextResponse.json({
      success: true,
      results,
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
    usage: "POST /api/scrape with optional { sourceId: string }",
  });
}
