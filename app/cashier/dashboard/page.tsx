'use client';

import {
  MdDashboard,
  MdAttachMoney,
  MdShowChart,
  MdTrendingUp,
  MdShoppingBag,
  MdRefresh,
} from 'react-icons/md';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PageHeader } from '@/components/cashier/PageHeader';
import { Button } from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { useAnalytics, DateRange } from '@/lib/hooks/useAnalytics';
import { ElementType, memo, useState, useCallback, useMemo } from 'react';
import { Select, SingleValue } from '@/components/ui/Select';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const StatCard = memo(
  ({
    title,
    value,
    subtext,
    icon: Icon,
    bgClass,
    textClass,
  }: {
    title: string;
    value: string | number;
    subtext: string;
    icon: ElementType;
    bgClass: string;
    textClass: string;
  }) => (
    <div className='bg-white rounded-2xl p-6 border border-gray-200 shadow-sm'>
      <div className='flex items-start justify-between mb-4'>
        <div>
          <div className='text-gray-500 font-medium mb-1'>{title}</div>
          <div className='text-2xl md:text-3xl font-bold text-gray-900'>
            {value}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${bgClass}`}>
          <Icon size={24} className={textClass} />
        </div>
      </div>
      <div className='text-sm text-gray-500'>{subtext}</div>
    </div>
  )
);

StatCard.displayName = 'StatCard';

// Memoized chart tooltip style to prevent re-renders
const TOOLTIP_STYLE = {
  borderRadius: '12px',
  border: 'none',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
} as const;

const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
] as const;

const isValidDateRange = (value: string): value is DateRange =>
  DATE_RANGE_OPTIONS.some((opt) => opt.value === value);

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>('last7');
  const [productId, setProductId] = useState<string>('all');

  const {
    summary,
    salesTrend,
    topProducts,
    uniqueProducts,
    isLoading,
    isRefreshing,
    refresh,
  } = useAnalytics(dateRange, productId);

  const productOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Products' },
      ...(uniqueProducts?.map((p) => ({
        value: p.id,
        label: p.name,
      })) || []),
    ];
  }, [uniqueProducts]);

  // Memoized tooltip formatter for performance
  const tooltipFormatter = useCallback(
    (
      value:
        | number
        | string
        | Array<number | string>
        | ReadonlyArray<number | string>
        | null
        | undefined
    ): [string, string] => {
      if (Array.isArray(value)) {
        return [value.join(', '), ''];
      }
      if (value != null) {
        return [
          typeof value === 'number'
            ? `Rp ${value.toLocaleString()}`
            : String(value),
          '',
        ];
      }
      return ['N/A', ''];
    },
    []
  );

  // Memoized Y-axis formatter
  const yAxisFormatter = useCallback((value: number) => `${value / 1000}k`, []);

  return (
    <ErrorBoundary>
      <div className='space-y-6 md:pb-0'>
        <PageHeader
          icon={MdDashboard}
          title='Dashboard'
          subtitle='Overview of your business performance'
          actions={
            <Button
              onClick={refresh}
              disabled={isRefreshing || isLoading}
              className='bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
            >
              <MdRefresh
                size={20}
                className={`mr-2 ${
                  isRefreshing || isLoading ? 'animate-spin' : ''
                }`}
              />
              {isRefreshing || isLoading ? 'Syncing...' : 'Sync'}
            </Button>
          }
        />

        {/* Filters */}
        {!isLoading && (
          <div className='flex flex-col sm:flex-row justify-end gap-3'>
            <div className='w-full sm:w-64'>
              <Select
                value={
                  productOptions.find((opt) => opt.value === productId) ||
                  productOptions[0]
                }
                onChange={(
                  option: SingleValue<{ value: string; label: string }>
                ) => setProductId(option?.value || 'all')}
                options={productOptions}
                className='text-gray-900 basic-single'
                placeholder='Search product...'
                isSearchable
              />
            </div>
            <div className='w-full sm:w-48'>
              <Select
                value={
                  DATE_RANGE_OPTIONS.find((opt) => opt.value === dateRange) ||
                  DATE_RANGE_OPTIONS[1]
                }
                onChange={(
                  option: SingleValue<{ value: string; label: string }>
                ) => {
                  const value = option?.value;
                  if (value && isValidDateRange(value)) {
                    setDateRange(value);
                  }
                }}
                options={DATE_RANGE_OPTIONS}
                className='text-gray-900 basic-single'
                isSearchable={false}
              />
            </div>
          </div>
        )}

        {isLoading || isRefreshing ? (
          <div className='min-h-[60vh] flex items-center justify-center bg-white/50 rounded-2xl border-2 border-dashed border-gray-200'>
            <Loading />
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className='grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4'>
              <StatCard
                title='Total Revenue'
                value={`Rp ${summary.totalRevenue.toLocaleString()}`}
                subtext={`${summary.totalTransactions} transactions`}
                icon={MdAttachMoney}
                bgClass='bg-blue-50'
                textClass='text-blue-600'
              />
              <StatCard
                title='Total Profit'
                value={`Rp ${summary.totalProfit.toLocaleString()}`}
                subtext={`${summary.totalMargin.toFixed(1)}% margin`}
                icon={MdTrendingUp}
                bgClass='bg-green-50'
                textClass='text-green-600'
              />
              <StatCard
                title='Items Sold'
                value={summary.itemsSold}
                subtext='across all products'
                icon={MdShoppingBag}
                bgClass='bg-amber-50'
                textClass='text-amber-600'
              />
              <StatCard
                title='Avg Order'
                value={`Rp ${Math.round(
                  summary.averageOrderValue
                ).toLocaleString()}`}
                subtext='per transaction'
                icon={MdShowChart}
                bgClass='bg-red-50'
                textClass='text-red-600'
              />
            </div>

            {/* Charts Section */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Sales Trend Chart */}
              <div className='lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm'>
                <h3 className='text-lg font-bold text-gray-900 mb-6'>
                  Sales Trend
                </h3>
                <div className='h-[300px] w-full'>
                  {salesTrend.length > 0 ? (
                    <ResponsiveContainer width='100%' height='100%'>
                      <AreaChart data={salesTrend}>
                        <defs>
                          <linearGradient
                            id='colorRevenue'
                            x1='0'
                            y1='0'
                            x2='0'
                            y2='1'
                          >
                            <stop
                              offset='5%'
                              stopColor='#2563eb'
                              stopOpacity={0.1}
                            />
                            <stop
                              offset='95%'
                              stopColor='#2563eb'
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id='colorProfit'
                            x1='0'
                            y1='0'
                            x2='0'
                            y2='1'
                          >
                            <stop
                              offset='5%'
                              stopColor='#d97706'
                              stopOpacity={0.1}
                            />
                            <stop
                              offset='95%'
                              stopColor='#d97706'
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray='3 3'
                          vertical={false}
                          stroke='var(--color-gray-500)'
                        />
                        <XAxis
                          dataKey='date'
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'var(--color-gray-500)', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'var(--color-gray-500)', fontSize: 12 }}
                          tickFormatter={yAxisFormatter}
                        />
                        <Tooltip
                          contentStyle={TOOLTIP_STYLE}
                          formatter={tooltipFormatter}
                        />
                        <Legend />
                        <Area
                          type='monotone'
                          dataKey='revenue'
                          name='Revenue'
                          stroke='var(--color-blue-600)'
                          strokeWidth={2}
                          fillOpacity={1}
                          fill='url(#colorRevenue)'
                        />
                        <Area
                          type='monotone'
                          dataKey='profit'
                          name='Profit'
                          stroke='var(--color-amber-600)'
                          strokeWidth={2}
                          fillOpacity={1}
                          fill='url(#colorProfit)'
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className='h-full flex flex-col items-center justify-center text-gray-500'>
                      <MdShowChart size={48} className='mb-2 opacity-50' />
                      <p>No data available yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Products */}
              <div className='bg-white rounded-2xl p-6 border border-gray-200 shadow-sm'>
                <h3 className='text-lg font-bold text-gray-900 mb-6'>
                  Top Products
                </h3>
                <div className='space-y-6'>
                  {topProducts.length > 0 ? (
                    topProducts.map((product, index) => (
                      <div key={product.id} className='relative'>
                        <div className='flex justify-between items-center mb-1 relative z-10'>
                          <span className='font-medium text-gray-900 truncate max-w-[60%]'>
                            {index + 1}. {product.name}
                          </span>
                          <span className='text-sm text-gray-500'>
                            {product.quantity} sold
                          </span>
                        </div>
                        <div className='w-full bg-gray-50 rounded-full h-2 overflow-hidden'>
                          <div
                            className='bg-blue-600 h-2 rounded-full'
                            style={{
                              width: `${
                                topProducts[0]?.quantity
                                  ? (product.quantity /
                                      topProducts[0].quantity) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <div className='text-xs text-gray-500 mt-1 text-right'>
                          Rp {product.revenue.toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='h-[200px] flex flex-col items-center justify-center text-gray-500'>
                      <MdShoppingBag size={48} className='mb-2 opacity-50' />
                      <p>No sales yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
