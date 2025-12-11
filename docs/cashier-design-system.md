# Cashier Design System

## Text Colors

| Color | Primary | Hover/Badge | On Colored BG |
| ----- | ------- | ----------- | ------------- |
| Gray  | `500`   | `900`       | -             |
| Blue  | `600`   | `800`       | `800`         |
| Green | `600`   | `800`       | `800`         |
| Red   | `600`   | `800`       | `800`         |
| Amber | `600`   | `800`       | `800`         |

## Usage Guide

```
Primary text    → inherits from main (gray-900)
Secondary text  → text-gray-500
Icons           → text-gray-500
Prices/Links    → text-blue-600
Success/Margin  → text-green-600
Error/Delete    → text-red-600
Warning         → text-amber-600
Hover states    → *-800 variants
On light BG     → *-800 (e.g. text-blue-800 on bg-blue-50)
On dark BG      → text-white or text-white/80 (secondary)
```

## Typography

### Weights

- **Medium (500)**: Used for all standard UI labels, body text, and names.
- **Bold (700)**: Used for high-emphasis data (prices, stock quantities, totals) and section headings.

### Size

- **Base (16px)**: The default size for all text. `text-sm` or `text-xs` should be avoided to ensure "mobile-first" readability.
