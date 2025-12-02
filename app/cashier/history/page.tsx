'use client';

import { useState, useEffect } from 'react';
import { cashierService } from '@/lib/services/cashier-service';
import { MdHistory, MdSearch } from 'react-icons/md';
import SaleDetailsModal from '@/components/cashier/SaleDetailsModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface SaleRecord {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  timestamp: number;
  discount?: number;
  taxRate?: number;
  amountPaid?: number;
  grandTotal?: number;
}

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [filteredSales, setFilteredSales] = useState<SaleRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadSales = async () => {
    setIsLoading(true);
    try {
      const salesData = await cashierService.getSalesHistory();
      setSales(salesData);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSales = () => {
    let filtered = [...sales];

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    if (dateFilter === 'today') {
      filtered = filtered.filter((sale) => now - sale.timestamp < oneDay);
    } else if (dateFilter === 'week') {
      filtered = filtered.filter((sale) => now - sale.timestamp < oneWeek);
    } else if (dateFilter === 'month') {
      filtered = filtered.filter((sale) => now - sale.timestamp < oneMonth);
    }

    if (searchTerm) {
      filtered = filtered.filter((sale) =>
        sale.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSales(filtered);
  };

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    filterSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sales, searchTerm, dateFilter]);

  const handleRowClick = (sale: SaleRecord) => {
    setSelectedSale(sale);
    setShowDetailsModal(true);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalRevenue = filteredSales.reduce(
    (sum, sale) => sum + (sale.grandTotal || 0),
    0
  );

  const totalItems = filteredSales.reduce(
    (sum, sale) => sum + sale.quantity,
    0
  );

  return (
    <div className='space-y-4 lg:space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 lg:gap-3'>
            <MdHistory className='text-blue-600' size={28} />
            <span className='hidden sm:inline'>Sales History</span>
            <span className='sm:hidden'>History</span>
          </h1>
          <p className='text-gray-500 mt-1 text-sm lg:text-base hidden sm:block'>
            View all completed transactions
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6'>
        <div className='bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6'>
          <div className='text-xs lg:text-sm text-gray-600 mb-1'>
            Total Sales
          </div>
          <div className='text-2xl lg:text-3xl font-bold text-gray-900'>
            {filteredSales.length}
          </div>
        </div>
        <div className='bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6'>
          <div className='text-xs lg:text-sm text-gray-600 mb-1'>
            Items Sold
          </div>
          <div className='text-2xl lg:text-3xl font-bold text-gray-900'>
            {totalItems}
          </div>
        </div>
        <div className='bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 sm:col-span-2 lg:col-span-1'>
          <div className='text-xs lg:text-sm text-gray-600 mb-1'>
            Total Revenue
          </div>
          <div className='text-2xl lg:text-3xl font-bold text-blue-600'>
            Rp {totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4'>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <MdSearch className='h-5 w-5 text-gray-400' />
            </div>
            <input
              type='text'
              placeholder='Search by product name...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='block w-full pl-10 pr-3 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base lg:text-sm'
            />
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className='block w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base lg:text-sm'
          >
            <option value='all'>All Time</option>
            <option value='today'>Today</option>
            <option value='week'>Last 7 Days</option>
            <option value='month'>Last 30 Days</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className='bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-12 text-center'>
          <LoadingSpinner size='lg' />
          <p className='text-gray-500 mt-2'>Loading sales history...</p>
        </div>
      ) : filteredSales.length === 0 ? (
        <div className='bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-12 text-center'>
          <MdHistory size={48} className='mx-auto text-gray-300 mb-2' />
          <p className='text-gray-500'>No sales found</p>
        </div>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className='lg:hidden space-y-3'>
            {filteredSales.map((sale) => (
              <div
                key={sale.id}
                onClick={() => handleRowClick(sale)}
                className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 active:bg-gray-50 transition-colors cursor-pointer'
              >
                <div className='flex justify-between items-start mb-2'>
                  <div className='flex-1'>
                    <div className='font-semibold text-gray-900'>
                      {sale.productName}
                    </div>
                    <div className='text-xs text-gray-500 mt-1'>
                      {formatDate(sale.timestamp)} •{' '}
                      {formatTime(sale.timestamp)}
                    </div>
                  </div>
                  <span className='text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded'>
                    ×{sale.quantity}
                  </span>
                </div>
                <div className='flex justify-between items-center pt-2 border-t border-gray-100'>
                  <div className='text-xs text-gray-500'>
                    {sale.discount ? (
                      <span className='text-red-600'>
                        Discount: Rp {sale.discount.toLocaleString()}
                      </span>
                    ) : null}
                    {sale.taxRate ? (
                      <span className='ml-2'>Tax: {sale.taxRate}%</span>
                    ) : null}
                  </div>
                  <div className='text-base font-bold text-gray-900'>
                    Rp {(sale.grandTotal || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className='hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Date & Time
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Product
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Quantity
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Discount
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Tax
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Grand Total
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      onClick={() => handleRowClick(sale)}
                      className='hover:bg-gray-50 cursor-pointer transition-colors'
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900'>
                          {formatDate(sale.timestamp)}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {formatTime(sale.timestamp)}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900'>
                          {sale.productName}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        <span className='text-sm font-semibold text-gray-900'>
                          {sale.quantity}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500'>
                        {sale.discount ? (
                          <span className='text-red-600'>
                            - Rp {sale.discount.toLocaleString()}
                          </span>
                        ) : (
                          <span className='text-gray-400'>-</span>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500'>
                        {sale.taxRate ? (
                          <span>{sale.taxRate}%</span>
                        ) : (
                          <span className='text-gray-400'>-</span>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900'>
                        Rp {(sale.grandTotal || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <SaleDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        sale={selectedSale}
      />
    </div>
  );
}
