import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const topics = await prisma.topic.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { articles: true } },
    },
  });

  return NextResponse.json({
    topics: topics.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      articleCount: t._count.articles,
    })),
  });
}
