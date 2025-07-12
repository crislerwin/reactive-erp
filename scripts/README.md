# Database Seeding Scripts

This directory contains scripts for seeding the database with initial data for the Reactive ERP system.

## Overview

The seeding system is designed to populate your database with essential data like branches, staff members, and other required entities. All scripts are built with safety in mind - they check for existing data before creating new records.

## Available Scripts

### Main Seeding Commands

```bash
# Seed with development environment
npm run seed:dev

# Seed with production environment
npm run seed:prod

# Quick seed (uses current environment)
npm run seed
```

### Staff-Specific Seeding

```bash
# Seed staff members for development
npm run seed:staff:dev

# Seed staff members for production
npm run seed:staff:prod

# Quick staff seed (uses current environment)
npm run seed:staff
```

## What Gets Seeded

### Default Configuration

The seeding process will create:

1. **Main Branch**
   - Name: "Main Branch"
   - Attributes: "Primary business location"

2. **Staff Member**
   - Name: Crisler Wintler
   - Email: crislerwintler@gmail.com
   - Role: ADMIN
   - Status: Active

### Safety Features

- **Duplicate Prevention**: Scripts check for existing records before creating new ones
- **Foreign Key Handling**: Automatically creates required parent records (like branches)
- **Error Handling**: Detailed error messages with specific failure reasons
- **Rollback Safety**: Uses transactions where possible to prevent partial updates

## Customizing Seeds

### Modifying Default Data

Edit `scripts/seed-config.ts` to customize what data gets seeded:

```typescript
export const defaultSeedConfig: SeedConfig = {
  branches: [
    {
      name: "Your Branch Name",
      attributes: "Branch description",
    },
  ],
  staff: [
    {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@company.com",
      role: "ADMIN", // OWNER | ADMIN | MANAGER | EMPLOYEE
      active: true,
    },
  ],
  skipExisting: true,
  verbose: true,
};
```

### Adding More Staff Members

You can add multiple staff members to the `staff` array in the configuration:

```typescript
staff: [
  {
    first_name: "Crisler",
    last_name: "Wintler",
    email: "crislerwintler@gmail.com",
    role: "ADMIN",
    active: true,
  },
  {
    first_name: "Jane",
    last_name: "Smith",
    email: "jane.smith@company.com",
    role: "MANAGER",
    active: true,
  },
  // Add more staff members here...
],
```

## File Structure

```
scripts/
├── README.md              # This file
├── seed.ts                # Main seeding script
├── seed-staff.ts          # Staff-specific seeding script
├── seed-config.ts         # Seeding configuration and utilities
├── setup-dev-db.js        # Development database setup
└── generate-schema.js     # Schema generation script
```

## Environment Setup

Make sure you have the appropriate environment files:

- `.env.development` - For development seeding
- `.env.production` - For production seeding

The scripts use `dotenv-cli` to load the correct environment variables.

## Requirements

- Node.js with TypeScript support
- Prisma Client generated (`npm run generate`)
- Database connection configured in environment files

## Troubleshooting

### Common Issues

1. **"Email already exists"**
   - This is expected behavior if you run the script multiple times
   - The script will skip existing records safely

2. **"Foreign key constraint failed"**
   - Usually means a required branch doesn't exist
   - The script automatically creates branches if none exist

3. **"Database connection failed"**
   - Check your environment files (.env.development/.env.production)
   - Ensure DATABASE_URL is correctly set
   - Run `npm run db:push:dev` to ensure database schema is up to date

### Getting Help

If you encounter issues:

1. Check that your database schema is up to date: `npm run db:push:dev`
2. Verify environment variables are set correctly
3. Run with verbose output to see detailed progress
4. Check the database directly with: `npm run db:studio:dev`

## Security Notes

- Never commit real production credentials to version control
- Use environment variables for sensitive configuration
- Review seeded data before running in production environments
- Consider using different email domains for different environments
