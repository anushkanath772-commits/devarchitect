import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const isTurso = process.env.TURSO_AUTH_TOKEN && process.env.TURSO_DATABASE_URL?.startsWith("libsql://");

export default defineConfig(
  isTurso
    ? {
        schema: path.join(__dirname, "prisma", "schema.prisma"),
        experimental: { adapter: true },
        engine: "js",
        adapter: async () =>
          new PrismaLibSql({
            url: process.env.TURSO_DATABASE_URL!,
            authToken: process.env.TURSO_AUTH_TOKEN!,
          }),
      }
    : {
        schema: path.join(__dirname, "prisma", "schema.prisma"),
        engine: "classic",
        datasource: {
          url: process.env.TURSO_DATABASE_URL ?? "file:./dev.db",
        },
      }
);
