#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Setting up development database...\n");

// Check if .env.development exists
const envDevPath = path.join(__dirname, "..", ".env.development");
if (!fs.existsSync(envDevPath)) {
  console.error("❌ .env.development file not found!");
  console.log("Please create .env.development with the following content:");
  console.log("DATABASE_PROVIDER=sqlite");
  console.log('DATABASE_URL="file:./dev.db"');
  console.log("NODE_ENV=development");
  process.exit(1);
}

try {
  // Generate schema for development environment
  console.log("📝 Generating Prisma schema for development...");
  execSync("dotenv -e .env.development -- node scripts/generate-schema.js", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });

  // Generate Prisma client with development environment
  console.log("📦 Generating Prisma client for development...");
  execSync("dotenv -e .env.development -- prisma generate", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });

  // Push database schema to SQLite
  console.log("🗄️  Setting up SQLite database...");
  execSync("dotenv -e .env.development -- prisma db push", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });

  console.log("\n✅ Development database setup complete!");
  console.log("\n📋 Next steps:");
  console.log('1. Run "npm run dev" to start the development server');
  console.log('2. Use "npm run db:studio:dev" to open Prisma Studio');
  console.log("3. Your SQLite database is located at ./prisma/dev.db");
} catch (error) {
  console.error("❌ Error setting up development database:");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
