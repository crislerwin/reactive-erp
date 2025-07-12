import { env } from "@/env.mjs";

/**
 * Helper function to prepare JSON data for tests based on the database provider
 * For SQLite, it converts objects/arrays to JSON strings
 * For MySQL, it returns the data as-is
 */
export function prepareJsonForTest<T>(data: T): string | T {
  if (env.DATABASE_PROVIDER === "sqlite") {
    return typeof data === "string" ? data : JSON.stringify(data);
  }
  return data;
}
