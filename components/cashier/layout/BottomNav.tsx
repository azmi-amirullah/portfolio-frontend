import Link from 'next/link';
import { NavItem } from './types';

interface BottomNavProps {
    navItems: NavItem[];
    pathname: string;
}

export function BottomNav({ navItems, pathname }: BottomNavProps) {
    const isActive = (path: string) => pathname === path;

    return (
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
    );
}
