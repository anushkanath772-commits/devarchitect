import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  // Delete articles with old broken Google URLs
  const google = await prisma.article.deleteMany({
    where: {
      OR: [
        { url: { contains: "blog.research.google" } },
        { url: { contains: "?m=1" } },
        { url: { contains: "ai.googleblog.com" } },
      ],
    },
  });
  console.log(`Deleted ${google.count} old Google articles`);

  // Delete old Uber articles that point to generic eng.uber.com
  const uber = await prisma.article.deleteMany({
    where: {
      source: { url: "https://eng.uber.com/" },
    },
  });
  console.log(`Deleted ${uber.count} old Uber articles`);

  // Delete old OpenAI articles (will be re-scraped with clean titles)
  const openai = await prisma.article.deleteMany({
    where: {
      source: { url: "https://developers.openai.com/blog" },
    },
  });
  console.log(`Deleted ${openai.count} old OpenAI articles`);

  // Delete old Canva articles
  const canva = await prisma.article.deleteMany({
    where: {
      source: { url: "https://canvatechblog.com/" },
    },
  });
  console.log(`Deleted ${canva.count} old Canva articles`);

  await prisma.$disconnect();
}

main();
