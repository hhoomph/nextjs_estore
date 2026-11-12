import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: process.env.SCHEMA_PATH ?? "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "bun run ./prisma/seed.ts",
  },
});
