# Garage (Vehicle Maintenance) Module - Technical Documentation

**Last Updated:** 2025-12-27
**Tech Stack:** Next.js 15, React 19, Tailwind CSS, Strapi v5

---

## 1. Overview

The **Garage** module is a digital service book designed to help users track maintenance for their vehicles (cars and motorcycles). It solves the problem of "forgetting when the last oil change was" by determining service due dates based on odometer readings and time intervals.

### Key Features

- **Vehicle Management**: Support for multiple vehicles (Car, Motorcycle).
- **Service Tracking**: Log maintenance activities (Oil change, Brake pads, Tune-up).
- **Predictive Reminders**: "Due in 500km" or "Overdue by 2 months".
- **History Log**: A searchable timeline of all past work, costs, and garages used.

---

## 2. Architecture

Following the Cashier module pattern:

- **Frontend**: Next.js App Router (`/garage` base route).
- **Backend**: Existing Strapi instance with single JSON-blob collection.
- **State**: `garage-service.ts` (Singleton pattern) handling data fetching and caching.
- **Auth**: Reuses `auth-service.ts` JWT token.

### Caching Strategy: Cache-First with Backend Sync

```
┌─────────────────────────────────────────────────────────────┐
│                      Data Flow                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   READ (Page Load)                                           │
│   ─────────────────                                          │
│   1. Check localStorage                                      │
│   2. If empty → fetch from backend → save to localStorage    │
│   3. If exists → use cached data (no fetch)                  │
│                                                              │
│   WRITE (Add/Edit/Delete)                                    │
│   ────────────────────────                                   │
│   1. Send to backend FIRST                                   │
│   2. If success → update localStorage                        │
│   3. If fail → show error, localStorage unchanged            │
│                                                              │
│   SYNC (Manual Button)                                       │
│   ────────────────────                                       │
│   1. Force fetch from backend                                │
│   2. Overwrite localStorage with fresh data                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

| Operation    | Backend  | localStorage | Notes                                |
| ------------ | -------- | ------------ | ------------------------------------ |
| Page Load    | ❌ Skip  | ✅ Read      | Only fetch if cache empty            |
| Add/Edit/Del | ✅ First | ✅ After     | Backend = source of truth            |
| Sync Button  | ✅ Force | ✅ Overwrite | Manual refresh for multi-device sync |
| Menu Change  | ❌ Skip  | ✅ Read      | No re-fetch when switching pages     |

> [!IMPORTANT] > **Backend = Source of Truth**: All writes go to backend first. localStorage is just a cache to reduce API calls and enable fast page transitions.

### User Data Isolation

Each user can only see their own vehicles.

| Layer      | Implementation                                         |
| ---------- | ------------------------------------------------------ |
| **Strapi** | `user` relation (oneToOne) - filter queries by user ID |
| **Cache**  | localStorage key scoped: `garage_{username}_data`      |

> [!WARNING] > **Backend must enforce**: Filter all queries by `user = ctx.state.user.id`.
> Frontend filtering alone is NOT secure.

---

## 3. Data Models

### Storage Pattern

All data is stored in a **single Strapi collection** with a JSON field containing the entire data structure per user.

> [!IMPORTANT] > **Strapi Collection**: `vehicle-maintenance`
>
> | Field  | Type     | Description                            |
> | ------ | -------- | -------------------------------------- |
> | `name` | string   | User identifier                        |
> | `data` | JSON     | Contains all vehicles with nested data |
> | `user` | relation | oneToOne with User                     |

```typescript
// Root structure stored in Strapi 'data' JSON field
interface VehicleMaintenanceData {
  vehicles: Vehicle[];
}
```

---

### 3.1. Vehicle

_The top-level container. Each vehicle contains its own maintenance rules and service history._

```typescript
interface Vehicle {
  id: string; // UUID or timestamp-based
  type: 'car' | 'motorcycle';
  name: string; // e.g., "Daily Driver"
  brand: string; // e.g., "Honda"
  model: string; // e.g., "Beat", "Civic"
  year: number;
  plateNumber: string;
  currentOdometer: number; // Updated by latest Service Log

  // Embedded arrays (no separate collections needed)
  maintenanceItems: MaintenanceItem[];
  serviceLogs: ServiceLog[];
}
```

---

### 3.2. Maintenance Item (Embedded)

_The "rules" for maintenance. Embedded inside each Vehicle._

> [!NOTE]
> No `vehicleId` needed - items are already nested inside their parent Vehicle.
> This allows different intervals per vehicle (motorcycle 2000km vs car 5000km).

```typescript
interface MaintenanceItem {
  id: string;
  name: string; // e.g., "Engine Oil Change"

  // The Rule (at least one required)
  intervalKm?: number; // e.g., 2000 for motorcycle, 5000 for car
  intervalMonths?: number; // e.g., 3 for motorcycle, 6 for car

  // The State (updated when service logged)
  lastPerformedDate?: string; // ISO Date
  lastPerformedOdometer?: number;
}
```

---

### 3.3. Service Log (Embedded)

_Records of completed maintenance. Embedded inside each Vehicle._

```typescript
interface ServiceLog {
  id: string;
  date: string; // ISO Date of service
  odometer: number; // Odometer reading at time of service
  garageName?: string; // e.g., "Official Dealer", "Self"
  notes?: string;

  // What was done?
  items: ServiceLogItem[];
}

interface ServiceLogItem {
  maintenanceItemId: string; // Reference to MaintenanceItem.id within same vehicle
  cost?: number; // Cost for this specific item
}
```

---

## 4. Logic & Calculation Flow

### Service Status Calculation

To determine if a maintenance item is due, check both **Distance** and **Time**:

1. **Distance Due**: `LastPerformedOdometer + IntervalKm`
2. **Date Due**: `LastPerformedDate + IntervalMonths`
3. **Current Status**:
   - Compare `Vehicle.currentOdometer` vs `Distance Due`.
   - Compare `Today` vs `Date Due`.
   - **Worst case wins**: If distance is okay but date is passed, it is **Overdue**.

### Adding a Service Log (Workflow)

When a user submits a "Service Log":

1. **User Input**:
   - Current Odometer (e.g., 15,000 km)
   - Services done (Checklist: [x] Oil, [x] Filter)
   - Cost per item (optional)
2. **Action**:
   - Update the vehicle's `serviceLogs` array.
   - **Update Odometer**: Set `Vehicle.currentOdometer` **ONLY IF** new value > current.
   - **Update Schedules**: For each checked item, update `lastPerformedOdometer` and `lastPerformedDate`.
   - Save entire `data` JSON back to Strapi.

> [!CAUTION] > **Odometer Guard**: Only update if `ServiceLog.odometer > Vehicle.currentOdometer`.
> This allows backdated service logs without corrupting current odometer.

---

## 5. API Endpoints

Single collection approach - minimal endpoints:

| Endpoint                         | Method | Description                |
| -------------------------------- | ------ | -------------------------- |
| `/api/vehicle-maintenances`      | GET    | Get user's data (vehicles) |
| `/api/vehicle-maintenances`      | POST   | Create initial record      |
| `/api/vehicle-maintenances/{id}` | PUT    | Update entire data JSON    |

---

## 6. UI Structure (Mobile First)

### Navigation Menu

Three main menu items (same pattern as Cashier with `/pos`, `/inventory`, `/history`):

| Route          | Menu Label  | Purpose                       |
| -------------- | ----------- | ----------------------------- |
| `/garage`      | Garage      | Vehicle list + CRUD           |
| `/maintenance` | Maintenance | Maintenance items per vehicle |
| `/service`     | Service Log | Service history + add new log |

> [!IMPORTANT] > **Vehicle Selection**: `/maintenance` and `/service` pages require selecting a vehicle first.
>
> - **Methods**: Dropdown, URL query param (e.g. `?vehicleId=123`), or localStorage preference.

---

### Pages

**1. Garage (`/garage`)**

- List of Vehicle Cards
- Each card: Name, Brand/Model, Plate, Status Badge (Green/Yellow/Red)
- Actions: Add, Edit, Delete vehicle
- **Quick Actions**:
  - `Maintenance` icon → Navigates to `/maintenance` with this vehicle selected
  - `Service` icon → Navigates to `/service` with this vehicle selected

**2. Maintenance (`/maintenance`)**

- Vehicle selector dropdown (required)
- List of maintenance items for selected vehicle
- Each item: Name, Interval (km/months), Status progress bar
- Actions: Add, Edit, Delete maintenance rules

**3. Service Log (`/service`)**

- Vehicle selector dropdown (required)
- Timeline of service logs for selected vehicle
- Each log: Date, Odometer, Items performed, Total cost
- FAB: `+ Log Service` (opens form)

**4. Add Service Form (Modal or `/service/new`)**

- Date (Default: today)
- Current Odometer
- Checklist of Maintenance Items from selected vehicle
- Cost per item (optional)
- Garage name / Notes

---

## 7. Implementation Plan

### Phase 1: Backend

1. ~~Create `vehicle-maintenance` collection in Strapi~~ ✅
2. Set up permissions for authenticated users.

### Phase 2: Frontend

1. Create `lib/services/garage-service.ts`
2. Scaffold `/garage` pages with vehicle selection flow.

### Phase 3: Core Logic

1. Implement "Add Vehicle" flow.
2. Implement "Add Service Log" with status updates.
3. Implement status calculation (ok/due_soon/overdue).
