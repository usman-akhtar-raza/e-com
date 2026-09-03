# ShopHub — Enterprise Production-Ready E-Commerce Platform

A scalable, full-stack, monorepo e-commerce platform built with NestJS, Next.js 16 (App Router), TypeORM, PostgreSQL, Tailwind CSS, and TypeScript.

---

## 🚀 Key Features & Capabilities

### 🛍️ Storefront & Customer Shopping Experience
- **Interactive Product Catalog**: Advanced filtering by Category, Brand, Price Range, and Sort Order (Newest, Price Low/High, Name A-Z).
- **Product Detail Pages**: Multi-image thumbnail gallery, stock availability badges, variant selection, quantity modifiers, and related products grid.
- **Reviews & Ratings System**: Verified purchase auto-detection via customer order history, 1 to 5 star rating distribution summaries, and customer review submission modal.
- **Wishlist & Saved Items**: Customer wishlist toggle, dedicated wishlist management page (`/account/wishlist`), and instant saved item badges.
- **Cart & Real-Time Coupons**: Server-side coupon validation (`SAVE10`, `FLAT50`), line item quantity controls, subtotal, discount, tax, estimated shipping, and total calculations.
- **Checkout Engine**: Saved address book selection or custom entry, payment method options (Credit/Debit Card, Cash on Delivery), and instant redirection to Order Confirmation (`/checkout/success/[orderId]`).

### 📊 Admin Operations & Analytics Portal (`/admin`)
- **Dashboard KPIs**: Total Revenue, Total Orders, Active Customers, Low Stock Alerts, and Pending Orders count.
- **Sales Analytics**: Time-series revenue trend breakdown over 30 days.
- **Inventory Control (`/admin/inventory`)**: Critical low-stock threshold alerts and inline stock adjustment controls.
- **Catalog Management (`/admin/products`, `/admin/categories`, `/admin/brands`)**: Complete datatables with add, edit, and delete controls.
- **Coupons Management (`/admin/coupons`)**: Create and manage percentage or fixed promotional coupons with usage limits and minimum order rules.
- **Review Moderation (`/admin/reviews`)**: Moderate customer reviews with Approve, Reject, or Delete actions.

### ⚡ Performance, SEO & Infrastructure Polish
- **Database Indexing**: TypeORM indexes on `Product.slug`, `Product.categoryId`, `Product.brandId`, `Order.userId`, `Order.orderNumber`, and `Review.productId`.
- **Dynamic XML Sitemap & Robots**: `sitemap.ts` and `robots.ts` generating real-time XML entries for search engine crawlers.
- **Google Rich Snippets**: `schema.org/Product` JSON-LD Structured Data embedded on product detail pages.
- **Image Optimization**: Configured Next.js `remotePatterns` for optimized image rendering.
- **Fallback UI**: Custom 404 (`not-found.tsx`), Error Boundary (`error.tsx`), and animated `Skeleton` UI components.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Port**: `http://localhost:3001`

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL (Docker container `ecom-postgres` on port `5433`)
- **ORM**: TypeORM
- **Auth**: JWT & Passport
- **Documentation**: Swagger OpenAPI at `http://localhost:3002/api/docs`
- **Port**: `http://localhost:3002/api`

---

## ⚙️ Environment Configuration

### Backend Setup (`backend/.env`)
```env
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ecom
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d
PORT=3002
```

### Frontend Setup (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

---

## 🚥 Quick Start & Local Running

### 1. Start PostgreSQL Database
```bash
docker run -d --name ecom-postgres -p 5433:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ecom postgres:15
```

### 2. Install Dependencies & Seed Database
```bash
# Backend
cd backend
npm install
npm run seed

# Frontend
cd ../frontend
npm install
```

### 3. Run Development Servers
```bash
# Start Backend API (Port 3002)
cd backend
npm run start:dev

# Start Frontend App (Port 3001)
cd frontend
npm run dev
```

---

## 🧪 Testing & Verification

### Unit Testing
```bash
cd backend
npm test
```
*Result: 15 test suites, 98 unit tests passing cleanly.*

### Type-Checking
```bash
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
```

### Production Build Verification
```bash
# Backend Build
cd backend && npm run build

# Frontend Build
cd frontend && npm run build
```

---

## 🔐 Credentials for Testing

- **Admin Account**: `admin@example.com` / `admin123`
- **Customer Account**: `customer@example.com` / `customer123`
- **Sample Coupons**: `SAVE10` (10% OFF), `FLAT50` ($50 OFF)
