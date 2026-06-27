"use client";

import { useState, useCallback } from "react";
import { ArticleCard } from "./ArticleCard";
import { SourceFilter } from "./SourceFilter";
import { SearchBar } from "./SearchBar";
import { ScrapeButton } from "./ScrapeButton";
import { getArticleImage, getSourceColor, getSourceLogo } from "@/lib/images";
import { format } from "date-fns";

interface Source {
  name: string;
  url: string;
}

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

interface Topic {
  id: string;
  name: string;
  slug: string;
}

interface HomePageProps {
  initialArticles: Article[];
  sources: Source[];
  topics: Topic[];
}

export function HomePage({ initialArticles, sources, topics }: HomePageProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchArticles = useCallback(
    async (source: string | null, topic: string | null, search: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (source) params.set("source", source);
        if (topic) params.set("topic", topic);
        if (search) params.set("search", search);

        const res = await fetch(`/api/articles?${params.toString()}`);
        const data = await res.json();
        setArticles(data.articles);
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSourceChange = useCallback(
    (source: string | null) => {
      setSelectedSource(source);
      fetchArticles(source, selectedTopic, searchQuery);
    },
    [fetchArticles, selectedTopic, searchQuery]
  );

  const handleTopicChange = useCallback(
    (topic: string | null) => {
      setSelectedTopic(topic);
      fetchArticles(selectedSource, topic, searchQuery);
    },
    [fetchArticles, selectedSource, searchQuery]
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      fetchArticles(selectedSource, selectedTopic, query);
    },
    [fetchArticles, selectedSource, selectedTopic]
  );

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                DevArchitect
              </h1>
              <nav className="hidden sm:flex items-center gap-6">
                <span className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-0.5">
                  Articles
                </span>
                <span className="text-sm text-gray-500">
                  {sources.length} Sources
                </span>
              </nav>
            </div>
            <ScrapeButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Featured Article */}
        {featured && !selectedSource && !searchQuery && (
          <FeaturedArticle article={featured} />
        )}

        {/* Filters & Search */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">
              Latest Insights
            </h2>
            <div className="w-full sm:w-72">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>

          <SourceFilter
            sources={sources}
            selectedSource={selectedSource}
            onSelect={handleSourceChange}
          />
        </div>

        {/* Article Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold text-gray-900">
              No articles yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Click &quot;Scrape Now&quot; to fetch articles from your configured
              sources.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(selectedSource || searchQuery ? articles : rest).map(
                (article) => (
                  <ArticleCard key={article.id} article={article} />
                )
              )}
            </div>

            {articles.length >= 20 && (
              <div className="flex justify-center pt-4">
                <button className="px-6 py-2.5 border-2 border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors uppercase tracking-wide">
                  Load More Articles
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function FeaturedArticle({ article }: { article: Article }) {
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const imageUrl = article.imageUrl || getArticleImage(article.id, article.title);
  const logo = getSourceLogo(article.source.name);
  const sourceColor = getSourceColor(article.source.name);

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block rounded-3xl overflow-hidden h-72 shadow-lg"
    >
      {imgError ? (
        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
          {logo && !logoError ? (
            <img
              src={logo}
              alt=""
              className="h-16 w-auto opacity-20"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-5xl font-bold text-white/10">
              {article.source.name.charAt(0)}
            </span>
          )}
        </div>
      ) : (
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgError(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="absolute top-6 left-6">
        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold uppercase rounded-full tracking-wide">
          Latest
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-2"
          style={{ color: sourceColor }}
        >
          {article.source.name}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight max-w-2xl">
          {article.title}
        </h2>
        {article.summary && (
          <p className="mt-2 text-sm text-gray-300 max-w-xl line-clamp-2">
            {article.summary}
          </p>
        )}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-gray-300">
            {article.author || article.source.name}
          </span>
          {article.publishedAt && (
            <span className="text-sm text-gray-400">
              &middot; {format(new Date(article.publishedAt), "MMM d, yyyy")}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
