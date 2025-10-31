# Reactive ERP

[![.github/workflows/server.yml](https://github.com/crislerwin/health-ops/actions/workflows/server.yml/badge.svg?branch=main)](https://github.com/crislerwin/health-ops/actions/workflows/server.yml)

A modern, full-stack Enterprise Resource Planning (ERP) system built with Next.js, tRPC, and Prisma. Reactive ERP provides comprehensive business management capabilities including staff management, customer relations, product catalog, invoicing, and advanced reporting with a beautiful, responsive UI.

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Authentication](#authentication)
- [Development](#development)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

Reactive ERP is a production-ready enterprise resource planning system designed for small to medium-sized businesses. It features:

- **Multi-Branch Support**: Manage multiple business locations with branch-level data isolation
- **Role-Based Access Control**: Comprehensive permission system (OWNER, ADMIN, MANAGER, EMPLOYEE)
- **Type-Safe API**: Full TypeScript coverage with tRPC for end-to-end type safety
- **Modern UI**: Built with Mantine UI, featuring dark/light themes and responsive design
- **Advanced Reporting**: Real-time analytics and business intelligence
- **Multi-Database Support**: SQLite for development, MySQL for production
- **Internationalized**: Portuguese (Brazil) localization with support for multiple languages

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript 5** - Type-safe development
- **Mantine UI v6** - Component library with theming
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Form management with validation
- **Recharts** - Data visualization
- **Tabler Icons** - Icon library

### Backend
- **tRPC v10** - Type-safe API layer
- **Prisma v5** - Modern ORM with schema management
- **Zod** - Runtime type validation
- **SuperJSON** - Complex data serialization
- **SQLite/MySQL** - Multi-database support

### Authentication & Authorization
- **Clerk** - Complete authentication solution
- **Role-Based Access Control** - Custom permission system
- **Protected Routes** - Middleware-based route protection

### Development & Testing
- **Vitest** - Fast unit testing
- **Playwright** - End-to-end testing
- **Storybook** - Component documentation
- **ESLint & Prettier** - Code quality
- **Husky** - Git hooks

## Getting Started

To get started with Reactive ERP, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/crislerwin/reactive-erp.git
   ```

2. Navigate to the project directory:
   ```bash
   cd reactive-erp
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Set up the development database:
   ```bash
   npm run dev:setup
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Database Setup

This project uses different database providers for different environments:

- **Development**: SQLite (file-based, no server required)
- **Production**: MySQL (server-based)

### Quick Development Setup

```bash
# Install dependencies
pnpm install

# Set up development database (SQLite)
npm run dev:setup

# Start development server
npm run dev
```

### Production Setup

1. Set up your MySQL database server
2. Update `.env.production` with your connection details:
   ```env
   DATABASE_PROVIDER=mysql
   DATABASE_URL="mysql://username:password@localhost:3306/reactive_erp"
   NODE_ENV=production
   ```
3. Run production migrations:
   ```bash
   npm run db:migrate:prod
   ```

### Available Database Scripts

- `npm run dev:setup` - Set up development database (SQLite)
- `npm run db:studio:dev` - Open Prisma Studio for development
- `npm run db:studio:prod` - Open Prisma Studio for production
- `npm run schema:dev` - Generate development schema (SQLite)
- `npm run schema:prod` - Generate production schema (MySQL)

For detailed database setup instructions, see [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md).

## Authentication

Reactive ERP uses [Clerk](https://clerk.com) for authentication and user management.

### Setup

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application in the Clerk Dashboard
3. Copy your API keys and add them to `.env`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   ```
4. Configure Clerk URLs in `.env`:
   ```env
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   ```

### User Roles

- **OWNER**: Full system access, can manage all branches and users
- **ADMIN**: Administrative access to branch operations
- **MANAGER**: Can manage customers, products, and invoices
- **EMPLOYEE**: Limited access to assigned tasks

### Route Protection

All routes except `/sign-in` and `/sign-up` are protected by middleware. Unauthenticated users are automatically redirected to the sign-in page.

## Features

### Core Business Modules

#### Staff Management
- Complete CRUD operations for staff members
- Role-based permissions (OWNER, ADMIN, MANAGER, EMPLOYEE)
- Branch assignment and management
- Soft delete with deactivation
- Email-based authentication integration

#### Customer Management
- Customer database with contact information
- Automatic customer code generation
- Branch-specific customer access
- Soft delete support
- Activity tracking for analytics

#### Product Catalog
- Product inventory management
- Category organization
- Price management with BRL currency formatting
- Color variant support
- Stock level tracking
- Availability status management

#### Invoice System
- Sales and purchase invoice creation
- Multi-item invoices with product quantities
- Invoice status workflow (draft, pending, paid, canceled)
- Expiration date management
- Staff and customer assignment
- Automatic total calculation

#### Advanced Reporting
- Revenue and sales analytics
- Date-range filtering (day/week/month)
- New customer acquisition tracking
- Branch-specific reports
- Sales volume metrics
- Time-series data visualization

#### Branch Management
- Multi-location support
- Branch attributes with JSON metadata
- Branch-level data isolation
- Cascading delete protection

### User Interface Features

- **Dark/Light Theme**: Persistent theme switching with cookie storage
- **Command Palette**: Quick navigation and search (Cmd+K / Ctrl+K)
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Sidebar Navigation**: Collapsible menu with role-based item visibility
- **CRUD Tables**: Advanced data tables with inline editing and sorting
- **Smart Forms**: Dynamic forms with validation and error handling
- **Modal System**: Confirmation dialogs and data entry modals
- **Data Visualization**: Interactive charts for business analytics
- **Toast Notifications**: User-friendly feedback system

### Technical Features

- **Type-Safe APIs**: Full TypeScript with tRPC for compile-time safety
- **Automatic API Documentation**: OpenAPI specification generation
- **Query Optimization**: React Query caching and synchronization
- **Soft Deletes**: Audit trail with logical deletion
- **Multi-Database**: Environment-specific database providers
- **Schema Generation**: Dynamic Prisma schema for SQLite/MySQL
- **Session Management**: Secure authentication with Clerk
- **Error Handling**: Translated error messages with user-friendly display
- **Internationalization**: Portuguese (Brazil) with extensible i18n
- **Git Hooks**: Pre-commit validation with Husky and lint-staged

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:setup        # Initialize development database

# Building
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:studio:dev   # Open Prisma Studio (development)
npm run db:studio:prod  # Open Prisma Studio (production)
npm run schema:dev      # Generate development schema
npm run schema:prod     # Generate production schema

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm run typecheck       # Run TypeScript compiler check

# Testing
npm run test            # Run unit tests with Vitest
npm run test:e2e        # Run end-to-end tests with Playwright
npm run storybook       # Start Storybook for component development
```

### Project Structure

```
reactive-erp/
├── prisma/                 # Database schema and migrations
│   ├── schema.base.prisma # Base schema template
│   └── schema.prisma      # Generated schema
├── public/                # Static assets
├── scripts/               # Utility scripts
│   ├── generate-schema.js # Dynamic schema generator
│   └── setup-dev-db.js   # Database initialization
├── src/
│   ├── pages/            # Next.js pages and API routes
│   ├── components/       # React components
│   ├── design-system/    # Custom design system components
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/ # tRPC routers (business logic)
│   │   │   ├── auth/    # Authentication & permissions
│   │   │   ├── trpc.ts  # tRPC configuration
│   │   │   └── root.ts  # Main API router
│   │   └── db.ts        # Prisma client
│   ├── common/
│   │   ├── schemas/     # Zod validation schemas
│   │   ├── constants/   # App constants
│   │   └── errors/      # Custom error types
│   ├── lib/             # Utility functions
│   ├── services/        # External service integrations
│   └── styles/          # Global styles
└── __tests__/           # Test files
```

## Testing

### Unit Tests

Run unit tests with Vitest:

```bash
npm run test
```

Tests are located in `__tests__` directories throughout the codebase. The project includes tests for:
- tRPC routers (staff, customer, product, branch, invoice)
- Business logic
- Utility functions

### End-to-End Tests

Run E2E tests with Playwright:

```bash
npm run test:e2e
```

### Component Testing

Run Storybook for component development and testing:

```bash
npm run storybook
```

## API Documentation

Reactive ERP uses tRPC for type-safe API communication. The API is organized into the following routers:

### Available Routers

- **staff**: Staff member management
  - `create`, `update`, `delete`, `getById`, `report`
- **customer**: Customer management
  - `create`, `update`, `delete`, `getAll`
- **product**: Product catalog management
  - `create`, `update`, `delete`, `getAll`
- **productCategory**: Product category management
  - `create`, `update`, `delete`, `getAll`
- **invoice**: Invoice management
  - `create`, `update`, `delete`, `getAll`
- **branch**: Branch management
  - `create`, `update`, `delete`, `getAll`
- **report**: Business analytics and reporting
  - `getReport` (aggregated metrics with date filtering)

### OpenAPI Documentation

The API automatically generates OpenAPI documentation. Access it at:
```
http://localhost:3000/api/docs
```

### Example API Usage

```typescript
// Client-side API call using tRPC
import { api } from '~/utils/api';

// Create a customer
const createCustomer = api.customer.create.useMutation();

await createCustomer.mutateAsync({
  first_name: 'João',
  last_name: 'Silva',
  email: 'joao@example.com',
  phone: '+55 11 98765-4321',
  branch_id: 1,
  customer_code: 'CUST001'
});

// Fetch all products
const { data: products } = api.product.getAll.useQuery();
```

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and ensure tests pass
4. Run linting and formatting:
   ```bash
   npm run lint
   npm run format
   ```
5. Commit your changes with a descriptive message
6. Push to your fork and submit a pull request

### Development Guidelines

- Follow the existing code style and conventions
- Write unit tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting
- Keep commits focused and atomic

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Screenshots

### Dashboard
Modern, responsive dashboard with dark mode support and real-time analytics.

### Product Management
Comprehensive product catalog with inventory tracking and category organization.

### Invoice System
Create and manage sales and purchase invoices with multi-item support.

### Advanced Reporting
Business intelligence with customizable date ranges and visual analytics.

---

**Built with by [Crisler Wintler](https://github.com/crislerwin)**
