/**
 * Database helper utilities for handling JSON fields across different database providers
 * This module provides utilities to work with JSON data in both SQLite and MySQL environments
 */

import { env } from "@/env.mjs";

/**
 * Serializes a value to be stored in the database
 * For SQLite: converts objects to JSON strings
 * For MySQL: returns the value as-is (native JSON support)
 */
export function serializeForDb(value: unknown): unknown {
  if (value === null || value === undefined) {
    return null;
  }

  // For SQLite, convert objects to JSON strings
  if (env.DATABASE_PROVIDER === "sqlite") {
    return typeof value === "string" ? value : JSON.stringify(value);
  }

  // For MySQL, return as-is (native JSON support)
  return value;
}

/**
 * Deserializes a value retrieved from the database
 * For SQLite: parses JSON strings back to objects
 * For MySQL: returns the value as-is (already parsed)
 */
export function deserializeFromDb<T = unknown>(value: unknown): T | null {
  if (value === null || value === undefined) {
    return null;
  }

  // For SQLite, parse JSON strings
  if (env.DATABASE_PROVIDER === "sqlite" && typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      // If parsing fails, return the string as-is
      return value as T;
    }
  }

  // For MySQL or non-string values, return as-is
  return value as T;
}

/**
 * Safely handles JSON field updates for database operations
 */
export function prepareJsonField(value: unknown): unknown {
  return serializeForDb(value);
}

/**
 * Processes a database record to deserialize JSON fields
 * Use this when retrieving records that contain JSON fields
 */
export function processDbRecord<T extends Record<string, unknown>>(
  record: T,
  jsonFields: (keyof T)[]
): T {
  if (!record) return record;

  const processed = { ...record };

  for (const field of jsonFields) {
    if (field in processed) {
      processed[field] = deserializeFromDb(processed[field]) as T[keyof T];
    }
  }

  return processed;
}

/**
 * Processes multiple database records to deserialize JSON fields
 */
export function processDbRecords<T extends Record<string, unknown>>(
  records: T[],
  jsonFields: (keyof T)[]
): T[] {
  return records.map((record) => processDbRecord(record, jsonFields));
}

/**
 * Type-safe JSON field handling for specific models
 */
export const ModelHelpers = {
  /**
   * Processes Branch model records
   */
  processBranch: <T extends { attributes?: unknown }>(record: T): T => {
    return processDbRecord(record, ["attributes"]);
  },

  /**
   * Processes Product model records
   */
  processProduct: <T extends { colors?: unknown }>(record: T): T => {
    return processDbRecord(record, ["colors"]);
  },

  /**
   * Processes Invoice model records
   */
  processInvoice: <T extends { items?: unknown }>(record: T): T => {
    return processDbRecord(record, ["items"]);
  },

  /**
   * Prepares Branch data for database insertion/update
   */
  prepareBranch: <T extends { attributes?: unknown }>(data: T): T => {
    return {
      ...data,
      attributes: data.attributes ? prepareJsonField(data.attributes) : null,
    };
  },

  /**
   * Prepares Product data for database insertion/update
   */
  prepareProduct: <T extends { colors?: unknown }>(data: T): T => {
    return {
      ...data,
      colors: data.colors ? prepareJsonField(data.colors) : null,
    };
  },

  /**
   * Prepares Invoice data for database insertion/update
   */
  prepareInvoice: <T extends { items?: unknown }>(data: T): T => {
    return {
      ...data,
      items: data.items ? prepareJsonField(data.items) : null,
    };
  },
};

/**
 * Utility to check if the current database supports native JSON
 */
export function supportsNativeJson(): boolean {
  return env.DATABASE_PROVIDER === "mysql";
}

/**
 * Database provider information
 */
export const dbInfo = {
  provider: env.DATABASE_PROVIDER,
  supportsJson: supportsNativeJson(),
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
} as const;
