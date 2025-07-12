# Database Setup Guide

This project is configured to use different databases for different environments:
- **Development**: SQLite (file-based, no server required)
- **Production**: MySQL (server-based)

## Quick Start

### Development Environment

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up development database:**
   ```bash
   npm run dev:setup
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

The development database will be created as `dev.db` in your project root.

### Production Environment

1. **Set up your MySQL database server**

2. **Update `.env.production` with your MySQL connection string:**
   ```env
   DATABASE_PROVIDER=mysql
   DATABASE_URL="mysql://username:password@localhost:3306/reactive_erp"
   NODE_ENV=production
   ```

3. **Run migrations:**
   ```bash
   npm run db:migrate:prod
   ```

4. **Generate Prisma client:**
   ```bash
   npm run generate:prod
   ```

## Environment Configuration

### Development (.env.development)
```env
DATABASE_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
NODE_ENV=development
```

### Production (.env.production)
```env
DATABASE_PROVIDER=mysql
DATABASE_URL="mysql://username:password@host:port/database_name"
NODE_ENV=production
```

## Available Scripts

### Development
- `npm run dev:setup` - Set up development database (SQLite)
- `npm run db:push:dev` - Push schema changes to development database
- `npm run db:studio:dev` - Open Prisma Studio for development database
- `npm run generate:dev` - Generate Prisma client for development

### Production
- `npm run db:push:prod` - Push schema changes to production database
- `npm run db:migrate:prod` - Run production migrations
- `npm run db:studio:prod` - Open Prisma Studio for production database
- `npm run generate:prod` - Generate Prisma client for production

### General
- `npm run db:push` - Push schema changes (uses current environment)
- `npm run generate` - Generate Prisma client (uses current environment)
- `npm run db:studio` - Open Prisma Studio (uses current environment)

## Database Schema

The application uses the same Prisma schema for both databases. The main entities are:

- **Branch** - Store/branch information
- **Staff** - Employee management
- **Product** - Product catalog
- **ProductCategory** - Product categorization
- **Customer** - Customer information
- **Invoice** - Sales transactions

## Switching Between Environments

The database provider is automatically determined by the `DATABASE_PROVIDER` environment variable:

- `sqlite` - Uses SQLite (development)
- `mysql` - Uses MySQL (production)

## Troubleshooting

### Common Issues

1. **"Invalid environment variables" error**
   - Ensure your `.env.development` or `.env.production` file exists
   - Check that all required environment variables are set

2. **SQLite database locked**
   - Close any open Prisma Studio instances
   - Restart your development server

3. **MySQL connection issues**
   - Verify your MySQL server is running
   - Check connection string format
   - Ensure database exists

4. **Schema differences between environments**
   - SQLite and MySQL have some differences in data types
   - The schema is designed to be compatible with both
   - Use `relationMode = "prisma"` for compatibility

### Resetting Development Database

To reset your development database:

```bash
# Remove existing database
rm dev.db

# Set up fresh database
npm run dev:setup
```

### Migration Workflow

For schema changes:

1. **Development:**
   ```bash
   npm run db:push:dev
   ```

2. **Production:**
   ```bash
   npm run db:migrate:prod
   ```

## Security Notes

- Never commit `.env.development` or `.env.production` to version control
- Use strong passwords for production MySQL databases
- Consider using connection pooling for production environments
- Regularly backup production databases

## Performance Considerations

### SQLite (Development)
- Single-user, file-based
- Perfect for development and testing
- Automatic setup, no server required

### MySQL (Production)
- Multi-user, server-based
- Better performance for concurrent users
- Supports advanced features like full-text search
- Requires proper indexing and query optimization

## File Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── dev.db                 # SQLite database (git-ignored)
├── scripts/
│   └── setup-dev-db.js        # Development setup script
├── .env.development           # Development environment (git-ignored)
├── .env.production           # Production environment (git-ignored)
└── docs/
    └── DATABASE_SETUP.md     # This file
```
