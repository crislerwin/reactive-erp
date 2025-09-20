/**
 * Test setup file - runs before each test file
 * Configures the test environment for isolated testing
 */

import fs from "fs";
import path from "path";

// Load .env.test file if it exists
const envTestPath = path.resolve(process.cwd(), ".env.test");
if (fs.existsSync(envTestPath)) {
  const envContent = fs.readFileSync(envTestPath, "utf8");
  const envLines = envContent
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#"));

  for (const line of envLines) {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").replace(/^["']|["']$/g, ""); // Remove quotes
      process.env[key.trim()] = value.trim();
    }
  }
}

// Ensure we're in test mode
process.env.NODE_ENV = "test";

// Force PostgreSQL for tests - use environment variables for credentials
process.env.DATABASE_PROVIDER = "postgres";

// Set defaults if not already set
if (!process.env.POSTGRES_DB) process.env.POSTGRES_DB = "reactive-app-staging";
if (!process.env.POSTGRES_USER) process.env.POSTGRES_USER = "nocodb";
if (!process.env.POSTGRES_PASSWORD) process.env.POSTGRES_PASSWORD = "";

// Expand DATABASE_URL variables if needed
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("${")) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
    /\$\{POSTGRES_USER\}/g,
    process.env.POSTGRES_USER || ""
  )
    .replace(/\$\{POSTGRES_PASSWORD\}/g, process.env.POSTGRES_PASSWORD || "")
    .replace(/\$\{POSTGRES_DB\}/g, process.env.POSTGRES_DB || "");
} else if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:5433/${process.env.POSTGRES_DB}`;
}

// Set test credentials
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "test_key";
process.env.CLERK_SECRET_KEY = "test_secret";

console.log("🧪 Test environment loaded:", {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_PROVIDER: process.env.DATABASE_PROVIDER,
  DATABASE_URL: process.env.DATABASE_URL?.replace(/:[^:]*@/, ":****@"), // Hide password
});
