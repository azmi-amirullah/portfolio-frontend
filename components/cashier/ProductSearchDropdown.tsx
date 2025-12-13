'use client';

import { useRef, useEffect, useMemo } from 'react';
import { MdSearch, MdClose, MdQrCodeScanner } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import { Product } from '@/lib/services/cashier-service';

interface ProductSearchDropdownProps {
  products: Product[];
  searchTerm: string;
  showDropdown: boolean;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onDropdownChange: (show: boolean) => void;
  onProductSelect: (product: Product) => void;
  onScannerOpen: () => void;
}

export function ProductSearchDropdown({
  products,
  searchTerm,
  showDropdown,
  isLoading = false,
  onSearchChange,
  onDropdownChange,
  onProductSelect,
  onScannerOpen,
}: ProductSearchDropdownProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        onDropdownChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onDropdownChange]);

  const filteredProducts = useMemo(
    () =>
      searchTerm
        ? products.filter(
            (p) =>
              p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.barcode.includes(searchTerm)
          )
        : [],
    [products, searchTerm]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
    onDropdownChange(!!value);
  };

  const handleClear = () => {
    onSearchChange('');
    onDropdownChange(false);
    searchInputRef.current?.focus();
  };

  const handleProductClick = (product: Product) => {
    onProductSelect(product);
    onSearchChange('');
    onDropdownChange(false);
    searchInputRef.current?.focus();
  };

  return (
    <div className='relative z-30'>
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none'>
          <MdSearch className='h-5 w-5 lg:h-6 lg:w-6 text-gray-500' />
        </div>
        <input
          ref={searchInputRef}
          type='text'
          placeholder={
            isLoading ? 'Loading products...' : 'Scan or search product...'
          }
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => onDropdownChange(!!searchTerm)}
          disabled={isLoading}
          className='block w-full pl-10 lg:pl-12 pr-12 py-3 lg:py-4 border border-gray-200 rounded-lg lg:rounded-xl shadow-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-base lg:text-xl disabled:opacity-50 disabled:cursor-not-allowed'
          autoFocus
        />
        <div className='absolute inset-y-0 right-0 flex items-center pr-2'>
          {searchTerm && (
            <Button
              variant='ghost'
              onClick={handleClear}
              className='text-gray-500 hover:text-gray-900 p-2 h-auto'
            >
              <MdClose size={20} />
            </Button>
          )}
          <Button
            variant='ghost'
            onClick={onScannerOpen}
            className='text-gray-500 hover:text-blue-600 p-2 h-auto'
          >
            <MdQrCodeScanner size={24} />
          </Button>
        </div>
      </div>

      {showDropdown && filteredProducts.length > 0 && (
        <div
          ref={dropdownRef}
          className='absolute mt-2 w-full bg-white rounded-lg lg:rounded-xl shadow-2xl border border-gray-200 max-h-80 lg:max-h-96 overflow-y-auto'
        >
          {filteredProducts.map((product) => (
            <Button
              key={product.id}
              variant='ghost'
              onClick={() => handleProductClick(product)}
              className='w-full text-left px-4 lg:px-6 py-3 lg:py-4 hover:bg-blue-50 flex justify-between items-center border-b border-gray-200 last:border-0 transition-colors h-auto rounded-none'
            >
              <div>
                <div className='font-medium text-base lg:text-lg'>
                  {product.name}
                </div>
                <div className='text-gray-500'>Barcode: {product.barcode}</div>
              </div>
              <div className='font-bold text-blue-600 text-base lg:text-lg'>
                Rp {product.price.toLocaleString()}
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
