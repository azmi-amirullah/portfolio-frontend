import { useState, useEffect, useMemo, startTransition, useRef } from 'react';
import { cashierService, Transaction } from '@/lib/services/cashier-service';

export type DateRange = 'today' | 'last7' | 'last30' | 'all';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_LAST_7 = 7;
const DAYS_LAST_30 = 30;
const TOP_PRODUCTS_LIMIT = 5;

export interface DailySales {
  date: string; // "Mon", "Tue" or "Dec 12"
  fullDate: string; // YYYY-MM-DD for sorting
  revenue: number;
  profit: number;
  transactions: number;
}

export interface TopProduct {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalProfit: number;
  totalMargin: number;
  totalTransactions: number;
  averageOrderValue: number;
  itemsSold: number;
}

export interface ProductOption {
  id: string;
  name: string;
}

export function useAnalytics(
  dateRange: DateRange = 'last7',
  filterProductId: string = 'all'
) {
  const [sales, setSales] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await cashierService.getSalesHistory();

        if (isMountedRef.current) {
          startTransition(() => {
            setSales(data);
            setIsLoading(false);
          });
        }
      } catch (error) {
        console.error('Failed to load analytics data:', error);
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Extract unique products for filter dropdown
  const uniqueProducts = useMemo(() => {
    const productsMap = new Map<string, string>();
    sales.forEach((sale) => {
      sale.products.forEach((p) => {
        if (!productsMap.has(p.productId)) {
          productsMap.set(p.productId, p.productName);
        }
      });
    });
    return Array.from(productsMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sales]);

  // Filter sales based on date range AND product
  const filteredSales = useMemo(() => {
    let result = sales;

    // 1. Filter by Product
    if (filterProductId !== 'all') {
      result = result.filter((sale) =>
        sale.products.some((p) => p.productId === filterProductId)
      );
    }

    // 2. Filter by Date
    if (dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      let cutoffDate: Date;
      switch (dateRange) {
        case 'today':
          cutoffDate = today;
          break;
        case 'last7':
          cutoffDate = new Date(today.getTime() - DAYS_LAST_7 * MS_PER_DAY);
          break;
        case 'last30':
          cutoffDate = new Date(today.getTime() - DAYS_LAST_30 * MS_PER_DAY);
          break;
        default:
          cutoffDate = new Date(0); // Should not happen given 'all' check
      }
      result = result.filter((sale) => new Date(sale.timestamp) >= cutoffDate);
    }

    return result;
  }, [sales, dateRange, filterProductId]);

  const analytics = useMemo(() => {
    if (filteredSales.length === 0) {
      return {
        summary: {
          totalRevenue: 0,
          totalProfit: 0,
          totalMargin: 0,
          totalTransactions: 0,
          averageOrderValue: 0,
          itemsSold: 0,
        },
        salesTrend: [],
        topProducts: [],
      };
    }

    let totalRevenue = 0;
    let totalProfit = 0;
    let itemsSold = 0;
    const productStats = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();
    const dailyStats = new Map<string, DailySales>();

    const getDateKey = (timestamp: number) => {
      const date = new Date(timestamp);
      return date.toISOString().split('T')[0];
    };

    const getDisplayDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    };

    filteredSales.forEach((sale) => {
      // If product filter is active, skip non-matching products for strict revenue/stats
      let saleRevenue = 0;
      let saleProfit = 0;

      sale.products.forEach((p) => {
        if (filterProductId !== 'all' && p.productId !== filterProductId)
          return;

        const sellPrice = p.price || 0;
        const buyPrice = p.buyPrice || 0;
        const quantity = p.quantity || 0;

        const profit = (sellPrice - buyPrice) * quantity;
        saleRevenue += sellPrice * quantity;
        saleProfit += profit;
        itemsSold += quantity;

        const current = productStats.get(p.productId) || {
          name: p.productName,
          quantity: 0,
          revenue: 0,
        };
        productStats.set(p.productId, {
          name: p.productName,
          quantity: current.quantity + quantity,
          revenue: current.revenue + sellPrice * quantity,
        });
      });

      totalRevenue += saleRevenue;
      totalProfit += saleProfit;

      const dateKey = getDateKey(sale.timestamp);
      const currentDaily = dailyStats.get(dateKey) || {
        date: getDisplayDate(sale.timestamp),
        fullDate: dateKey,
        revenue: 0,
        profit: 0,
        transactions: 0,
      };

      dailyStats.set(dateKey, {
        ...currentDaily,
        revenue: currentDaily.revenue + saleRevenue,
        profit: currentDaily.profit + saleProfit,
        transactions: currentDaily.transactions + 1,
      });
    });

    const sortedDailyKeys = Array.from(dailyStats.keys()).sort();
    const salesTrend = sortedDailyKeys.map((key) => dailyStats.get(key)!);

    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, TOP_PRODUCTS_LIMIT)
      .map((p, index) => ({
        id: String(index),
        ...p,
      }));

    const summary: AnalyticsSummary = {
      totalRevenue,
      totalProfit,
      totalMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      totalTransactions: filteredSales.length,
      averageOrderValue:
        filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0,
      itemsSold,
    };

    return {
      summary,
      salesTrend,
      topProducts,
    };
  }, [filteredSales, filterProductId]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await cashierService.syncSalesWithBackend();
      const data = await cashierService.getSalesHistory();

      if (isMountedRef.current) {
        startTransition(() => {
          setSales(data);
          setIsRefreshing(false);
        });
      }
    } catch (error) {
      console.error('Failed to sync analytics data:', error);
      if (isMountedRef.current) setIsRefreshing(false);
    }
  };

  return {
    ...analytics,
    uniqueProducts,
    isLoading,
    isRefreshing,
    refresh,
    isEmpty: sales.length === 0,
  };
}
