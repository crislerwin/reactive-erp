# Reactive ERP

[![.github/workflows/server.yml](https://github.com/crislerwin/health-ops/actions/workflows/server.yml/badge.svg?branch=main)](https://github.com/crislerwin/health-ops/actions/workflows/server.yml)

Welcome to **Reactive ERP**, a modern enterprise resource planning system designed for scalability and flexibility.

## Table of Contents
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

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

## Features

- **Real-time Data Sync**: Built with reactive programming for seamless data updates.
- **Modular Architecture**: Easily extendable with plugins and modules.
- **User-Friendly Interface**: Intuitive and responsive design.
- **Multi-Database Support**: SQLite for development, MySQL for production.
- **Environment-Specific Configuration**: Automatic database provider switching.
- **Type-Safe Database Operations**: Built with Prisma ORM and TypeScript.

## Installation

For detailed installation instructions, refer to the [INSTALLATION.md](INSTALLATION.md) file.

## Usage

To run the application in production mode:
```bash
npm run build
npm run serve
```

## Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on how to get started.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
