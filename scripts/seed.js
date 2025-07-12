#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const { runSeed, defaultSeedConfig } = require("./seed-config");

const prisma = new PrismaClient();

async function main() {
  try {
    await runSeed(prisma, defaultSeedConfig);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { seed: main };
