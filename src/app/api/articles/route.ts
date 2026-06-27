import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic");
  const source = searchParams.get("source");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (topic) {
    where.topics = {
      some: {
        topic: { slug: topic },
      },
    };
  }

  if (source) {
    where.source = { url: source };
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { summary: { contains: search } },
    ];
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        source: { select: { name: true, url: true } },
        topics: { include: { topic: true } },
      },
      orderBy: [{ publishedAt: "desc" }, { scrapedAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({
    articles: articles.map((a) => ({
      ...a,
      topics: a.topics.map((t) => t.topic),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
