import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url = process.env.TURSO_DATABASE_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN;

const adapter = new PrismaLibSql(authToken ? { url, authToken } : { url });
const prisma = new PrismaClient({ adapter } as never);

async function seed() {
  console.log("Seeding database...");

  const sources = [
    { name: "Engineering at Meta", url: "https://engineering.fb.com/" },
    { name: "Uber Engineering", url: "https://eng.uber.com/" },
    { name: "Canva Engineering", url: "https://canvatechblog.com/" },
    { name: "Google Research", url: "https://ai.googleblog.com/" },
    { name: "Spotify Engineering", url: "https://engineering.atspotify.com/" },
    { name: "Anthropic Engineering", url: "https://www.anthropic.com/engineering" },
    { name: "OpenAI Developers", url: "https://developers.openai.com/blog" },
    { name: "Netflix Tech Blog", url: "https://netflixtechblog.com/" },
  ];

  for (const s of sources) {
    const source = await prisma.source.upsert({
      where: { url: s.url },
      create: { name: s.name, url: s.url, active: true },
      update: {},
    });
    console.log(`Source: ${source.name} (${source.id})`);
  }

  console.log(`Created ${sources.length} sources`);

  const defaultTopics = [
    { name: "AI & Machine Learning", slug: "ai-machine-learning" },
    { name: "Infrastructure", slug: "infrastructure" },
    { name: "Security", slug: "security" },
    { name: "Data Engineering", slug: "data-engineering" },
    { name: "Mobile", slug: "mobile" },
    { name: "Web Development", slug: "web-development" },
    { name: "Open Source", slug: "open-source" },
    { name: "Production Engineering", slug: "production-engineering" },
    { name: "Video & Media", slug: "video-media" },
    { name: "Networking", slug: "networking" },
  ];

  for (const topic of defaultTopics) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      create: topic,
      update: {},
    });
  }

  console.log(`Created ${defaultTopics.length} default topics`);
  console.log("Seeding complete!");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
