import Link from 'next/link';
import { MdDashboard, MdArrowBack, MdSettings, MdLogout } from 'react-icons/md';
import { NavItem } from './types';

interface DesktopSidebarProps {
  navItems: NavItem[];
  pathname: string;
  username: string;
  onSettingsOpen: () => void;
  onLogout: () => void;
}

export function DesktopSidebar({
  navItems,
  pathname,
  username,
  onSettingsOpen,
  onLogout,
}: DesktopSidebarProps) {
  const isActive = (path: string) => pathname === path;

  return (
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
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              isActive(item.path)
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
        <div className='bg-blue-200 rounded-xl p-3 space-y-3'>
          {/* User Profile */}
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-sm'>
              <span className='text-white font-medium'>
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className='font-medium text-gray-900 truncate flex-1'>
              {username}
            </p>
          </div>

          {/* Divider */}
          <div className='border-t border-blue-200' />

          {/* Action Buttons */}
          <div className='space-y-1'>
            <button
              onClick={onSettingsOpen}
              className='w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer'
            >
              <MdSettings size={18} />
              Settings
            </button>
            <button
              onClick={onLogout}
              className='w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer'
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
          className='flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors'
        >
          <MdArrowBack size={18} />
          Back to Portfolio
        </Link>

        {/* Copyright */}
        <div className='mt-4 pt-3 border-t border-gray-200'>
          <p className='text-[11px] text-gray-500 text-center'>
            &copy; {new Date().getFullYear()} Mohd Azmi Amirullah A
          </p>
        </div>
      </div>
    </aside>
  );
}
