import { prisma } from "@/lib/db";
import { HomePage } from "@/components/HomePage";

export const dynamic = "force-dynamic";

export default async function Page() {
  try {
    const [articles, sources, topics] = await Promise.all([
      prisma.article.findMany({
        include: {
          source: { select: { name: true, url: true } },
          topics: { include: { topic: true } },
        },
        orderBy: [{ publishedAt: "desc" }, { scrapedAt: "desc" }],
        take: 50,
      }),
      prisma.source.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
      prisma.topic.findMany({
        where: {
          articles: { some: {} },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    const formattedArticles = articles.map((a) => ({
      ...a,
      publishedAt: a.publishedAt?.toISOString() ?? null,
      scrapedAt: a.scrapedAt.toISOString(),
      topics: a.topics.map((t) => t.topic),
    }));

    const formattedSources = sources.map((s) => ({
      name: s.name,
      url: s.url,
    }));

    // Only keep meaningful curated topics
    const ALLOWED_SLUGS = new Set([
      "ai-machine-learning",
      "machine-learning",
      "infrastructure",
      "security",
      "data-engineering",
      "data-science",
      "mobile",
      "web-development",
      "open-source",
      "production-engineering",
      "video-media",
      "networking",
      "developer-tools",
      "developer-experience",
      "platform",
      "distributed-systems",
      "big-data",
      "data",
      "microservices",
      "kubernetes",
      "observability",
      "software-engineering",
    ]);

    const cleanTopics = topics.filter((t) => ALLOWED_SLUGS.has(t.slug));

    return (
      <HomePage
        initialArticles={formattedArticles}
        sources={formattedSources}
        topics={cleanTopics}
      />
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Database Connection Error</h1>
        <p className="mt-4 text-gray-700">{message}</p>
        <p className="mt-2 text-sm text-gray-500">
          TURSO_DATABASE_URL set: {process.env.TURSO_DATABASE_URL ? "yes" : "no"} |
          TURSO_AUTH_TOKEN set: {process.env.TURSO_AUTH_TOKEN ? "yes" : "no"}
        </p>
      </div>
    );
  }
}
