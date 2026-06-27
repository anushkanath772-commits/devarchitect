"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { getArticleImage, getSourceBadgeStyle, getSourceLogo, getSourceColor } from "@/lib/images";

interface Article {
  id: string;
  title: string;
  url: string;
  summary?: string | null;
  author?: string | null;
  publishedAt?: string | null;
  scrapedAt: string;
  imageUrl?: string | null;
  source: { name: string; url: string };
  topics: { id: string; name: string; slug: string }[];
}

export function ArticleCard({ article }: { article: Article }) {
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const imageUrl = article.imageUrl || getArticleImage(article.id, article.title);
  const sourceBadgeStyle = getSourceBadgeStyle(article.source.name);
  const logo = getSourceLogo(article.source.name);
  const sourceColor = getSourceColor(article.source.name);

  const dateDisplay = (() => {
    const date = article.publishedAt
      ? new Date(article.publishedAt)
      : new Date(article.scrapedAt);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 7) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, "MMM d");
  })();

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-44 overflow-hidden bg-gray-100">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            {logo && !logoError ? (
              <img
                src={logo}
                alt={article.source.name}
                className="h-10 w-auto object-contain opacity-60"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span
                className="text-4xl font-bold opacity-20"
                style={{ color: sourceColor }}
              >
                {article.source.name.charAt(0)}
              </span>
            )}
          </div>
        ) : (
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
      </div>

      <div className="flex flex-col flex-1 p-5 gap-3">
        <span
          className="self-start px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide"
          style={sourceBadgeStyle}
        >
          {article.source.name
            .replace(" Engineering", "")
            .replace(" Tech Blog", "")
            .replace(" Dev Blogs", "")
            .replace(" Developers", "")
            .replace(" Research", "")
            .replace(" at ", " ")}
        </span>

        <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>

        {article.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {article.topics
              .filter(
                (t) =>
                  !/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(t.name) &&
                  !/^\d{4}/.test(t.name) &&
                  t.name.length <= 25
              )
              .slice(0, 3)
              .map((topic) => (
                <span
                  key={topic.id}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-600 border border-gray-200"
                >
                  {topic.name}
                </span>
              ))}
          </div>
        )}

        {article.summary && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
            {article.summary}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
          <span className="text-xs font-medium text-gray-600">
            {article.source.name}
          </span>
          <span className="text-xs text-gray-400">{dateDisplay}</span>
        </div>
      </div>
    </a>
  );
}
