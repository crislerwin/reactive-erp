const { PrismaClient } = require("@prisma/client");

const defaultSeedConfig = {
  branches: [
    {
      name: "Main Branch",
      attributes: "Primary business location",
    },
  ],
  staff: [
    {
      first_name: "Crisler",
      last_name: "Wintler",
      email: "crislerwintler@gmail.com",
      role: "ADMIN",
      active: true,
    },
  ],
  skipExisting: true,
  verbose: true,
};

async function seedBranches(prisma, branches, options) {
  const results = [];

  for (const branchData of branches) {
    try {
      if (options.skipExisting) {
        const existing = await prisma.branch.findFirst({
          where: { name: branchData.name },
        });

        if (existing) {
          if (options.verbose) {
            console.log(
              `ℹ️  Branch "${branchData.name}" already exists (ID: ${existing.branch_id})`
            );
          }
          results.push(existing);
          continue;
        }
      }

      const branch = await prisma.branch.create({
        data: branchData,
      });

      if (options.verbose) {
        console.log(
          `✅ Created branch: ${branch.name} (ID: ${branch.branch_id})`
        );
      }

      results.push(branch);
    } catch (error) {
      console.error(
        `❌ Failed to create branch "${branchData.name}":`,
        error.message
      );
      throw error;
    }
  }

  return results;
}

async function seedStaffMembers(prisma, staffData, branchId, options) {
  const results = [];

  for (const staff of staffData) {
    try {
      if (options.skipExisting) {
        const existing = await prisma.staff.findUnique({
          where: { email: staff.email },
        });

        if (existing) {
          if (options.verbose) {
            console.log(
              `ℹ️  Staff member "${staff.email}" already exists (ID: ${existing.id})`
            );
          }
          results.push(existing);
          continue;
        }
      }

      const staffMember = await prisma.staff.create({
        data: {
          ...staff,
          branch_id: branchId,
          active: staff.active !== undefined ? staff.active : true,
        },
      });

      if (options.verbose) {
        console.log(
          `✅ Created staff member: ${staffMember.first_name} ${
            staffMember.last_name || ""
          } (${staffMember.email})`
        );
      }

      results.push(staffMember);
    } catch (error) {
      if (error.code === "P2002" && error.meta?.target?.includes("email")) {
        console.error(`❌ Email "${staff.email}" already exists`);
      } else {
        console.error(
          `❌ Failed to create staff member "${staff.email}":`,
          error.message
        );
      }
      throw error;
    }
  }

  return results;
}

async function runSeed(prisma, config = defaultSeedConfig) {
  console.log("🌱 Starting database seeding...\n");

  try {
    // Seed branches
    if (config.verbose) {
      console.log("📍 Seeding branches...");
    }
    const branches = await seedBranches(prisma, config.branches, {
      skipExisting: config.skipExisting,
      verbose: config.verbose,
    });

    if (branches.length === 0) {
      throw new Error("No branches available for staff assignment");
    }

    // Use the first branch for staff assignment
    const primaryBranch = branches[0];

    if (config.verbose) {
      console.log(
        `\n👤 Seeding staff members to branch: ${primaryBranch.name}...`
      );
    }

    // Seed staff members
    await seedStaffMembers(prisma, config.staff, primaryBranch.branch_id, {
      skipExisting: config.skipExisting,
      verbose: config.verbose,
    });

    console.log("\n🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("\n❌ Seeding failed:", error.message);
    throw error;
  }
}

module.exports = {
  defaultSeedConfig,
  seedBranches,
  seedStaffMembers,
  runSeed,
};
