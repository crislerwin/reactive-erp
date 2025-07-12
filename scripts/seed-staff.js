#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const path = require("path");

const prisma = new PrismaClient();

async function seedStaff() {
  console.log("🌱 Starting staff seeding...\n");

  try {
    // First, check if the email already exists
    const existingStaff = await prisma.staff.findUnique({
      where: { email: "crislerwintler@gmail.com" },
    });

    if (existingStaff) {
      console.log(
        "ℹ️  Staff member with email crislerwintler@gmail.com already exists"
      );
      console.log(`   ID: ${existingStaff.id}`);
      console.log(
        `   Name: ${existingStaff.first_name} ${existingStaff.last_name || ""}`
      );
      console.log(`   Role: ${existingStaff.role}`);
      console.log(`   Branch ID: ${existingStaff.branch_id}`);
      return;
    }

    // Check if there are any branches, create one if none exist
    let branch = await prisma.branch.findFirst();

    if (!branch) {
      console.log("📍 No branches found, creating default branch...");
      branch = await prisma.branch.create({
        data: {
          name: "Main Branch",
          attributes: "Default branch created by seeding script",
        },
      });
      console.log(
        `✅ Created branch: ${branch.name} (ID: ${branch.branch_id})\n`
      );
    } else {
      console.log(
        `📍 Using existing branch: ${branch.name} (ID: ${branch.branch_id})\n`
      );
    }

    // Create the staff member
    console.log("👤 Creating staff member...");
    const staffMember = await prisma.staff.create({
      data: {
        branch_id: branch.branch_id,
        first_name: "Crisler",
        last_name: "Wintler",
        email: "crislerwintler@gmail.com",
        role: "ADMIN",
        active: true,
      },
    });

    console.log("✅ Staff member created successfully!");
    console.log(`   ID: ${staffMember.id}`);
    console.log(`   Name: ${staffMember.first_name} ${staffMember.last_name}`);
    console.log(`   Email: ${staffMember.email}`);
    console.log(`   Role: ${staffMember.role}`);
    console.log(`   Branch ID: ${staffMember.branch_id}`);
    console.log(`   Active: ${staffMember.active}`);
    console.log(`   Created: ${staffMember.created_at}\n`);

    console.log("🎉 Staff seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during staff seeding:");

    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      console.error("   Email address already exists in the database");
    } else if (error.code === "P2003") {
      console.error("   Foreign key constraint failed - invalid branch_id");
    } else {
      console.error(`   ${error.message}`);
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedStaff();
}

module.exports = { seedStaff };
