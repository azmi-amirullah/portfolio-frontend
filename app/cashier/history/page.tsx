'use client';

import { useState, useEffect } from 'react';
import {
    MdSearch,
    MdCalendarToday,
    MdReceipt,
    MdArrowDropDown,
    MdSync,
} from 'react-icons/md';
import { cashierService, Transaction } from '@/lib/services/cashier-service';
import SaleDetailsModal from '@/components/cashier/SaleDetailsModal';

export default function SalesHistoryPage() {
    const [sales, setSales] = useState<Transaction[]>([]);
    const [filteredSales, setFilteredSales] = useState<Transaction[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('today');
    const [selectedSale, setSelectedSale] = useState<Transaction | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const loadSales = async () => {
        const history = await cashierService.getSalesHistory();
        setSales(history);
    };

    const filterSales = () => {
        let result = [...sales];

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() - 7);
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        if (dateFilter === 'today') {
            result = result.filter((sale) => sale.timestamp >= today.getTime());
        } else if (dateFilter === 'yesterday') {
            result = result.filter(
                (sale) =>
                    sale.timestamp >= yesterday.getTime() &&
                    sale.timestamp < today.getTime()
            );
        } else if (dateFilter === 'week') {
            result = result.filter((sale) => sale.timestamp >= thisWeek.getTime());
        } else if (dateFilter === 'month') {
            result = result.filter((sale) => sale.timestamp >= thisMonth.getTime());
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter((sale) => {
                if (sale.id.toLowerCase().includes(query)) return true;
                return sale.products.some(
                    (p) =>
                        p.productName.toLowerCase().includes(query) ||
                        (p.productBarcode && p.productBarcode.toLowerCase().includes(query))
                );
            });
        }

        setFilteredSales(result);
    };

    useEffect(() => {
        loadSales();
    }, []);

    useEffect(() => {
        filterSales();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, dateFilter, sales]);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    const handleSaleClick = (sale: Transaction) => {
        setSelectedSale(sale);
        setIsDetailsModalOpen(true);
    };

    const handleSync = async () => {
        setIsSyncing(true);
        await cashierService.syncSalesWithBackend();
        await loadSales();
        setIsSyncing(false);
    };

    // Calculate totals
    const totalRevenue = filteredSales.reduce(
        (sum, sale) => sum + sale.totalAmount,
        0
    );
    const totalTransactions = filteredSales.length;
    const totalItemsSold = filteredSales.reduce(
        (sum, sale) =>
            sum + sale.products.reduce((pSum, p) => pSum + p.quantity, 0),
        0
    );

    return (
        <div className='space-y-6 pb-20 md:pb-0'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
                <div>
                    <h1 className='text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 lg:gap-3'>
                        <MdReceipt className='text-blue-600' size={28} />
                        <span>Sales History</span>
                    </h1>
                    <p className='text-gray-500 mt-1 text-sm lg:text-base'>
                        View and manage your transaction history
                    </p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0'
                >
                    <MdSync size={20} className={`text-gray-500 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync History'}</span>
                </button>
            </div>

            {/* Header & Stats */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200'>
                    <div className='text-blue-100 text-sm font-medium mb-1'>
                        Total Revenue
                    </div>
                    <div className='text-3xl font-bold'>
                        Rp {totalRevenue.toLocaleString()}
                    </div>
                </div>
                <div className='bg-white rounded-2xl p-6 border border-gray-200 shadow-sm'>
                    <div className='text-gray-500 text-sm font-medium mb-1'>
                        Transactions
                    </div>
                    <div className='text-3xl font-bold text-gray-900'>
                        {totalTransactions}
                    </div>
                </div>
                <div className='bg-white rounded-2xl p-6 border border-gray-200 shadow-sm'>
                    <div className='text-gray-500 text-sm font-medium mb-1'>
                        Items Sold
                    </div>
                    <div className='text-3xl font-bold text-gray-900'>
                        {totalItemsSold}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className='flex flex-col md:flex-row gap-4'>
                <div className='flex-1 relative'>
                    <MdSearch
                        className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10'
                        size={20}
                    />
                    <input
                        type='text'
                        placeholder='Search transaction ID, product name, or barcode...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm'
                    />
                </div>
                <div className='flex gap-3'>
                    <div className='relative flex-1 md:flex-none md:min-w-[140px]'>
                        <MdCalendarToday
                            className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10'
                            size={18}
                        />
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className='w-full pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer shadow-sm text-sm font-medium text-gray-700'
                        >
                            <option value='today'>Today</option>
                            <option value='yesterday'>Yesterday</option>
                            <option value='week'>This Week</option>
                            <option value='month'>This Month</option>
                            <option value='all'>All Time</option>
                        </select>
                        <MdArrowDropDown
                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10'
                            size={20}
                        />
                    </div>
                </div>
            </div>

            {/* Sales List */}
            <div className='bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden'>
                {/* Desktop Table Header */}
                <div className='hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider'>
                    <div className='col-span-3'>Transaction ID</div>
                    <div className='col-span-3'>Date & Time</div>
                    <div className='col-span-2 text-center'>Items</div>
                    <div className='col-span-4 text-right'>Total Amount</div>
                </div>

                {/* List Content */}
                <div className='divide-y divide-gray-100'>
                    {filteredSales.length === 0 ? (
                        <div className='p-12 text-center text-gray-500'>
                            <div className='bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <MdReceipt size={32} className='text-gray-400' />
                            </div>
                            <h3 className='text-lg font-medium text-gray-900 mb-1'>
                                No sales found
                            </h3>
                            <p>Try adjusting your filters or search query</p>
                        </div>
                    ) : (
                        filteredSales.map((sale) => (
                            <div
                                key={sale.id}
                                onClick={() => handleSaleClick(sale)}
                                className='group hover:bg-blue-50 transition-colors cursor-pointer'
                            >
                                {/* Desktop Row */}
                                <div className='hidden md:grid grid-cols-12 gap-4 p-4 items-center'>
                                    <div className='col-span-3 font-mono text-sm text-gray-600 truncate'>
                                        {sale.id}
                                    </div>
                                    <div className='col-span-3'>
                                        <div className='text-sm font-medium text-gray-900'>
                                            {formatDate(sale.timestamp)}
                                        </div>
                                        <div className='text-xs text-gray-500'>
                                            {formatTime(sale.timestamp)}
                                        </div>
                                    </div>
                                    <div className='col-span-2 text-center'>
                                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                            {sale.products.reduce((acc, p) => acc + p.quantity, 0)} items
                                        </span>
                                    </div>
                                    <div className='col-span-4 text-right'>
                                        <span className='text-sm font-bold text-gray-900'>
                                            Rp {sale.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Mobile Card */}
                                <div className='md:hidden p-4'>
                                    <div className='flex justify-between items-start mb-3'>
                                        <div>
                                            <div className='text-xs font-mono text-gray-500 mb-1'>
                                                {sale.id}
                                            </div>
                                            <div className='text-sm font-bold text-gray-900'>
                                                {formatDate(sale.timestamp)}
                                            </div>
                                            <div className='text-xs text-gray-500'>
                                                {formatTime(sale.timestamp)}
                                            </div>
                                        </div>
                                        <div className='text-right'>
                                            <div className='text-lg font-bold text-blue-600'>
                                                Rp {sale.totalAmount.toLocaleString()}
                                            </div>
                                            <div className='text-xs text-gray-500 mt-1'>
                                                {sale.products.reduce((acc, p) => acc + p.quantity, 0)} items
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <SaleDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                sale={selectedSale}
            />
        </div>
    );
}
