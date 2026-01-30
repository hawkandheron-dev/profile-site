import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

type PrismaGlobal = typeof globalThis & {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as PrismaGlobal;

const createClient = () => {
  const databaseUrl =
    process.env.DATABASE_URL ??
    `file:${resolve(process.cwd(), "prisma", "dev.db")}`;
  const databasePath = databaseUrl.replace(/^file:/, "");
  const adapter = new PrismaBetterSqlite3({ url: databasePath });

  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
