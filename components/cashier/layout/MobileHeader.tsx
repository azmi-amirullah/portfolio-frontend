import { MdDashboard, MdMenu, MdClose } from 'react-icons/md';

interface MobileHeaderProps {
    isMobileMenuOpen: boolean;
    onMenuToggle: () => void;
}

export function MobileHeader({
    isMobileMenuOpen,
    onMenuToggle,
}: MobileHeaderProps) {
    return (
        <div className='lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50'>
            <h1 className='text-lg font-bold flex items-center gap-2'>
                <MdDashboard className='text-blue-600' size={20} />
                Mini Market
            </h1>
            <button
                onClick={onMenuToggle}
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
    );
}
