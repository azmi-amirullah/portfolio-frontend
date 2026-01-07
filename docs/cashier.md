# Cashier Module - Technical Documentation

**Last Updated:** 2026-01-07  
**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Models](#data-models)
4. [Service Layer](#service-layer)
5. [Hooks](#hooks)
6. [Pages](#pages)
7. [Components](#components)
8. [Design System](#design-system)

---

## Overview

The Cashier module is a full-featured Point of Sale (POS) system with:

- **Sales Processing** - Barcode scanning, cart management, payment processing
- **Inventory Management** - Product CRUD, stock batches with expiration tracking
- **Sales History** - Transaction logs with profit calculation
- **Local Caching** - localStorage cache to reduce API calls
- **Serverless Backend** - Supabase for database and authentication

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App Router                      │
├─────────────────────────────────────────────────────────────┤
│  /cashier                                                    │
│  ├─ page.tsx (Login)                                         │
│  ├─ layout.tsx + CashierLayoutClient.tsx                     │
│  ├─ /pos/page.tsx                                            │
│  ├─ /inventory/page.tsx                                      │
│  ├─ /history/page.tsx                                        │
│  └─ /dashboard/page.tsx                                      │
├─────────────────────────────────────────────────────────────┤
│                     Component Layer                          │
│  ├─ Layout: MobileHeader, DesktopSidebar, BottomNav          │
│  ├─ POS: ProductSearchDropdown, PaymentModal, BarcodeScanner │
│  ├─ Inventory: ProductForm, ExpirationManager, Table         │
│  └─ Shared: Modal, Button, Loading                           │
├─────────────────────────────────────────────────────────────┤
│                       Hooks Layer                            │
│  ├─ useCart (cart state management)                          │
│  └─ useInventory (product list + CRUD state)                 │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                           │
│  ├─ cashierService (data operations + Supabase sync)         │
│  └─ authService (Supabase authentication)                    │
├─────────────────────────────────────────────────────────────┤
│                     Supabase Layer                           │
│  ├─ lib/supabase/client.ts (browser client)                  │
│  ├─ lib/supabase/server.ts (server client)                   │
│  └─ lib/supabase/middleware.ts (session refresh)             │
├─────────────────────────────────────────────────────────────┤
│                        Storage                               │
│  ├─ localStorage (offline cache, user-scoped)                │
│  └─ Supabase PostgreSQL (source of truth)                    │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision                  | Rationale                                                  |
| ------------------------- | ---------------------------------------------------------- |
| **Supabase Backend**      | Serverless PostgreSQL with built-in auth and RLS           |
| **Cookie-based Sessions** | More secure than localStorage JWT, works with SSR          |
| **Local Caching**         | localStorage caches data to reduce API calls on page loads |
| **Row Level Security**    | User data isolation enforced at database level             |
| **One-Way Sync**          | Sync pulls BE → FE; no offline queue                       |
| **User-Scoped Storage**   | Each user has isolated localStorage data                   |
| **Mobile-First**          | Primary use case is mobile/tablet at checkout              |

---

## Database Schema

### Products Table

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  barcode TEXT,
  price DECIMAL(10,2) NOT NULL,
  buy_price DECIMAL(10,2),  -- nullable
  sold INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_edit_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);
```

### Stock Batches Table

```sql
CREATE TABLE stock_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expiration_date DATE,
  added_date TIMESTAMPTZ DEFAULT NOW(),
  quantity INTEGER NOT NULL,
  is_sold_out BOOLEAN DEFAULT FALSE
);
```

### Transactions Table

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  total_amount DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  change DECIMAL(10,2) NOT NULL
);
```

### Transaction Items Table

```sql
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_barcode TEXT,
  price DECIMAL(10,2) NOT NULL,
  buy_price DECIMAL(10,2),  -- nullable
  quantity INTEGER NOT NULL
);
```

### Row Level Security

All tables have RLS enabled with policies ensuring users can only access their own data:

```sql
CREATE POLICY "Users can CRUD own data" ON [table]
  FOR ALL USING (auth.uid() = user_id);
```

---

## Data Models

### Product

```typescript
interface Product {
  id: string; // Product name as ID
  barcode: string; // Scannable barcode
  name: string; // Display name
  price: number; // Sell price (required)
  buyPrice: number; // Cost price (optional)
  sold?: number; // Total units sold
  stock?: StockBatch[];
  createdAt?: string; // ISO timestamp
  lastEditAt?: string; // ISO timestamp
}
```

### StockBatch

```typescript
interface StockBatch {
  productId: string;
  expirationDate: string; // YYYY-MM-DD
  addedDate: string; // ISO timestamp (unique ID)
  quantity: number;
  isSoldOut: boolean; // Manual override
}
```

### Transaction

```typescript
interface Transaction {
  id: string; // Timestamp as string
  timestamp: number;
  products: {
    productId: string;
    productName: string;
    productBarcode: string;
    price: number;
    buyPrice: number;
    quantity: number;
  }[];
  totalAmount: number;
  amountPaid: number;
  change: number;
}
```

---

## Service Layer

### AuthService

**Location:** `lib/services/auth-service.ts`

Handles Supabase authentication with cookie-based sessions.

| Method              | Purpose                                                              |
| ------------------- | -------------------------------------------------------------------- |
| `login()`           | Sign in with email/password (username auto-converts to @guest.local) |
| `logout()`          | Sign out and clear session                                           |
| `getUser()`         | Get current authenticated user                                       |
| `isAuthenticated()` | Check if user has active session                                     |

### CashierService

**Location:** `lib/services/cashier-service.ts`

Handles all data operations with Supabase and localStorage caching.

| Method                   | Purpose                                        |
| ------------------------ | ---------------------------------------------- |
| `syncWithBackend()`      | Fetch products from Supabase and cache locally |
| `getProducts()`          | Get products (auto-syncs if empty)             |
| `saveProduct()`          | Create/update product in Supabase              |
| `deleteProduct()`        | Remove product from Supabase                   |
| `processSale()`          | Record transaction, update sold counts         |
| `getSalesHistory()`      | Get transactions sorted by date                |
| `getProductsWithStock()` | Get products with calculated available stock   |

#### Storage Keys

All keys are prefixed with `cashier_{username}_`:

- `products` - Product catalog
- `sales` - Transaction history

---

## Supabase Utilities

### Browser Client

**Location:** `lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  );
}
```

### Server Client

**Location:** `lib/supabase/server.ts`

Used in Server Components and Route Handlers with cookie handling.

### Middleware Helper

**Location:** `lib/supabase/middleware.ts`

Handles session refresh and route protection in `proxy.ts`.

---

## Hooks

### useCart

**Location:** `lib/hooks/useCart.ts`

Manages shopping cart state for POS page.

```typescript
const {
  cart, // CartItem[]
  addToCart, // (product: Product) => void
  removeFromCart, // (productId: string) => void
  updateQuantity, // (productId: string, delta: number) => void
  clearCart, // () => void
  totalAmount, // number (memoized)
} = useCart();
```

### useInventory

**Location:** `lib/hooks/useInventory.ts`

Manages inventory page state including modals.

```typescript
const {
  // Data
  filteredProducts,
  isLoading,
  searchTerm,
  isSyncing,

  // Modal state
  isModalOpen,
  editingProduct,
  isEditMode,
  isDeleteModalOpen,

  // Actions
  handleSync,
  handleAddClick,
  handleEditClick,
  handleSave,
  confirmDelete,
} = useInventory();
```

---

## Pages

### Login (`/cashier`)

- Cloudflare Turnstile verification (bot protection)
- Supabase email/password authentication
- Username login converts to `username@guest.local`
- Guest credentials: `guest` / `guest.password`

### POS (`/cashier/pos`)

- Product search with dropdown
- Barcode scanner (camera-based)
- Cart management with quantity controls
- Payment modal with change calculation
- Double-click protection on payment

### Inventory (`/cashier/inventory`)

- Product list with search and pagination
- CRUD operations via modal
- Stock batch management with expiration dates
- Sync button for backend refresh

### History (`/cashier/history`)

- Transaction list with filters (Today, Week, Month, All)
- Revenue and profit calculation
- Sale details modal

### Dashboard (`/cashier/dashboard`)

- Sales analytics and charts
- Date range filtering

---

## Components

### Layout Components

| Component             | Purpose                          |
| --------------------- | -------------------------------- |
| `CashierLayoutClient` | Auth guard, navigation, settings |
| `MobileHeader`        | Top bar with menu toggle         |
| `DesktopSidebar`      | Left navigation panel            |
| `BottomNav`           | Mobile bottom navigation         |
| `MobileOverlayMenu`   | Slide-out mobile menu            |

### POS Components

| Component               | Purpose                         |
| ----------------------- | ------------------------------- |
| `ProductSearchDropdown` | Search input with result list   |
| `BarcodeScanner`        | Camera-based barcode reader     |
| `MobileCartItem`        | Cart item card (mobile)         |
| `DesktopCartRow`        | Cart item row (desktop)         |
| `PaymentModal`          | Payment amount + change display |

### Inventory Components

| Component            | Purpose                   |
| -------------------- | ------------------------- |
| `ProductForm`        | Create/edit product form  |
| `ExpirationManager`  | Stock batch CRUD          |
| `ProductViewModal`   | Read-only product details |
| `MobileProductCard`  | Product card (mobile)     |
| `Table`              | Generic data table        |
| `DeleteConfirmModal` | Deletion confirmation     |

### Settings

| Component         | Purpose                              |
| ----------------- | ------------------------------------ |
| `SettingsModal`   | Text size adjustment                 |
| `TextSizeContext` | Font size provider (normal/large/xl) |

---

## Design System

### Color Palette

| Category                     | Gray | Blue | Green | Red | Amber |
| ---------------------------- | ---- | ---- | ----- | --- | ----- |
| **Hover BG (-50)**           | 50   | 50   | 50    | 50  | 50    |
| **Border (-200)**            | 200  | 200  | 200   | 200 | 200   |
| **Text Secondary**           | 500  | -    | -     | -   | -     |
| **Text/Actions (-600)**      | 900  | 600  | 600   | 600 | 600   |
| **Hover/On Light BG (-800)** | -    | 800  | 800   | 800 | 800   |

### Usage Guide

```
Hover backgrounds    → *-50 (gray-50, blue-50, green-50, red-50, amber-50)
Borders              → *-200 (gray-200, blue-200, green-200, red-200, amber-200)
Secondary text/icons → text-gray-500
Actions/Primary      → *-600 (blue-600, green-600, red-600, amber-600)
Hover text/badges    → *-800 (blue-800, green-800, red-800, amber-800)
Primary text         → text-gray-900
On dark BG           → text-white or text-white/80 (secondary)
```

### Typography

#### Font Family

- **Inter (Sans)**: Used for 100% of the Cashier interface (UI, data, buttons, inputs)
- **Outfit (Heading)**: Used only in main Portfolio website, not in Cashier app

#### Weights

- **Medium (500)**: Standard UI labels, body text, names
- **Bold (700)**: High-emphasis data (prices, stock, totals) and section headings

#### Size

- **Base (16px)**: Default for all text. Avoid `text-sm` or `text-xs` for mobile-first readability.

---

## Environment Variables

| Variable                                       | Purpose                     |
| ---------------------------------------------- | --------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                     | Supabase project URL        |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase public/anon key    |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`               | Cloudflare Turnstile widget |

---

## Authentication Flow

1. User visits `/cashier` (login page)
2. Turnstile verification (bot protection)
3. User enters credentials (username or email + password)
4. If username without `@`, converts to `username@guest.local`
5. Supabase `signInWithPassword()` called
6. Session stored in cookies (managed by `@supabase/ssr`)
7. `proxy.ts` refreshes session on each request
8. Protected routes redirect to login if no session

---

## Proxy (Route Protection)

**Location:** `proxy.ts` (root)

```typescript
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ['/cashier/:path*'],
};
```

- Refreshes Supabase session on every cashier route
- Redirects unauthenticated users to `/cashier` (login)
- Redirects authenticated users away from login page to `/cashier/pos`
