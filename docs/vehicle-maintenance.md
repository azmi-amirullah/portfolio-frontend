# Garage (Vehicle Maintenance) Module - Technical Documentation

**Last Updated:** 2025-12-16
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

We will extend the existing architecture used in the Cashier module.

- **Frontend**: Next.js App Router (`/garage` base route).
- **Backend**: Existing Strapi instance.
- **State**: `garage-service.ts` (Singleton pattern) handling data fetching and optimistic UI.
- **Auth**: Reuses `auth-service.ts` JWT token.

---

## 3. Data Models (Strapi + Frontend Types)

### 3.1. Vehicle (`Vehicle`)

_The top-level container._

```typescript
interface Vehicle {
  id: string;
  userId: string; // Relation to User
  type: 'car' | 'motorcycle';
  name: string; // e.g., "Daily Driver"
  brand: string; // e.g., "Honda" (Renamed from 'make' for clarity)
  model: string; // e.g., "Civic"
  year: number;
  plateNumber: string;
  // image removed for MVP
  currentOdometer: number; // Updated automatically by latest Service Log
}
```

### 3.2. Maintenance Schedule (`MaintenanceItem`)

_The "rules" for maintenance. Can be a template or custom user entry._

```typescript
interface MaintenanceItem {
  id: string;
  vehicleId: string;
  name: string; // e.g., "Engine Oil Change"

  // The Rule
  intervalKm: number; // e.g., 4000
  intervalMonths: number; // e.g., 6

  // The State (Calculated)
  lastPerformedDate?: string; // ISO Date
  lastPerformedOdometer?: number;

  // Derived Status (Frontend specific)
  // status: 'ok' | 'due_soon' | 'overdue'
}
```

### 3.3. Service Log (`ServiceLog`)

_The content of a "Maintenance Record" input._

```typescript
interface ServiceLog {
  id: string;
  vehicleId: string;
  date: string; // ISO Date of service
  odometer: number; // The odometer reading AT THE TIME of service
  garageName?: string; // Optional: "Official Dealer", "Self"
  cost: number;
  notes?: string;

  // What was done?
  items: ServiceLogItem[]; // Array of tasks performed
}

interface ServiceLogItem {
  maintenanceItemId: string; // Link to the Schedule rule (e.g., linked to "Oil Change")
  name: string; // Snapshot of the name
}
```

---

## 4. Logic & Calculation Flow

### Service Status Calculation

To determine if a maintenance item is due, check both **Distance** and **Time**:

1.  **Distance Due**: `LastPerformedOdometer + IntervalKm`
2.  **Date Due**: `LastPerformedDate + IntervalMonths`
3.  **Current Status**:
    - Compare `Vehicle.currentOdometer` vs `Distance Due`.
    - Compare `Today` vs `Date Due`.
    - **Worst case wins**: If distance is okay but date is passed, it is **Overdue**.

### Adding a Service Log (The Workflow)

When a user submits a standardized "Service Log":

1.  **User Input**:
    - Current Odometer (e.g., 15,000 km)
    - Services done (Checklist: [x] Oil, [x] Filter)
2.  **Action**:
    - Save `ServiceLog` to backend.
    - **Update Vehicle**: Set `Vehicle.currentOdometer` to the new 15,000 km.
    - **Update Schedules**: For every checked item (Oil, Filter), update their `lastPerformedOdometer` (15,000) and `lastPerformedDate` (today).

---

## 5. API Endpoints (Planned)

All endpoints prefixed with `/api/garage`:

- `GET /vehicles`: List all user vehicles.
- `POST /vehicles`: Add a new vehicle.
- `GET /vehicles/:id`: Get details + schedules + logs.
- `POST /service-logs`: Create a log (Atomically updates Vehicle + Schedules).
- `POST /maintenance-items`: Add a custom tracking rule.

---

## 6. UI Structure (Mobile First)

**1. Dashboard (`/garage`)**

- List of Vehicle Cards.
- Each card shows: Name, Plate, Status Badge (Green/Yellow/Red).
- Floating Action Button: `+ Add Vehicle`.

**2. Vehicle Detail (`/garage/[id]`)**

- **Header**: Large Odometer display (Editable).
- **Tab 1: Maintenance (Status)**
  - List of items with Progress Bars.
  - Example: "Oil Change: 80% life left (1,500km)".
  - Click item -> Log just this service.
- **Tab 2: History**
  - Vertical timeline of Service Logs.
- **FAB**: `+ Service` (Opens "New Entry" form).

**3. New Entry Form**

- Input: Date (Default today).
- Input: Current Odometer.
- Section: "What did you do?"
  - List of known Maintenance Items as Toggle/Checkbox.
  - "Other" text field.
- Input: Cost.
- Input: Location/Notes.

---

## 7. Implementation Plan

### Phase 1: Backend Setup

1. Create `Vehicle`, `MaintenanceItem`, `ServiceLog` content types in Strapi.
2. Set up relations and permissions.

### Phase 2: Frontend Setup

1. Create `lib/services/garage-service.ts`.
2. Scaffold `/garage` pages.

### Phase 3: Core Logic

1. Implement "Add Service" flow.
2. Implement "Status Calculation" logic.
