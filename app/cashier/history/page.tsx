'use client';

import { useState, useEffect, useMemo, startTransition } from 'react';
import {
    MdSearch,
    MdCalendarToday,
    MdReceipt,
    MdArrowDropDown,
    MdSync,
} from 'react-icons/md';
import Loading from '@/components/ui/Loading';
import { cashierService, Transaction } from '@/lib/services/cashier-service';
import SaleDetailsModal from '@/components/cashier/SaleDetailsModal';
import { PageHeader } from '@/components/cashier/PageHeader';
import { Table } from '@/components/cashier/Table';
import { Button } from '@/components/ui/Button';

export default function SalesHistoryPage() {
    const [sales, setSales] = useState<Transaction[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('today');
    const [selectedSale, setSelectedSale] = useState<Transaction | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        cashierService.getSalesHistory().then((data) => {
            startTransition(() => {
                setSales(data);
                setIsLoading(false);
            });
        });
    }, []);

    const filteredSales = useMemo(() => {
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

        return result;
    }, [sales, searchQuery, dateFilter]);

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

    const loadSales = async () => {
        const history = await cashierService.getSalesHistory();
        startTransition(() => {
            setSales(history);
        });
    };

    const handleSync = async () => {
        setIsSyncing(true);
        setIsLoading(true);
        try {
            await cashierService.syncSalesWithBackend();
            await loadSales();
        } finally {
            setIsSyncing(false);
            setIsLoading(false);
        }
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
            <PageHeader
                icon={MdReceipt}
                title='Sales History'
                subtitle='View and manage your transaction history'
                actions={
                    <Button
                        onClick={handleSync}
                        disabled={isSyncing}
                        variant='outline'
                        className='flex items-center gap-2 w-full sm:w-auto justify-center'
                    >
                        <MdSync size={20} className={isSyncing ? 'animate-spin' : ''} />
                        <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
                    </Button>
                }
            />

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
                    <div className='text-3xl font-bold '>
                        {totalTransactions}
                    </div>
                </div>
                <div className='bg-white rounded-2xl p-6 border border-gray-200 shadow-sm'>
                    <div className='text-gray-500 text-sm font-medium mb-1'>
                        Items Sold
                    </div>
                    <div className='text-3xl font-bold '>
                        {totalItemsSold}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className='flex flex-col md:flex-row gap-4'>
                <div className='flex-1 relative'>
                    <MdSearch
                        className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10'
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
                            className='w-full pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer shadow-sm text-sm font-medium'
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
            {isLoading ? (
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center'>
                    <Loading />
                </div>
            ) : filteredSales.length === 0 ? (
                <div className='md:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center'>
                    <div className='bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <MdReceipt size={32} className='text-gray-500' />
                    </div>
                    <h3 className='text-lg font-medium text-gray-500 mb-1'>
                        No sales found
                    </h3>
                    <p className='text-gray-500'>Try adjusting your filters or search query</p>
                </div>
            ) : (
                <div className='md:hidden space-y-3'>
                    {filteredSales.map((sale) => (
                        <div
                            key={sale.id}
                            onClick={() => handleSaleClick(sale)}
                            className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 active:bg-gray-50 transition-colors cursor-pointer'
                        >
                            <div className='flex justify-between items-start mb-3'>
                                <div>
                                    <div className='text-xs font-mono text-gray-500 mb-1'>
                                        {sale.id}
                                    </div>
                                    <div className='text-sm font-bold '>
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
                    ))}
                </div>
            )}

            {!isLoading && (
                <Table
                    columns={[
                        { header: 'Transaction ID', key: 'id' },
                        {
                            header: 'Date & Time',
                            renderRow: (sale) => (
                                <>
                                    <div className='text-sm font-medium'>{formatDate(sale.timestamp)}</div>
                                    <div className='text-xs text-gray-500'>{formatTime(sale.timestamp)}</div>
                                </>
                            )
                        },
                        {
                            header: 'Items',
                            align: 'center',
                            renderRow: (sale) => (
                                <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                    {sale.products.reduce((acc: number, p: { quantity: number }) => acc + p.quantity, 0)} items
                                </span>
                            )
                        },
                        {
                            header: 'Total Amount',
                            align: 'right',
                            renderRow: (sale) => <span className='text-sm font-bold'>Rp {sale.totalAmount.toLocaleString()}</span>
                        },
                    ]}
                    data={filteredSales}
                    onRowClick={handleSaleClick}
                    emptyState={{
                        icon: MdReceipt,
                        title: 'No sales found',
                        subtitle: 'Try adjusting your filters or search query',
                    }}
                />
            )}

            <SaleDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                sale={selectedSale}
            />
        </div>
    );
}
