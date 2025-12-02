import { useState, useRef, useEffect } from 'react';
import { MdCreditCard } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface PaymentModalProps {
  isOpen: boolean;
  totalAmount: number;
  onConfirm: (paymentDetails: {
    discount: number;
    taxRate: number;
    amountPaid: number;
  }) => void;
  onCancel: () => void;
}

export default function PaymentModal({
  isOpen,
  totalAmount,
  onConfirm,
  onCancel,
}: PaymentModalProps) {
  const [amountPaid, setAmountPaid] = useState('');
  const [discount, setDiscount] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal is visible
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset state when modal closes
  if (!isOpen && (amountPaid || discount || taxRate)) {
    // Use setTimeout to avoid synchronous setState in render
    setTimeout(() => {
      setAmountPaid('');
      setDiscount('');
      setTaxRate('');
    }, 0);
  }

  // Calculate final total with discount and tax
  const discountAmount = parseFloat(discount) || 0;
  const taxPercentage = parseFloat(taxRate) || 0;
  const subtotalAfterDiscount = totalAmount - discountAmount;
  const taxAmount = (subtotalAfterDiscount * taxPercentage) / 100;
  const finalTotal = subtotalAfterDiscount + taxAmount;

  const paidAmount = parseFloat(amountPaid) || 0;
  const changeAmount = paidAmount - finalTotal;
  const isValidPayment = paidAmount >= finalTotal && finalTotal > 0;

  const handleConfirm = () => {
    if (isValidPayment) {
      onConfirm({
        discount: discountAmount,
        taxRate: taxPercentage,
        amountPaid: paidAmount,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidPayment) {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      maxWidth='2xl'
      showCloseButton={false}
    >
      {/* Header */}
      <div className='bg-blue-600 px-6 py-4 flex justify-between items-center'>
        <h3 className='text-2xl font-bold text-white flex items-center gap-3'>
          <MdCreditCard size={28} />
          Payment
        </h3>
      </div>

      {/* Content */}
      <div className='bg-white px-6 py-6'>
        {/* Two Column Layout */}
        <div className='grid grid-cols-2 gap-6'>
          {/* Left Column - Inputs */}
          <div className='space-y-4'>
            {/* Subtotal */}
            <div className='bg-gray-50 rounded-xl p-4 border border-gray-200'>
              <div className='text-sm text-gray-600 mb-1'>Subtotal</div>
              <div className='text-2xl font-bold text-gray-900'>
                Rp {totalAmount.toLocaleString()}
              </div>
            </div>

            {/* Discount Input */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Discount (Rp)
              </label>
              <input
                type='number'
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder='Enter discount amount'
                className='block w-full px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                min='0'
                step='1000'
              />
            </div>

            {/* Tax Rate Input */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Tax (%)
              </label>
              <input
                type='number'
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder='Enter tax percentage'
                className='block w-full px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                min='0'
                max='100'
                step='1'
              />
            </div>

            {/* Calculation Breakdown */}
            <div className='bg-blue-50 rounded-xl p-4 border border-blue-200 space-y-2 text-sm'>
              <div className='flex justify-between text-gray-700'>
                <span>Subtotal:</span>
                <span>Rp {totalAmount.toLocaleString()}</span>
              </div>
              <div className='flex justify-between text-red-600'>
                <span>Discount:</span>
                <span>- Rp {discountAmount.toLocaleString()}</span>
              </div>
              <div className='flex justify-between text-gray-700'>
                <span>Tax ({taxPercentage}%):</span>
                <span>+ Rp {taxAmount.toLocaleString()}</span>
              </div>
              <div className='flex justify-between font-bold text-blue-700 text-base pt-2 border-t border-blue-300'>
                <span>Grand Total:</span>
                <span>Rp {finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Payment */}
          <div className='space-y-4'>
            {/* Grand Total Display */}
            <div className='bg-linear-to-r from-blue-500 to-blue-600 rounded-xl p-6 border-2 border-blue-400'>
              <div className='text-sm text-blue-100 mb-1'>Grand Total</div>
              <div className='text-4xl font-bold text-white'>
                Rp {finalTotal.toLocaleString()}
              </div>
            </div>

            {/* Amount Paid Input */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Amount Paid
              </label>
              <input
                ref={inputRef}
                type='number'
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder='Enter amount received'
                className='block w-full px-4 py-4 text-2xl border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                min='0'
                step='1000'
              />
            </div>

            {/* Change Display */}
            {amountPaid && (
              <div
                className={`rounded-xl p-6 border-2 ${
                  isValidPayment
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div className='text-sm font-medium mb-1'>
                  {isValidPayment ? (
                    <span className='text-green-700'>Change</span>
                  ) : (
                    <span className='text-red-700'>Insufficient Payment</span>
                  )}
                </div>
                <div
                  className={`text-3xl font-bold ${
                    isValidPayment ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {isValidPayment ? (
                    <>Rp {changeAmount.toLocaleString()}</>
                  ) : (
                    <>Rp {Math.abs(changeAmount).toLocaleString()} short</>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200'>
        <Button
          variant='outline'
          onClick={onCancel}
          className='flex-1 rounded-xl text-base h-auto py-3'
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!isValidPayment}
          className='flex-1 rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 h-auto py-3'
        >
          Confirm Payment
        </Button>
      </div>
    </Modal>
  );
}
