import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: process.env.SCHEMA_PATH ?? "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "bun run ./prisma/seed.ts",
  },
});
