# Garage (Vehicle Maintenance) Module - Technical Documentation

**Last Updated:** 2026-01-07
**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Supabase

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
- **Backend**: Supabase (PostgreSQL with RLS).
- **State**: `garage-service.ts` (Singleton pattern) handling data fetching and caching.
- **Auth**: Reuses `auth-service.ts` (Supabase Auth with cookie-based sessions).

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

| Layer        | Implementation                                    |
| ------------ | ------------------------------------------------- |
| **Supabase** | Row Level Security (RLS) - `auth.uid() = user_id` |
| **Cache**    | localStorage keys scoped per table (see below)    |

> [!WARNING] > **RLS must be enabled**: Row Level Security policies ensure users can only access their own data at the database level. Frontend filtering alone is NOT secure.

---

## 3. Database Schema

Data is stored in **normalized tables** (same pattern as Cashier module).

### Vehicles Table

```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('car', 'motorcycle')),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  plate_number TEXT NOT NULL,
  current_odometer INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Maintenance Items Table

```sql
CREATE TABLE maintenance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  interval_km INTEGER,
  interval_months INTEGER,
  last_performed_date DATE,
  last_performed_odometer INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Service Logs Table

```sql
CREATE TABLE service_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  odometer INTEGER NOT NULL,
  garage_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Service Log Items Table

```sql
CREATE TABLE service_log_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_log_id UUID REFERENCES service_logs(id) ON DELETE CASCADE,
  maintenance_item_id UUID REFERENCES maintenance_items(id) ON DELETE SET NULL,
  cost DECIMAL(10,2)
);
```

### Row Level Security

All tables have RLS enabled with policies ensuring users can only access their own data:

```sql
-- Apply to all tables: vehicles, maintenance_items, service_logs
CREATE POLICY "Users can CRUD own data" ON [table]
  FOR ALL USING (auth.uid() = user_id);

-- service_log_items: access via service_logs join
CREATE POLICY "Users can CRUD own items" ON service_log_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM service_logs
      WHERE service_logs.id = service_log_items.service_log_id
      AND service_logs.user_id = auth.uid()
    )
  );
```

### Indexes (Performance Critical)

> [!IMPORTANT] > **RLS Performance**: Without indexes on `user_id`, RLS policies can cause up to **99%+ slower queries**. Always index columns used in RLS policies.

```sql
-- Index user_id for RLS performance (critical)
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_maintenance_items_user_id ON maintenance_items(user_id);
CREATE INDEX idx_service_logs_user_id ON service_logs(user_id);

-- Index foreign keys for join performance
CREATE INDEX idx_maintenance_items_vehicle_id ON maintenance_items(vehicle_id);
CREATE INDEX idx_service_logs_vehicle_id ON service_logs(vehicle_id);
CREATE INDEX idx_service_log_items_service_log_id ON service_log_items(service_log_id);
```

### Triggers

Auto-update `updated_at` timestamp on row modification:

```sql
-- Create reusable trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to vehicles table
CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

## 4. Data Models

### Vehicle

```typescript
interface Vehicle {
  id: string;
  type: 'car' | 'motorcycle';
  name: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  currentOdometer: number;
  createdAt?: string;
  updatedAt?: string;
}
```

### MaintenanceItem

```typescript
interface MaintenanceItem {
  id: string;
  vehicleId: string;
  name: string;
  intervalKm?: number;
  intervalMonths?: number;
  lastPerformedDate?: string;
  lastPerformedOdometer?: number;
}
```

### ServiceLog

```typescript
interface ServiceLog {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  garageName?: string;
  notes?: string;
  items: ServiceLogItem[];
}

interface ServiceLogItem {
  id: string;
  serviceLogId: string;
  maintenanceItemId: string;
  cost?: number;
}
```

---

## 5. Logic & Calculation Flow

### Service Status Calculation

To determine if a maintenance item is due, check both **Distance** and **Time**:

1. **Distance Due**: `lastPerformedOdometer + intervalKm`
2. **Date Due**: `lastPerformedDate + intervalMonths`
3. **Current Status**:
   - Compare `vehicle.currentOdometer` vs `Distance Due`.
   - Compare `Today` vs `Date Due`.
   - **Worst case wins**: If distance is okay but date is passed, it is **Overdue**.

### Adding a Service Log (Workflow)

When a user submits a "Service Log":

1. **User Input**:
   - Current Odometer (e.g., 15,000 km)
   - Services done (Checklist: [x] Oil, [x] Filter)
   - Cost per item (optional)
2. **Database Operations**:
   - Insert into `service_logs` table.
   - Insert checked items into `service_log_items` table.
   - **Update Odometer**: Update `vehicles.current_odometer` **ONLY IF** new value > current.
   - **Update Schedules**: For each checked item, update `maintenance_items.last_performed_odometer` and `last_performed_date`.

> [!CAUTION] > **Odometer Guard**: Only update if `ServiceLog.odometer > Vehicle.currentOdometer`.
> This allows backdated service logs without corrupting current odometer.

---

## 6. Data Access

Direct Supabase client calls (no REST endpoints needed):

### Vehicles

| Operation | Supabase Method                      |
| --------- | ------------------------------------ |
| List      | `supabase.from('vehicles').select()` |
| Create    | `supabase.from('vehicles').insert()` |
| Update    | `supabase.from('vehicles').update()` |
| Delete    | `supabase.from('vehicles').delete()` |

### Maintenance Items

| Operation | Supabase Method                                                    |
| --------- | ------------------------------------------------------------------ |
| List      | `supabase.from('maintenance_items').select().eq('vehicle_id', id)` |
| Create    | `supabase.from('maintenance_items').insert()`                      |
| Update    | `supabase.from('maintenance_items').update()`                      |
| Delete    | `supabase.from('maintenance_items').delete()`                      |

### Service Logs

| Operation | Supabase Method                                                                        |
| --------- | -------------------------------------------------------------------------------------- |
| List      | `supabase.from('service_logs').select('*, service_log_items(*)').eq('vehicle_id', id)` |
| Create    | `supabase.from('service_logs').insert()` + `service_log_items.insert()`                |
| Delete    | `supabase.from('service_logs').delete()` (cascades to items)                           |

> [!NOTE]
> RLS policies automatically filter by `user_id`, so no manual filtering is needed in queries.

### Storage Keys

All keys are prefixed with `garage_{username}_`:

| Key                | Data Cached                |
| ------------------ | -------------------------- |
| `vehicles`         | All user's vehicles        |
| `maintenanceItems` | Maintenance rules          |
| `serviceLogs`      | Service history with items |

---

## 7. UI Structure (Mobile First)

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

## 8. Implementation Plan

### Phase 1: Backend (Supabase)

1. Create `vehicles` table with RLS policy.
2. Create `maintenance_items` table with RLS policy.
3. Create `service_logs` table with RLS policy.
4. Create `service_log_items` table with RLS policy (via join).

### Phase 2: Frontend

1. Create `lib/services/garage-service.ts` (uses Supabase client from `lib/supabase/client.ts`).
2. Scaffold `/garage` pages with vehicle selection flow.

### Phase 3: Core Logic

1. Implement "Add Vehicle" flow.
2. Implement "Add Service Log" with status updates.
3. Implement status calculation (ok/due_soon/overdue).
