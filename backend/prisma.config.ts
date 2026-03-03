import { defineConfig } from "@prisma/config";

declare var process: any;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
