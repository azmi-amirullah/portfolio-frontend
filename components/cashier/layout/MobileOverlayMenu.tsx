import Link from 'next/link';
import { MdArrowBack, MdSettings, MdLogout } from 'react-icons/md';
import { NavItem } from './types';

interface MobileOverlayMenuProps {
    isOpen: boolean;
    onClose: () => void;
    navItems: NavItem[];
    pathname: string;
    username: string;
    onSettingsOpen: () => void;
    onLogout: () => void;
}

export function MobileOverlayMenu({
    isOpen,
    onClose,
    navItems,
    pathname,
    username,
    onSettingsOpen,
    onLogout,
}: MobileOverlayMenuProps) {
    if (!isOpen) return null;

    const isActive = (path: string) => pathname === path;

    return (
        <div
            className='lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40'
            onClick={onClose}
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
                            <p className='font-medium text-gray-900 truncate flex-1'>
                                {username}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className='border-t border-blue-100' />

                        {/* Action Buttons */}
                        <div className='space-y-1'>
                            <button
                                onClick={() => {
                                    onClose();
                                    onSettingsOpen();
                                }}
                                className='w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-gray-500 hover:bg-blue-100/60 transition-colors cursor-pointer'
                            >
                                <MdSettings size={18} />
                                Settings
                            </button>
                            <button
                                onClick={onLogout}
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
                        className='flex items-center gap-3 px-4 py-3 mt-3 rounded-lg font-medium text-gray-500 hover:bg-gray-50 transition-colors'
                    >
                        <MdArrowBack size={18} />
                        Back to Portfolio
                    </Link>
                </nav>
            </div>
        </div>
    );
}
