# FuelEU Maritime Compliance Platform

## Overview

A specialized dashboard for managing maritime GHG compliance, built with a focus on FuelEU Maritime Article 20 (Banking) and Article 21 (Pooling)

## Architecture

This project follows **Hexagonal Architecture (Ports & Adapters)** to ensure the core business logic is independent of the database (Prisma/PostgreSQL) and the UI (React/Vite)

- **Core**: Domain entities and use-cases
- **Ports**: Interfaces defining how the core interacts with the world
- **Adapters**: Concrete implementations (Express, Prisma, React)

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Vitest.
- **Backend**: Node.js, Express, Prisma, PostgreSQL.

## Setup & Run

1. **Database**:
   Ensure PostgreSQL is running.
2. **Backend**:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run seed
   npm run dev
   ```
3. **Frontend**:
   ```bash
    cd frontend
    npm install
    npm run dev
   ```

**Testing**:

**Frontend**:

```bash
 npm run test
```
