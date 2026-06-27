import { prisma } from "@/lib/db";
import { scrapeMetaEngineering, ScrapedArticle } from "./meta";
import { scrapeGeneric, getSiteConfig } from "./generic";
import { scrapeRssFeed } from "./rss";
import { classifyTopics } from "./classify";

export async function runScraper(sourceId?: string) {
  const sources = await prisma.source.findMany({
    where: sourceId ? { id: sourceId } : { active: true },
  });

  const results: { source: string; newArticles: number; errors: string[] }[] =
    [];

  for (const source of sources) {
    const errors: string[] = [];
    let newArticles = 0;

    try {
      let scraped: ScrapedArticle[] = [];

      if (source.url.includes("engineering.fb.com")) {
        scraped = await scrapeMetaEngineering();
      } else if (source.url.includes("netflixtechblog.com")) {
        scraped = await scrapeRssFeed("https://netflixtechblog.com/feed");
      } else if (getSiteConfig(source.url)) {
        scraped = await scrapeGeneric(source.url);
      }

      for (const article of scraped) {
        try {
          const topicSlugs =
            article.topics.length > 0
              ? article.topics.map((t) =>
                  t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                )
              : classifyTopics(article.title, article.summary);

          const topicConnections = await Promise.all(
            topicSlugs.map(async (slug) => {
              const name = slug
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");

              const topic = await prisma.topic.upsert({
                where: { slug },
                create: { name, slug },
                update: {},
              });

              return { topicId: topic.id };
            })
          );

          const existing = await prisma.article.findUnique({
            where: { url: article.url },
            include: { topics: true },
          });

          if (existing) {
            await prisma.article.update({
              where: { url: article.url },
              data: {
                title: article.title,
                summary: article.summary,
                author: article.author,
                publishedAt: article.publishedAt,
                imageUrl: article.imageUrl,
                topics: {
                  deleteMany: {},
                  create: topicConnections,
                },
              },
            });
          } else {
            await prisma.article.create({
              data: {
                title: article.title,
                url: article.url,
                summary: article.summary,
                author: article.author,
                publishedAt: article.publishedAt,
                imageUrl: article.imageUrl,
                sourceId: source.id,
                topics: {
                  create: topicConnections,
                },
              },
            });
          }

          newArticles++;
        } catch (err) {
          if (
            err instanceof Error &&
            err.message.includes("Unique constraint")
          ) {
            continue;
          }
          errors.push(`Article "${article.title}": ${err}`);
        }
      }
    } catch (err) {
      errors.push(`Source "${source.name}": ${err}`);
    }

    results.push({ source: source.name, newArticles, errors });
  }

  return results;
}
