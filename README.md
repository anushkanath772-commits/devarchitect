# DevArchitect - Engineering Blog Aggregator

A full-stack web application that scrapes engineering blogs from top tech companies and presents them in a modern, searchable, filterable interface.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-SQLite-2D3748) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC)

## Overview

DevArchitect aggregates engineering blog posts from 9 major tech companies into a single, beautiful interface. It automatically scrapes articles, classifies them by topic using keyword analysis, and presents them sorted by publish date with stock tech imagery and company logos.

## Supported Sources

| Source | Method | Articles |
|--------|--------|----------|
| [Engineering at Meta](https://engineering.fb.com/) | Custom HTML scraper | ~12 |
| [Uber Engineering](https://eng.uber.com/) | Generic HTML scraper | ~10 |
| [Canva Engineering](https://canvatechblog.com/) | Generic HTML scraper | ~10 |
| [Google Research](https://ai.googleblog.com/) | Generic HTML scraper | ~44 |
| [Spotify Engineering](https://engineering.atspotify.com/) | Generic HTML scraper | ~13 |
| [Anthropic Engineering](https://www.anthropic.com/engineering) | Generic HTML scraper | ~27 |
| [OpenAI Developers](https://developers.openai.com/blog) | Generic HTML scraper | ~20 |
| [Netflix Tech Blog](https://netflixtechblog.com/) | RSS feed (Medium blocks direct scraping) | ~10 |
| [Microsoft Dev Blogs](https://devblogs.microsoft.com/) | Generic HTML scraper | ~9 |

**Total: ~155 articles** across all sources.

## Features

- **Multi-source scraping** – Scrapes 9 engineering blogs on demand or via cron
- **Smart topic classification** – Auto-assigns topics (AI/ML, Security, Infrastructure, etc.) based on article title keywords when blogs don't expose categories
- **Source filtering** – Filter articles by company
- **Topic badges** – Each card shows relevant topic tags (up to 3)
- **Full-text search** – Search across article titles and summaries
- **Publish date extraction** – Extracts dates from URL paths (e.g., `/2026/04/16/`) when not available in HTML
- **Stock photo imagery** – 22 verified tech-themed Unsplash images with company logo fallback
- **Responsive light-mode UI** – Clean DevArchitect-style design with featured hero article
- **Scheduled scraping** – Cron endpoint for periodic updates (every 6 hours on Vercel)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | SQLite via Prisma ORM |
| Scraping | Cheerio (HTML parsing) + Axios (HTTP) |
| RSS | Cheerio in XML mode (for Medium-based blogs) |
| Date handling | date-fns |
| Deployment | Vercel-ready with cron support |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Database Setup

```bash
npx prisma migrate dev
npm run db:seed
```

This seeds the database with all 9 sources and 10 default topic categories.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scraping Articles

Either:
1. Click the **"Scrape Now"** button in the UI
2. Send a POST request to `/api/scrape`
3. Hit the cron endpoint: `GET /api/cron`

## Architecture

### Scraping Pipeline

```
Source URL → Scraper (HTML/RSS) → Extract articles → Classify topics → Upsert to DB
```

1. **Meta** uses a custom scraper tuned to its specific HTML structure
2. **Netflix** uses an RSS feed scraper (Medium blocks direct HTTP requests)
3. **All others** use a configurable generic scraper with per-site CSS selectors

### Topic Classification

When a blog doesn't expose category/tag metadata in its HTML, the system falls back to keyword-based classification:

- Scans article title and summary for keywords like "encryption", "AI", "kubernetes", etc.
- Maps matches to curated topic slugs (e.g., `ai-machine-learning`, `security`, `infrastructure`)
- Assigns "Infrastructure" as default when no keywords match

### Image Strategy

- Each article card shows a stock tech photo from a pool of 22 verified Unsplash URLs
- Images are deterministically assigned based on article ID hash (consistent across reloads)
- If an image fails to load, falls back to the company logo (from Wikimedia)
- If the logo also fails, shows the source's initial letter on a colored background

### Date Extraction

Articles get their publish date from (in priority order):
1. HTML `<time datetime="">` elements
2. Text-based dates parsed from nearby elements (e.g., "Jun 26, 2026")
3. URL path patterns (e.g., `/2026/04/16/` → April 16, 2026)
4. Falls back to scrape timestamp

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scrape` | Trigger scraping of all active sources |
| GET | `/api/articles` | Get articles (supports `?source=`, `?topic=`, `?search=`, `?page=`, `?limit=`) |
| GET | `/api/topics` | Get all topics with article counts |
| GET | `/api/cron` | Cron endpoint for scheduled scraping (supports `Bearer` auth) |

### Query Parameters for `/api/articles`

- `source` – Filter by source URL (e.g., `?source=https://engineering.fb.com/`)
- `topic` – Filter by topic slug (e.g., `?topic=ai-machine-learning`)
- `search` – Full-text search on title and summary
- `page` – Page number (default: 1)
- `limit` – Articles per page (default: 20)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client + build for production |
| `npm run start` | Start production server |
| `npm run db:seed` | Seed database with sources and topics |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio (visual DB editor) |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── articles/route.ts    – Articles API (search, filter, paginate)
│   │   ├── cron/route.ts        – Scheduled scraping endpoint
│   │   ├── scrape/route.ts      – Manual scrape trigger
│   │   └── topics/route.ts      – Topics API
│   ├── globals.css              – Tailwind + custom styles
│   ├── layout.tsx               – Root layout (Inter font, light mode)
│   └── page.tsx                 – Homepage (server component, data fetching)
├── components/
│   ├── ArticleCard.tsx          – Article card with image, badge, topics, date
│   ├── HomePage.tsx             – Main client UI (filters, grid, featured hero)
│   ├── ScrapeButton.tsx         – Scrape trigger button with loading state
│   ├── SearchBar.tsx            – Debounced search input
│   └── SourceFilter.tsx         – Source filter pills
├── generated/prisma/            – Auto-generated Prisma client
└── lib/
    ├── db.ts                    – Prisma client singleton
    ├── images.ts                – Stock photos, logos, colors, badge styles
    └── scraper/
        ├── classify.ts          – Keyword-based topic classification
        ├── generic.ts           – Configurable multi-site HTML scraper
        ├── index.ts             – Scraper orchestrator
        ├── meta.ts              – Meta Engineering custom scraper
        └── rss.ts               – RSS feed scraper (Netflix/Medium)
prisma/
├── schema.prisma                – DB schema (Source, Article, Topic, ArticleTopic)
├── seed.ts                      – Seed script (9 sources + 10 topics)
└── migrations/                  – SQLite migrations
```

## Database Schema

```
Source (1) ──→ (many) Article (many) ──→ (many) Topic
```

- **Source** – Blog origin (name, URL, active flag)
- **Article** – Scraped post (title, URL, summary, author, dates, source)
- **Topic** – Category tag (name, slug)
- **ArticleTopic** – Many-to-many join table

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Set `CRON_SECRET` environment variable for cron endpoint security
4. Deploy

The `vercel.json` includes a cron job that scrapes every 6 hours.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TURSO_DATABASE_URL` | Turso DB URL (or local SQLite path) | `file:./dev.db` (relative to prisma/) |
| `TURSO_AUTH_TOKEN` | Turso auth token (production only) | None (uses local SQLite if unset) |
| `CRON_SECRET` | Optional auth token for `/api/cron` | None (no auth if unset) |

## Deployment (Vercel + Turso)

### 1. Set up Turso

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Sign up / log in
turso auth signup   # or: turso auth login

# Create a database
turso db create devarchitect

# Get connection URL
turso db show devarchitect --url

# Create auth token
turso db tokens create devarchitect
```

### 2. Push schema to Turso

```bash
# Set env vars locally for the push
export TURSO_DATABASE_URL="libsql://your-db-name-your-org.turso.io"
export TURSO_AUTH_TOKEN="your-auth-token"

# Push schema
npx prisma db push
```

### 3. Seed the database

```bash
npx tsx prisma/seed.ts
```

### 4. Deploy to Vercel

1. Push code to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard:
   - `TURSO_DATABASE_URL` = your Turso URL (`libsql://...`)
   - `TURSO_AUTH_TOKEN` = your Turso auth token
   - `CRON_SECRET` = any secret string (optional, secures the cron endpoint)
4. Deploy!

The `vercel.json` file configures automatic scraping every 6 hours via Vercel Cron Jobs.

## Adding More Sources

1. **Create scraper config** in `src/lib/scraper/generic.ts` (add entry to `SITE_CONFIGS`)
2. **Add source** to the database via seed script or Prisma Studio
3. **Add logo/color** in `src/lib/images.ts`
4. For RSS-based blogs, add handling in `src/lib/scraper/index.ts` (like Netflix)

## Design Decisions

- **Turso (SQLite edge)** – SQLite-compatible, serverless, works perfectly with Vercel's edge functions
- **Cheerio over Puppeteer** – Lightweight, no browser overhead, sufficient for server-rendered blogs
- **RSS fallback** – Medium-hosted blogs (Netflix) block direct scraping, RSS is always available
- **Keyword classification** – Simple, fast, no LLM cost; works well for tech blog categorization
- **Deterministic image assignment** – Same article always gets the same stock photo (hash-based)
- **Light mode only** – Clean, professional reading experience matching the DevArchitect style

## Known Limitations

- Netflix scraping depends on RSS feed availability (Medium)
- Some Google Research articles have dates extracted from page text which can be imprecise
- Topic classification is keyword-based (not semantic); edge cases may miscategorize
- Stock photos are generic tech imagery, not article-specific
