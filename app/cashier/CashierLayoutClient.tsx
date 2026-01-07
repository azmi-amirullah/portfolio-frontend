'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, startTransition } from 'react';
import {
  MdShoppingCart,
  MdInventory,
  MdHistory,
  MdDashboard,
} from 'react-icons/md';
import { authService } from '@/lib/services/auth-service';
import { cashierService } from '@/lib/services/cashier-service';
import { TextSizeProvider } from '@/lib/context/TextSizeContext';
import SettingsModal from '@/components/cashier/SettingsModal';
import Loading from '@/components/ui/Loading';
import {
  MobileHeader,
  MobileOverlayMenu,
  DesktopSidebar,
  BottomNav,
  NavItem,
} from '@/components/cashier/layout';

const NAV_ITEMS: NavItem[] = [
  { path: '/cashier/pos', icon: MdShoppingCart, label: 'POS' },
  { path: '/cashier/inventory', icon: MdInventory, label: 'Inventory' },
  { path: '/cashier/history', icon: MdHistory, label: 'History' },
  { path: '/cashier/dashboard', icon: MdDashboard, label: 'Dashboard' },
];

export default function CashierLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('User');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const user = await authService.getUser();
        setUsername(user?.username || user?.email?.split('@')[0] || 'User');
      }

      setIsMounted(true);
    };

    startTransition(() => {
      checkAuth();
    });
  }, [pathname]);

  // Close mobile menu on route change & Scroll to top
  useEffect(() => {
    startTransition(() => {
      setIsMobileMenuOpen(false);
      if (mainContentRef.current) {
        mainContentRef.current.scrollTop = 0;
      }
    });
  }, [pathname]);

  useEffect(() => {
    const checkAndFetchData = async () => {
      if (isMounted && isAuthenticated) {
        const hasData = await cashierService.hasData();
        if (!hasData) {
          await cashierService.syncWithBackend();
        }
      }
    };
    checkAndFetchData();
  }, [isMounted, isAuthenticated]);

  // Login page - render children only
  if (pathname === '/cashier') {
    return <>{children}</>;
  }

  // Loading state
  if (!isMounted) {
    return (
      <div className='min-h-dvh flex items-center justify-center bg-gray-50'>
        <Loading />
      </div>
    );
  }

  const handleLogout = async () => {
    await authService.logout();
    router.replace('/cashier');
  };

  return (
    <TextSizeProvider>
      <div className='flex h-dvh bg-gray-50'>
        <MobileHeader
          isMobileMenuOpen={isMobileMenuOpen}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <MobileOverlayMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          navItems={NAV_ITEMS}
          pathname={pathname}
          username={username}
          onSettingsOpen={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
        />

        <DesktopSidebar
          navItems={NAV_ITEMS}
          pathname={pathname}
          username={username}
          onSettingsOpen={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
        />

        <BottomNav navItems={NAV_ITEMS} pathname={pathname} />

        {/* Main Content */}
        <main
          ref={mainContentRef}
          className='flex-1 lg:ml-64 overflow-y-auto text-gray-900'
        >
          <div className='py-18 p-4 lg:p-8'>
            <div className='max-w-7xl mx-auto'>{children}</div>
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
