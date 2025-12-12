'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Product, cashierService } from '@/lib/services/cashier-service';
import { MdShoppingCart, MdCreditCard } from 'react-icons/md';
import { BarcodeScanner } from '@/components/cashier/BarcodeScanner';
import { toast } from 'react-toastify';
import PaymentModal from '@/components/cashier/PaymentModal';
import { Button } from '@/components/ui/Button';
import { playSuccessBeep } from '@/lib/sound-utils';
import { useCart } from '@/lib/hooks/useCart';
import { MobileCartItem } from '@/components/cashier/MobileCartItem';
import { DesktopCartRow } from '@/components/cashier/DesktopCartRow';
import { ProductSearchDropdown } from '@/components/cashier/ProductSearchDropdown';

const SCAN_DEBOUNCE_MS = 2000;

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const lastScannedRef = useRef<string | null>(null);
  const lastScannedTimeRef = useRef<number>(0);

  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalAmount,
  } = useCart();

  useEffect(() => {
    cashierService.getProducts().then(setProducts);
  }, []);

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

    try {
      await cashierService.processSale(salesData, {
        amountPaid: paymentDetails.amountPaid,
        grandTotal,
      });
      clearCart();
      setShowPaymentModal(false);
      toast.success('Payment successful!');
    } catch (error) {
      console.error('Payment processing failed:', error);
      toast.error('Payment failed. Please try again.');
    }
  };

  const handleScanResult = useCallback(
    (result: string) => {
      const now = Date.now();
      if (
        result === lastScannedRef.current &&
        now - lastScannedTimeRef.current < SCAN_DEBOUNCE_MS
      ) {
        return;
      }

      lastScannedRef.current = result;
      lastScannedTimeRef.current = now;

      const product = products.find((p) => p.barcode === result);

      if (product) {
        addToCart(product);
        playSuccessBeep();
        toast.success(`Added ${product.name}`);
      } else {
        toast.error(`Product not found`, { autoClose: 2000 });
      }
    },
    [products, addToCart]
  );

  return (
    <div className='flex flex-col h-[calc(100dvh-10rem)] lg:h-[calc(100dvh-4rem)] gap-4 lg:gap-6'>
      <ProductSearchDropdown
        products={products}
        searchTerm={searchTerm}
        showDropdown={showDropdown}
        onSearchChange={setSearchTerm}
        onDropdownChange={setShowDropdown}
        onProductSelect={addToCart}
        onScannerOpen={() => setShowScanner(true)}
      />

      {/* Main Cart Area */}
      <div className='flex-1 bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden'>
        <div className='p-4 lg:p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center'>
          <h2 className='text-lg lg:text-2xl font-bold flex items-center gap-2 lg:gap-3'>
            <MdShoppingCart className='text-blue-600' size={24} />
            <span className='hidden sm:inline'>Current Order</span>
            <span className='sm:hidden'>Cart</span>
          </h2>
          <div className='text-gray-500'>{cart.length} items</div>
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
              <p className='text-gray-500'>
                Scan or search for products to add them to cart
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className='lg:hidden space-y-3'>
                {cart.map((item) => (
                  <MobileCartItem
                    key={item.id}
                    item={item}
                    onRemove={removeFromCart}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>

              {/* Desktop Table Layout */}
              <table className='hidden lg:table min-w-full divide-y divide-gray-200'>
                <thead className='bg-white sticky top-0 z-10'>
                  <tr>
                    <th className='px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                      Product
                    </th>
                    <th className='px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider'>
                      Price
                    </th>
                    <th className='px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider'>
                      Quantity
                    </th>
                    <th className='px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider'>
                      Total
                    </th>
                    <th className='px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider'></th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {cart.map((item) => (
                    <DesktopCartRow
                      key={item.id}
                      item={item}
                      onRemove={removeFromCart}
                      onUpdateQuantity={updateQuantity}
                    />
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Footer / Payment */}
        <div className='p-4 lg:p-6 border-t border-gray-200 bg-gray-50'>
          <div className='flex justify-between items-center mb-4 lg:mb-6'>
            <span className='text-lg lg:text-2xl font-bold'>Total Amount</span>
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
