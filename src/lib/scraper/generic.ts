import axios from "axios";
import * as cheerio from "cheerio";
import { ScrapedArticle } from "./meta";

interface SiteConfig {
  url: string;
  name: string;
  articleSelectors: string[];
  titleSelectors: string[];
  linkSelectors: string[];
  dateSelectors: string[];
  summarySelectors: string[];
  authorSelectors: string[];
  topicSelectors: string[];
  urlDatePattern?: RegExp;
  baseUrl?: string;
}

const SITE_CONFIGS: Record<string, SiteConfig> = {
  "eng.uber.com": {
    url: "https://eng.uber.com/",
    name: "Uber Engineering",
    articleSelectors: ["[class*='post'], [class*='article'], article, [class*='card']"],
    titleSelectors: ["h2 a", "h3 a", "h2", "h3", "h4"],
    linkSelectors: ["a[href*='/blog/']", "a[href*='/20']"],
    dateSelectors: ["time", "[class*='date']", "[class*='meta']"],
    summarySelectors: ["p", "[class*='excerpt']", "[class*='description']"],
    authorSelectors: ["[class*='author']"],
    topicSelectors: ["[class*='category'] a", "[class*='tag'] a", "[rel='tag']"],
    urlDatePattern: /\/(\d{4})\/(\d{2})\/(\d{2})\//,
    baseUrl: "https://www.uber.com",
  },
  "canvatechblog.com": {
    url: "https://www.canva.dev/blog/engineering/",
    name: "Canva Engineering",
    articleSelectors: ["article, [class*='post'], [class*='card'], [class*='article']"],
    titleSelectors: ["h2 a", "h3 a", "h2", "h3"],
    linkSelectors: ["a[href*='/blog/engineering/']"],
    dateSelectors: ["time", "[class*='date']"],
    summarySelectors: ["[class*='excerpt']", "[class*='subtitle']", "p"],
    authorSelectors: ["[class*='author']", "[class*='byline']"],
    topicSelectors: ["[class*='category']", "[class*='tag']"],
    baseUrl: "https://www.canva.dev",
  },
  "ai.googleblog.com": {
    url: "https://research.google/blog/",
    name: "Google Research",
    articleSelectors: ["article, [class*='post'], [class*='card'], li"],
    titleSelectors: ["h2", "h3", "a"],
    linkSelectors: ["a[href*='/blog/']"],
    dateSelectors: ["time", "[class*='date']", "[class*='published']"],
    summarySelectors: ["p", "[class*='snippet']"],
    authorSelectors: ["[class*='author']"],
    topicSelectors: ["[class*='label']", "[class*='category']", "[class*='tag']"],
    baseUrl: "https://research.google",
  },
  "engineering.atspotify.com": {
    url: "https://engineering.atspotify.com/",
    name: "Spotify Engineering",
    articleSelectors: ["article, [class*='post'], [class*='card']"],
    titleSelectors: ["h2", "h3", "a"],
    linkSelectors: ["a"],
    dateSelectors: ["time", "[class*='date']"],
    summarySelectors: ["p", "[class*='excerpt']", "[class*='description']"],
    authorSelectors: ["[class*='author']"],
    topicSelectors: ["[class*='category']", "[class*='tag']"],
    urlDatePattern: /\/(\d{4})\/(\d{2})\/(\d{2})\//,
    baseUrl: "https://engineering.atspotify.com",
  },
  "anthropic.com/engineering": {
    url: "https://www.anthropic.com/engineering",
    name: "Anthropic Engineering",
    articleSelectors: ["article, [class*='post'], [class*='card'], a[href*='/engineering/']"],
    titleSelectors: ["h2", "h3", "h4", "span", "p"],
    linkSelectors: ["a[href*='/engineering/']"],
    dateSelectors: ["time", "[class*='date']"],
    summarySelectors: ["p", "[class*='description']"],
    authorSelectors: ["[class*='author']"],
    topicSelectors: ["[class*='tag']"],
    baseUrl: "https://www.anthropic.com",
  },
  "developers.openai.com/blog": {
    url: "https://developers.openai.com/blog",
    name: "OpenAI Developers",
    articleSelectors: ["article, [class*='post'], [class*='card'], a[href*='/blog/']"],
    titleSelectors: ["h2", "h3", "h4"],
    linkSelectors: ["a[href*='/blog/']"],
    dateSelectors: ["time", "[class*='date']"],
    summarySelectors: ["p", "[class*='description']", "[class*='excerpt']"],
    authorSelectors: ["[class*='author']"],
    topicSelectors: ["[class*='tag']", "[class*='category']"],
    baseUrl: "https://developers.openai.com",
  },
  "netflixtechblog.com": {
    url: "https://netflixtechblog.com/",
    name: "Netflix Tech Blog",
    articleSelectors: ["article, [class*='post'], [class*='card']"],
    titleSelectors: ["h2", "h3", "a"],
    linkSelectors: ["a"],
    dateSelectors: ["time", "[class*='date']"],
    summarySelectors: ["p", "[class*='excerpt']", "[class*='preview']"],
    authorSelectors: ["[class*='author']"],
    topicSelectors: ["[class*='tag']"],
    baseUrl: "https://netflixtechblog.com",
  },
};

function extractDateFromUrl(url: string): Date | undefined {
  const patterns = [
    /\/(\d{4})\/(\d{2})\/(\d{2})\//,
    /\/(\d{4})\/(\d{2})\//,
    /(\d{4})-(\d{2})-(\d{2})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]);
      const day = match[3] ? parseInt(match[3]) : 1;
      const date = new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
      if (!isNaN(date.getTime()) && year > 2000 && year < 2030) {
        return date;
      }
    }
  }
  return undefined;
}

function parseTextDate(text: string): Date | undefined {
  if (!text) return undefined;
  const cleaned = text.trim().replace(/\s+/g, " ");

  // "Jun 26, 2026" or "June 26, 2026"
  const monthDayYear = cleaned.match(
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/i
  );
  if (monthDayYear) {
    const d = new Date(monthDayYear[0]);
    if (!isNaN(d.getTime())) return d;
  }

  // "26 Jun 2026"
  const dayMonthYear = cleaned.match(
    /\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}/i
  );
  if (dayMonthYear) {
    const d = new Date(dayMonthYear[0]);
    if (!isNaN(d.getTime())) return d;
  }

  // "2026-06-26"
  const isoDate = cleaned.match(/\d{4}-\d{2}-\d{2}/);
  if (isoDate) {
    const d = new Date(isoDate[0]);
    if (!isNaN(d.getTime())) return d;
  }

  // "Jun 10, 2026" without comma
  const monthDay = cleaned.match(
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}\s+\d{4}/i
  );
  if (monthDay) {
    const d = new Date(monthDay[0]);
    if (!isNaN(d.getTime())) return d;
  }

  return undefined;
}

export function getSiteConfig(url: string): SiteConfig | undefined {
  for (const [key, config] of Object.entries(SITE_CONFIGS)) {
    if (url.includes(key)) return config;
  }
  if (url.includes("canva.dev") || url.includes("canvatechblog")) {
    return SITE_CONFIGS["canvatechblog.com"];
  }
  if (url.includes("research.google") || url.includes("googleblog")) {
    return SITE_CONFIGS["ai.googleblog.com"];
  }
  return undefined;
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/^\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\s*/i, "")
    .replace(/\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDateFromTitle(raw: string): Date | undefined {
  const dateMatch = raw.match(
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/i
  );
  if (dateMatch) {
    const d = new Date(dateMatch[0]);
    if (!isNaN(d.getTime())) return d;
  }
  return undefined;
}

export async function scrapeGeneric(sourceUrl: string): Promise<ScrapedArticle[]> {
  const config = getSiteConfig(sourceUrl);
  if (!config) {
    throw new Error(`No scraper config for: ${sourceUrl}`);
  }

  const articles: ScrapedArticle[] = [];
  const seenUrls = new Set<string>();

  try {
    const { data: html } = await axios.get(config.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(html);

    // Strategy 1: Find articles via structured article elements
    for (const selector of config.articleSelectors) {
      $(selector).each((_, element) => {
        const $el = $(element);
        let title = "";
        let url = "";

        for (const ts of config.titleSelectors) {
          const found = $el.find(ts).first();
          if (found.length) {
            title = found.text().trim();
            url = found.attr("href") || found.find("a").attr("href") || "";
            if (title) break;
          }
        }

        if (!title || title.length < 10) return;
        const titleDate = extractDateFromTitle(title);
        title = cleanTitle(title);
        if (!title || title.length < 10) return;

        const skipTitles = ["latest posts", "load more", "see more", "read more", "view all", "subscribe", "next page", "previous page"];
        if (skipTitles.some((s) => title.toLowerCase() === s)) return;
        if (!url) {
          url = $el.find("a").first().attr("href") || "";
        }
        if (!url) return;

        const fullUrl = url.startsWith("http")
          ? url
          : `${config.baseUrl || ""}${url.startsWith("/") ? "" : "/"}${url}`;

        const cleanUrl = fullUrl.split("?")[0].split("#")[0];

        if (seenUrls.has(cleanUrl)) return;
        if (cleanUrl.includes("/category/") || cleanUrl.includes("/tag/") || cleanUrl.includes("/page/")) return;

        seenUrls.add(cleanUrl);

        const summary = (() => {
          for (const ss of config.summarySelectors) {
            const text = $el.find(ss).first().text().trim();
            if (text && text !== title && text.length > 20) return text;
          }
          return undefined;
        })();

        const author = (() => {
          for (const as of config.authorSelectors) {
            const text = $el.find(as).first().text().trim();
            if (text) return text;
          }
          return undefined;
        })();

        const publishedAt = (() => {
          for (const ds of config.dateSelectors) {
            const timeEl = $el.find(ds).first();
            const dateStr = timeEl.attr("datetime") || timeEl.text().trim();
            if (dateStr) {
              const d = new Date(dateStr);
              if (!isNaN(d.getTime())) return d;
              const parsed = parseTextDate(dateStr);
              if (parsed) return parsed;
            }
          }
          // Try to find any date-like text near the article
          const nearbyText = $el.text();
          const textDate = parseTextDate(nearbyText);
          if (textDate) return textDate;
          if (titleDate) return titleDate;
          return extractDateFromUrl(cleanUrl);
        })();

        const topics: string[] = [];
        for (const ts of config.topicSelectors) {
          $el.find(ts).each((_, tag) => {
            const name = $(tag).text().trim();
            if (name && name.length < 50) topics.push(name);
          });
        }

        articles.push({
          title: title.slice(0, 300),
          url: cleanUrl,
          summary: summary?.slice(0, 500),
          author,
          publishedAt,
          topics,
        });
      });
    }

    // Strategy 2: If no structured articles found, extract links with blog-like URLs
    if (articles.length === 0) {
      $("a[href]").each((_, element) => {
        const $el = $(element);
        const href = $el.attr("href") || "";
        let title = $el.text().trim();

        if (!title || title.length < 15 || title.length > 300) return;
        title = cleanTitle(title);
        if (!title || title.length < 15) return;
        if (!href) return;

        const fullUrl = href.startsWith("http")
          ? href
          : `${config.baseUrl || ""}${href.startsWith("/") ? "" : "/"}${href}`;

        if (seenUrls.has(fullUrl)) return;
        if (fullUrl.includes("/category/") || fullUrl.includes("/tag/") || fullUrl.includes("/page/")) return;
        if (!fullUrl.includes("/20") && !fullUrl.includes("/blog/") && !fullUrl.includes("/engineering/")) return;

        seenUrls.add(fullUrl);

        const publishedAt = extractDateFromUrl(fullUrl);

        articles.push({
          title,
          url: fullUrl,
          publishedAt,
          topics: [],
        });
      });
    }
  } catch (error) {
    console.error(`Error scraping ${config.name}:`, error);
    throw error;
  }

  return articles;
}
