# E-Commerce Platform

A full-stack e-commerce application built with **Next.js**, **NestJS**, and **PostgreSQL**.

## Tech Stack

| Layer       | Technology                              |
| ----------- | --------------------------------------- |
| Frontend    | Next.js 15 (App Router, TypeScript, Tailwind CSS) |
| Backend API | NestJS (TypeScript, REST API)           |
| Database    | PostgreSQL + TypeORM                    |
| Auth        | JWT + Passport                          |
| API Docs    | Swagger (`/api/docs`)                   |

## Project Structure

```
e-com/
├── frontend/    # Next.js app (port 3000)
├── backend/     # NestJS API (port 3001)
├── package.json # Root workspace scripts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL running locally (or via Docker)
- npm

### 1. Clone and Install

```bash
# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your API URL
```

### 3. Run Database Migrations

```bash
cd backend
npm run migration:run
```

### 4. Seed Database (Optional)

```bash
cd backend
npm run seed
```

### 5. Start Development Servers

```bash
# From root — start backend
npm run dev:backend

# In another terminal — start frontend
npm run dev:frontend
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api/docs

## Default Admin Account

After seeding:
- Email: `admin@example.com`
- Password: `admin123`
