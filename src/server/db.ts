import { PrismaClient } from "@prisma/client";
import { env } from "@/env.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Helper functions for JSON handling with SQLite
const serializeJson = (value: unknown): string => {
  return typeof value === "string" ? value : JSON.stringify(value);
};

const parseJson = (value: string | null): unknown => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value; // Return as-is if not valid JSON
  }
};

// Database configuration based on environment
const getDatabaseConfig = () => {
  const baseConfig = {
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  } as const;

  // SQLite-specific configuration for development
  if (env.DATABASE_PROVIDER === "sqlite") {
    console.log("Using SQLite configuration");
    return {
      ...baseConfig,
      datasources: {
        db: {
          url: env.DATABASE_URL,
        },
      },
    };
  }

  // MySQL configuration for production (default)
  console.log("Using MySQL configuration");
  return {
    ...baseConfig,
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  };
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient(getDatabaseConfig());

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Export JSON helpers for use in the application
export { serializeJson, parseJson };
