#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Generates the appropriate Prisma schema based on environment variables
 */
function generateSchema() {
  const environment = process.env.NODE_ENV || "development";
  const databaseProvider =
    process.env.DATABASE_PROVIDER ||
    (environment === "production" ? "mysql" : "sqlite");

  console.log(
    `📝 Generating Prisma schema for ${environment} environment with ${databaseProvider} provider...`
  );

  // Read the base schema template
  const baseSchemaPath = path.join(
    __dirname,
    "..",
    "prisma",
    "schema.base.prisma"
  );
  const outputSchemaPath = path.join(
    __dirname,
    "..",
    "prisma",
    "schema.prisma"
  );

  if (!fs.existsSync(baseSchemaPath)) {
    throw new Error(
      "Base schema template not found at prisma/schema.base.prisma"
    );
  }

  let schemaContent = fs.readFileSync(baseSchemaPath, "utf8");

  // Replace the placeholder with the actual provider
  schemaContent = schemaContent.replace(
    "{{DATABASE_PROVIDER}}",
    databaseProvider
  );

  // Apply provider-specific modifications if needed
  if (databaseProvider === "sqlite") {
    // SQLite doesn't support Json type, replace with TEXT
    schemaContent = schemaContent.replace(/Json\?/g, "String?");
    schemaContent = schemaContent.replace(/Json/g, "String");
    console.log("   ✓ Applied SQLite-specific configurations (Json -> String)");
  } else if (databaseProvider === "mysql") {
    // MySQL-specific modifications can go here if needed
    console.log("   ✓ Applied MySQL-specific configurations");
  }

  // Write the generated schema
  fs.writeFileSync(outputSchemaPath, schemaContent);

  console.log(`✅ Schema generated successfully at prisma/schema.prisma`);
  console.log(`   Provider: ${databaseProvider}`);
  console.log(`   Environment: ${environment}`);
}

// Handle command line execution
if (require.main === module) {
  try {
    generateSchema();
  } catch (error) {
    console.error("❌ Error generating schema:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

module.exports = { generateSchema };
