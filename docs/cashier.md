# Cashier Module - Technical Documentation

**Last Updated:** 2025-12-12  
**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS

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
│  └─ /history/page.tsx                                        │
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
│  ├─ cashierService (data operations + sync)                  │
│  └─ authService (authentication)                             │
├─────────────────────────────────────────────────────────────┤
│                        Storage                               │
│  ├─ localStorage (offline cache, user-scoped)                │
│  └─ Strapi Backend (source of truth)                         │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision                      | Rationale                                                  |
| ----------------------------- | ---------------------------------------------------------- |
| **Local Caching**             | localStorage caches data to reduce API calls on page loads |
| **Backend = Source of Truth** | Write ops (payment, add, edit) require internet            |
| **One-Way Sync**              | Sync pulls BE → FE; no offline queue                       |
| **User-Scoped Storage**       | Each user has isolated localStorage data                   |
| **Mobile-First**              | Primary use case is mobile/tablet at checkout              |

---

## Data Models

### Product

```typescript
interface Product {
  id: string; // Product name as ID
  barcode: string; // Scannable barcode
  name: string; // Display name
  price: number; // Sell price
  buyPrice: number; // Cost price
  sold?: number; // Total units sold
  stock?: StockBatch[];
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

### CashierService

**Location:** `lib/services/cashier-service.ts`

The singleton service handles all data operations with localStorage caching.

#### Key Methods

| Method                   | Purpose                                      |
| ------------------------ | -------------------------------------------- |
| `syncWithBackend()`      | Fetch products from Strapi and cache locally |
| `getProducts()`          | Get products (auto-syncs if empty)           |
| `saveProduct()`          | Create/update product + sync to backend      |
| `deleteProduct()`        | Remove product + sync to backend             |
| `processSale()`          | Deduct stock, record transaction, sync       |
| `getSalesHistory()`      | Get transactions sorted by date              |
| `getProductsWithStock()` | Get products with calculated available stock |

#### Storage Keys

All keys are prefixed with `cashier_{username}_`:

- `products` - Product catalog
- `sales` - Transaction history

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

- Cloudflare Turnstile verification
- Guest credentials option
- Animated transitions with Framer Motion

### POS (`/cashier/pos`)

- Product search with dropdown
- Barcode scanner (camera-based)
- Cart management with quantity controls
- Payment modal with change calculation
- Double-click protection on payment

### Inventory (`/cashier/inventory`)

- Product list with search
- CRUD operations via modal
- Stock batch management with expiration dates
- Sync button for backend refresh

### History (`/cashier/history`)

- Transaction list with filters (Today, Week, Month, All)
- Revenue and profit calculation
- Sale details modal

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

## API Endpoints

The frontend communicates with Strapi backend via:

| Endpoint                      | Method | Purpose               |
| ----------------------------- | ------ | --------------------- |
| `/api/frontend/getProducts`   | GET    | Fetch all products    |
| `/api/frontend/saveProduct`   | POST   | Create/update product |
| `/api/frontend/deleteProduct` | POST   | Delete product        |
| `/api/frontend/getSales`      | GET    | Fetch sales history   |
| `/api/frontend/processSale`   | POST   | Record new sale       |

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## Environment Variables

| Variable                         | Purpose                     |
| -------------------------------- | --------------------------- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile widget |
| `NEXT_PUBLIC_API_URL`            | Backend API base URL        |
