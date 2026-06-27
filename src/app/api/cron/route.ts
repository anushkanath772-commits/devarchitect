import { NextResponse } from "next/server";
import { runScraper } from "@/lib/scraper";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sources = await prisma.source.findMany({ where: { active: true } });

  if (sources.length === 0) {
    await prisma.source.create({
      data: {
        name: "Engineering at Meta",
        url: "https://engineering.fb.com/",
      },
    });
  }

  const results = await runScraper();

  return NextResponse.json({
    success: true,
    results,
    scrapedAt: new Date().toISOString(),
  });
}
