'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Product, cashierService } from '@/lib/services/cashier-service';
import {
  MdSearch,
  MdShoppingCart,
  MdDelete,
  MdAdd,
  MdRemove,
  MdCreditCard,
  MdClose,
  MdQrCodeScanner,
} from 'react-icons/md';
import { BarcodeScanner } from '@/components/cashier/BarcodeScanner';
import { toast } from 'react-toastify';
import PaymentModal from '@/components/cashier/PaymentModal';
import { Button } from '@/components/ui/Button';

interface CartItem extends Product {
  quantity: number;
}

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const lastScannedRef = useRef<string | null>(null);
  const lastScannedTimeRef = useRef<number>(0);

  useEffect(() => {
    cashierService.getProducts().then(setProducts);
    searchInputRef.current?.focus();

    // Click outside to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setSearchTerm('');
    setShowDropdown(false);
    searchInputRef.current?.focus();
  }, []);

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(!!value);
  };

  const handlePayment = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async (paymentDetails: {
    amountPaid: number;
  }) => {
    const salesData = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
      buyPrice: item.buyPrice,
      name: item.name,
      barcode: item.barcode,
    }));

    const grandTotal = totalAmount;

    await cashierService.processSale(salesData, {
      amountPaid: paymentDetails.amountPaid,
      grandTotal,
    });
    setCart([]);
    setShowPaymentModal(false);
    toast.success('Payment successful!');
  };

  const handleScanResult = useCallback(
    (result: string) => {
      const now = Date.now();
      if (
        result === lastScannedRef.current &&
        now - lastScannedTimeRef.current < 2000
      ) {
        return;
      }

      lastScannedRef.current = result;
      lastScannedTimeRef.current = now;

      const product = products.find((p) => p.barcode === result);

      if (product) {
        addToCart(product);
        toast.success(`Added ${product.name}`);
      } else {
        toast.error(`Product not found`, { autoClose: 2000 });
      }
    },
    [products, addToCart]
  );

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const filteredProducts = searchTerm
    ? products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.includes(searchTerm)
    )
    : [];

  return (
    <div className='flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-4rem)] gap-4 lg:gap-6'>
      {/* Top Search Bar */}
      <div className='relative z-30'>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none'>
            <MdSearch className='h-5 w-5 lg:h-6 lg:w-6 text-gray-500' />
          </div>
          <input
            ref={searchInputRef}
            type='text'
            placeholder='Scan barcode or search product...'
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(!!searchTerm)}
            className='block w-full pl-10 lg:pl-12 pr-24 py-3 lg:py-4 border border-gray-300 rounded-lg lg:rounded-xl shadow-sm leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base lg:text-xl'
            autoFocus
          />
          <div className='absolute inset-y-0 right-0 flex items-center pr-2'>
            {searchTerm && (
              <Button
                variant='ghost'
                onClick={() => {
                  setSearchTerm('');
                  setShowDropdown(false);
                  searchInputRef.current?.focus();
                }}
                className='text-gray-500 hover:text-gray-900 p-2 h-auto'
              >
                <MdClose size={20} />
              </Button>
            )}
            <Button
              variant='ghost'
              onClick={() => setShowScanner(true)}
              className='text-gray-500 hover:text-blue-600 p-2 h-auto'
            >
              <MdQrCodeScanner size={24} />
            </Button>
          </div>
        </div>

        {/* Dropdown Results */}
        {showDropdown && filteredProducts.length > 0 && (
          <div
            ref={dropdownRef}
            className='absolute mt-2 w-full bg-white rounded-lg lg:rounded-xl shadow-2xl border border-gray-200 max-h-80 lg:max-h-96 overflow-y-auto'
          >
            {filteredProducts.map((product) => (
              <Button
                key={product.id}
                variant='ghost'
                onClick={() => addToCart(product)}
                className='w-full text-left px-4 lg:px-6 py-3 lg:py-4 hover:bg-blue-50 flex justify-between items-center border-b border-gray-100 last:border-0 transition-colors h-auto rounded-none'
              >
                <div>
                  <div className='font-semibold text-base lg:text-lg '>
                    {product.name}
                  </div>
                  <div className='text-xs lg:text-sm text-gray-500'>
                    Barcode: {product.barcode}
                  </div>
                </div>
                <div className='font-bold text-blue-600 text-base lg:text-lg'>
                  Rp {product.price.toLocaleString()}
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Main Cart Area */}
      <div className='flex-1 bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden'>
        <div className='p-4 lg:p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center'>
          <h2 className='text-lg lg:text-2xl font-bold flex items-center gap-2 lg:gap-3'>
            <MdShoppingCart className='text-blue-600' size={24} />
            <span className='hidden sm:inline'>Current Order</span>
            <span className='sm:hidden'>Cart</span>
          </h2>
          <div className='text-xs lg:text-sm text-gray-500'>
            {cart.length} items
          </div>
        </div>

        <div className='flex-1 overflow-y-auto p-3 lg:p-6'>
          {cart.length === 0 ? (
            <div className='h-full flex flex-col items-center justify-center text-center px-4'>
              <div className='bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                <MdShoppingCart size={32} className='text-gray-500' />
              </div>
              <h3 className='text-lg font-medium text-gray-500 mb-1'>
                Cart is empty
              </h3>
              <p className='text-gray-500 text-sm'>
                Scan or search for products to add them to cart
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className='lg:hidden space-y-3'>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className='bg-gray-50 rounded-lg p-3 border border-gray-200'
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <div className='flex-1'>
                        <div className='font-semibold '>
                          {item.name}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {item.barcode}
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => removeFromCart(item.id)}
                        className='text-red-600 hover:text-red-800 h-8 w-8'
                      >
                        <MdDelete size={18} />
                      </Button>
                    </div>
                    <div className='flex justify-between items-center'>
                      <div className='text-sm text-gray-500'>
                        Rp {item.price.toLocaleString()}
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => updateQuantity(item.id, -1)}
                          className='rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 h-8 w-8'
                        >
                          <MdRemove size={16} />
                        </Button>
                        <span className='text-base font-semibold w-8 text-center'>
                          {item.quantity}
                        </span>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => updateQuantity(item.id, 1)}
                          className='rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 h-8 w-8'
                        >
                          <MdAdd size={16} />
                        </Button>
                      </div>
                      <div className='font-bold '>
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <table className='hidden lg:table min-w-full divide-y divide-gray-200'>
                <thead className='bg-white sticky top-0 z-10'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Product
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Price
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Quantity
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Total
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'></th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {cart.map((item) => (
                    <tr
                      key={item.id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-lg font-medium '>
                          {item.name}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {item.barcode}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center text-gray-500'>
                        Rp {item.price.toLocaleString()}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex justify-center items-center gap-3'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => updateQuantity(item.id, -1)}
                            className='rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 h-8 w-8'
                          >
                            <MdRemove size={16} />
                          </Button>
                          <span className='text-lg font-semibold w-8 text-center'>
                            {item.quantity}
                          </span>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => updateQuantity(item.id, 1)}
                            className='rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 h-8 w-8'
                          >
                            <MdAdd size={16} />
                          </Button>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right font-bold  text-lg'>
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => removeFromCart(item.id)}
                          className='text-red-600 hover:text-red-800'
                        >
                          <MdDelete size={20} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Footer / Payment */}
        <div className='p-4 lg:p-6 border-t border-gray-200 bg-gray-50'>
          <div className='flex justify-between items-center mb-4 lg:mb-6'>
            <span className='text-lg lg:text-2xl font-bold'>
              Total Amount
            </span>
            <span className='text-2xl lg:text-4xl font-bold text-blue-600'>
              Rp {totalAmount.toLocaleString()}
            </span>
          </div>
          <Button
            onClick={handlePayment}
            disabled={cart.length === 0}
            className='w-full py-4 lg:py-5 px-4 lg:px-6 bg-blue-600 text-white rounded-lg lg:rounded-xl text-base lg:text-xl font-bold hover:bg-blue-700 h-auto shadow-lg'
          >
            <MdCreditCard size={24} className='mr-2 lg:mr-3' />
            Process Payment
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        totalAmount={totalAmount}
        onConfirm={handleConfirmPayment}
        onCancel={() => setShowPaymentModal(false)}
      />

      {showScanner && (
        <BarcodeScanner
          onResult={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
