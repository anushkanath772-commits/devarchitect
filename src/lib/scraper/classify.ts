const TOPIC_KEYWORDS: Record<string, string[]> = {
  "ai-machine-learning": [
    "ai", "machine learning", "ml", "neural", "model", "llm", "deep learning",
    "training", "inference", "recommendation", "nlp", "computer vision",
    "generative", "transformer", "diffusion", "reinforcement learning",
  ],
  "infrastructure": [
    "infrastructure", "scalability", "distributed", "cluster", "data center",
    "capacity", "hardware", "server", "storage", "hyperscale", "efficiency",
  ],
  "security": [
    "security", "encryption", "cryptography", "privacy", "authentication",
    "vulnerability", "threat", "quantum", "e2e", "end-to-end encrypted",
  ],
  "data-engineering": [
    "data engineering", "data pipeline", "analytics", "warehouse", "sql",
    "streaming", "batch processing", "etl", "data lake", "spark",
  ],
  "mobile": [
    "mobile", "android", "ios", "react native", "app", "battery",
    "performance mobile", "smartphone",
  ],
  "web-development": [
    "web", "react", "javascript", "typescript", "frontend", "browser",
    "css", "html", "dom", "rendering", "webpack", "bundler",
  ],
  "open-source": [
    "open source", "open-source", "github", "community", "release",
    "framework", "library", "pytorch", "llama",
  ],
  "production-engineering": [
    "production engineering", "reliability", "sre", "incident", "monitoring",
    "observability", "deployment", "ci/cd", "testing", "automation",
  ],
  "video-media": [
    "video", "media", "streaming", "codec", "encoding", "reels",
    "live", "audio", "compression",
  ],
  "networking": [
    "networking", "network", "dns", "cdn", "load balancer", "tcp",
    "routing", "traffic", "bandwidth", "fiber", "connectivity",
  ],
};

export function classifyTopics(title: string, summary?: string | null): string[] {
  const text = `${title} ${summary || ""}`.toLowerCase();
  const matched: string[] = [];

  for (const [slug, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matched.push(slug);
        break;
      }
    }
  }

  if (matched.length === 0) {
    matched.push("infrastructure");
  }

  return matched;
}
