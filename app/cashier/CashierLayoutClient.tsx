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
    MdSettings,
} from 'react-icons/md';
import { authService } from '@/lib/services/auth-service';
import { cashierService } from '@/lib/services/cashier-service';
import { TextSizeProvider } from '@/lib/context/TextSizeContext';
import SettingsModal from '@/components/cashier/SettingsModal';
import Loading from '@/components/ui/Loading';

export default function CashierLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [username, setUsername] = useState('User');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        queueMicrotask(() => {
            const user = authService.getUser();
            setUsername(user?.username || 'User');
            setIsMounted(true);
        });
    }, [pathname]);

    useEffect(() => {
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

    if (pathname === '/cashier') {
        return <>{children}</>;
    }

    if (!isMounted) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <Loading />
            </div>
        );
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
        <TextSizeProvider>
            <div className='flex h-screen bg-gray-50'>
                {/* Mobile Header */}
                <div className='lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50'>
                    <h1 className='text-lg font-bold flex items-center gap-2'>
                        <MdDashboard className='text-blue-600' size={20} />
                        Mini Market
                    </h1>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
                        aria-label='Toggle menu'
                    >
                        {isMobileMenuOpen ? (
                            <MdClose size={24} className='text-gray-500' />
                        ) : (
                            <MdMenu size={24} className='text-gray-500' />
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
                            <nav className='p-4'>
                                {/* Navigation Links */}
                                <div className='space-y-1 mb-4'>
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.path}
                                            href={item.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive(item.path)
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            <item.icon size={20} />
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>

                                {/* Divider */}
                                <div className='border-t border-gray-200 mb-4' />

                                {/* User & Actions Section */}
                                <div className='bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-3 space-y-3'>
                                    {/* User Profile */}
                                    <div className='flex items-center gap-3'>
                                        <div className='w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm'>
                                            <span className='text-white font-medium'>
                                                {username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <p className='font-medium text-gray-900 truncate flex-1'>{username}</p>
                                    </div>

                                    {/* Divider */}
                                    <div className='border-t border-blue-100' />

                                    {/* Action Buttons */}
                                    <div className='space-y-1'>
                                        <button
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                setIsSettingsOpen(true);
                                            }}
                                            className='w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-gray-500 hover:bg-blue-100/60 transition-colors cursor-pointer'
                                        >
                                            <MdSettings size={18} />
                                            Settings
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className='w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-red-600 hover:bg-red-100/60 transition-colors cursor-pointer'
                                        >
                                            <MdLogout size={18} />
                                            Logout
                                        </button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className='border-t border-gray-200 mt-4' />

                                {/* Back Link */}
                                <Link
                                    href='/'
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className='flex items-center gap-3 px-4 py-3 mt-3 rounded-lg font-medium text-gray-500 hover:bg-gray-50 transition-colors'
                                >
                                    <MdArrowBack size={18} />
                                    Back to Portfolio
                                </Link>
                            </nav>

                        </div>
                    </div>
                )}

                {/* Desktop Sidebar */}
                <aside className='hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col fixed h-full'>
                    <div className='h-16 flex items-center px-6 border-b border-gray-200'>
                        <h1 className='text-xl font-bold flex items-center gap-2'>
                            <MdDashboard className='text-blue-600' />
                            Mini Market
                        </h1>
                    </div>

                    <nav className='flex-1 p-4 space-y-2'>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive(item.path)
                                    ? 'text-blue-600'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className='p-4 border-t border-gray-200'>
                        {/* User & Actions Card */}
                        <div className='bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-3 space-y-3'>
                            {/* User Profile */}
                            <div className='flex items-center gap-3'>
                                <div className='w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm'>
                                    <span className='text-white font-medium'>
                                        {username.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <p className='font-medium text-gray-900 truncate flex-1'>{username}</p>
                            </div>

                            {/* Divider */}
                            <div className='border-t border-blue-100' />

                            {/* Action Buttons */}
                            <div className='space-y-1'>
                                <button
                                    onClick={() => setIsSettingsOpen(true)}
                                    className='w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-gray-500 hover:bg-blue-100/60 transition-colors cursor-pointer'
                                >
                                    <MdSettings size={18} />
                                    Settings
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className='w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-red-600 hover:bg-red-100/60 transition-colors cursor-pointer'
                                >
                                    <MdLogout size={18} />
                                    Logout
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className='my-3 border-t border-gray-200' />

                        {/* Back Link */}
                        <Link
                            href='/'
                            className='flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors'
                        >
                            <MdArrowBack size={18} />
                            Back to Portfolio
                        </Link>

                        {/* Copyright */}
                        <div className='mt-4 pt-3 border-t border-gray-100'>
                            <p className='text-[11px] text-gray-500 text-center'>
                                &copy; {new Date().getFullYear()} Mohd Azmi Amirullah A
                            </p>
                        </div>
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
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon size={24} />
                                <span className='mt-1 font-medium'>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Main Content */}
                <main className='flex-1 lg:ml-64 overflow-y-auto text-gray-900'>
                    <div className='pt-18 pb-16 p-4 lg:p-8'>
                        <div className='max-w-7xl mx-auto'>
                            {/* <div className='bg-amber-50 border border-amber-200 rounded-lg py-2 px-4 mb-4'>
                            <p className='text-amber-800'>
                                <span className='font-medium'>⚠️ Note:</span> First API request may take 30-60s due to server cold start.
                            </p>
                        </div> */}
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </TextSizeProvider>
    );
}
