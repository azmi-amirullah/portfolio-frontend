'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    MdArrowBack,
    MdShoppingCart,
    MdInventory,
    MdDashboard,
    MdHistory,
    MdMenu,
    MdClose,
    MdLogout,
} from 'react-icons/md';
import { authService } from '@/lib/services/auth-service';
import { cashierService } from '@/lib/services/cashier-service';

export default function CashierLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsMounted(true), 0);
    }, []);

    useEffect(() => {
        // Redirect to login if not authenticated and not on login page
        if (isMounted && !authService.isAuthenticated() && pathname !== '/cashier') {
            router.replace('/cashier');
        }
    }, [isMounted, pathname, router]);

    useEffect(() => {
        const checkAndFetchData = async () => {
            if (isMounted && authService.isAuthenticated()) {
                if (!cashierService.hasData()) {
                    await cashierService.syncWithBackend();
                }
            }
        };
        checkAndFetchData();
    }, [isMounted]);

    // Don't render layout elements on login page
    if (pathname === '/cashier') {
        return <>{children}</>;
    }

    const isActive = (path: string) => pathname === path;

    const handleLogout = () => {
        authService.logout();
        router.replace('/cashier');
    };



    const navItems = [
        { path: '/cashier/pos', icon: MdShoppingCart, label: 'POS' },
        { path: '/cashier/inventory', icon: MdInventory, label: 'Inventory' },
        { path: '/cashier/history', icon: MdHistory, label: 'History' },
    ];

    return (
        <div className='flex h-screen bg-gray-50'>
            {/* Mobile Header */}
            <div className='lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50'>
                <h1 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                    <MdDashboard className='text-blue-600' size={20} />
                    Mini Market
                </h1>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
                    aria-label='Toggle menu'
                >
                    {isMobileMenuOpen ? (
                        <MdClose size={24} className='text-gray-600' />
                    ) : (
                        <MdMenu size={24} className='text-gray-600' />
                    )}
                </button>
            </div>

            {/* Mobile Overlay Menu */}
            {isMobileMenuOpen && (
                <div
                    className='lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40'
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div
                        className='absolute top-14 left-0 right-0 bg-white border-b border-gray-200 shadow-lg'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <nav className='p-4 space-y-2'>
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(item.path)
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                </Link>
                            ))}

                            <button
                                onClick={handleLogout}
                                className='w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer'
                            >
                                <MdLogout size={20} />
                                Logout
                            </button>
                            <Link
                                href='/'
                                onClick={() => setIsMobileMenuOpen(false)}
                                className='flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors border-t border-gray-200 mt-2 pt-4'
                            >
                                <MdArrowBack size={20} />
                                Back to Portfolio
                            </Link>
                        </nav>

                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className='hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col fixed h-full z-20'>
                <div className='h-16 flex items-center px-6 border-b border-gray-200'>
                    <h1 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
                        <MdDashboard className='text-blue-600' />
                        Mini Market
                    </h1>
                </div>

                <nav className='flex-1 p-4 space-y-2'>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(item.path)
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className='p-4 border-t border-gray-200 space-y-2'>

                    <button
                        onClick={handleLogout}
                        className='w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer'
                    >
                        <MdLogout size={20} />
                        Logout
                    </button>
                    <Link
                        href='/'
                        className='flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors'
                    >
                        <MdArrowBack size={20} />
                        Back to Portfolio
                    </Link>
                </div>
            </aside>

            {/* Bottom Navigation (Mobile) */}
            <nav className='lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-inset-bottom'>
                <div className='flex justify-around items-center h-16'>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive(item.path)
                                ? 'text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <item.icon size={24} />
                            <span className='text-xs mt-1 font-medium'>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Main Content */}
            <main className='flex-1 lg:ml-64 overflow-y-auto'>
                <div className='pt-18 pb-16 p-4 lg:p-8'>
                    <div className='max-w-7xl mx-auto'>{children}</div>
                </div>
            </main>
        </div>
    );
}
