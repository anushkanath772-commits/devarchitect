import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedArticle {
  title: string;
  url: string;
  summary?: string;
  author?: string;
  publishedAt?: Date;
  imageUrl?: string;
  topics: string[];
}

const META_ENGINEERING_URL = "https://engineering.fb.com/";

export async function scrapeMetaEngineering(): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = [];

  try {
    const { data: html } = await axios.get(META_ENGINEERING_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(html);

    $("article, .post, [class*='post-item'], [class*='article']").each(
      (_, element) => {
        const $el = $(element);

        const titleEl =
          $el.find("h2 a").first() ||
          $el.find("h3 a").first() ||
          $el.find("a[class*='title']").first();

        const title = titleEl.text().trim();
        const url = titleEl.attr("href");

        if (!title || !url) return;

        const fullUrl = url.startsWith("http")
          ? url
          : `https://engineering.fb.com${url}`;

        const summary =
          $el.find("p").first().text().trim() ||
          $el.find("[class*='excerpt']").text().trim() ||
          undefined;

        const author =
          $el.find("[class*='author']").text().trim() || undefined;

        const imageUrl =
          $el.find("img").first().attr("src") ||
          $el.find("img").first().attr("data-src") ||
          undefined;

        const dateStr =
          $el.find("time").attr("datetime") ||
          $el.find("[class*='date']").text().trim();
        let publishedAt = dateStr ? new Date(dateStr) : undefined;

        if (!publishedAt || isNaN(publishedAt.getTime())) {
          const dateMatch = fullUrl.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
          publishedAt = dateMatch
            ? new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`)
            : undefined;
        }

        const topics: string[] = [];
        $el.find("[class*='category'] a, [class*='tag'] a, [rel='tag']").each(
          (_, tag) => {
            const topicName = $(tag).text().trim();
            if (topicName) topics.push(topicName);
          }
        );

        articles.push({
          title,
          url: fullUrl,
          summary,
          author,
          publishedAt:
            publishedAt && !isNaN(publishedAt.getTime())
              ? publishedAt
              : undefined,
          imageUrl,
          topics,
        });
      }
    );

    if (articles.length === 0) {
      const fallbackArticles = await scrapeFallback($);
      articles.push(...fallbackArticles);
    }
  } catch (error) {
    console.error("Error scraping Meta Engineering blog:", error);
    throw error;
  }

  return articles;
}

async function scrapeFallback($: ReturnType<typeof cheerio.load>): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = [];

  $("a[href*='/20']").each((_, element) => {
    const $el = $(element);
    const url = $el.attr("href");
    const title =
      $el.text().trim() ||
      $el.find("h2, h3, h4").text().trim();

    if (!title || !url || title.length < 10) return;
    if (url.includes("/category/") || url.includes("/tag/")) return;

    const fullUrl = url.startsWith("http")
      ? url
      : `https://engineering.fb.com${url}`;

    if (articles.some((a) => a.url === fullUrl)) return;

    const dateMatch = fullUrl.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
    const publishedAt = dateMatch
      ? new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`)
      : undefined;

    articles.push({
      title,
      url: fullUrl,
      publishedAt:
        publishedAt && !isNaN(publishedAt.getTime()) ? publishedAt : undefined,
      topics: [],
    });
  });

  return articles;
}
