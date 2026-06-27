import axios from "axios";
import * as cheerio from "cheerio";
import { ScrapedArticle } from "./meta";

export async function scrapeRssFeed(feedUrl: string): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = [];

  try {
    const { data: xml } = await axios.get(feedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(xml, { xmlMode: true });

    $("item").each((_, element) => {
      const $el = $(element);

      const title = $el.find("title").text().trim();
      let url = $el.find("link").text().trim();

      if (!title || !url) return;

      // Clean Medium source params from URLs
      url = url.replace(/\?source=rss.*$/, "");

      const pubDate = $el.find("pubDate").text().trim();
      const publishedAt = pubDate ? new Date(pubDate) : undefined;

      const creator = $el.find("dc\\:creator").text().trim();

      // Extract summary from content:encoded or description
      const content =
        $el.find("content\\:encoded").text() ||
        $el.find("description").text();
      let summary: string | undefined;
      if (content) {
        const $content = cheerio.load(content);
        summary = $content("p").first().text().trim();
        if (summary && summary.length > 300) {
          summary = summary.slice(0, 297) + "...";
        }
      }

      // Extract categories/tags
      const topics: string[] = [];
      $el.find("category").each((_, cat) => {
        const name = $(cat).text().trim();
        if (name && name.length < 50) topics.push(name);
      });

      articles.push({
        title,
        url,
        summary: summary || undefined,
        author: creator || undefined,
        publishedAt:
          publishedAt && !isNaN(publishedAt.getTime())
            ? publishedAt
            : undefined,
        topics,
      });
    });
  } catch (error) {
    console.error("Error scraping RSS feed:", error);
    throw error;
  }

  return articles;
}
