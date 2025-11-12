import { PrismaClient } from "@prisma/client";

const defaultProvider = process.env.DATABASE_PROVIDER ?? "sqlite";
const defaultUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

if (!process.env.DATABASE_PROVIDER) {
  process.env.DATABASE_PROVIDER = defaultProvider;
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultUrl;
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
