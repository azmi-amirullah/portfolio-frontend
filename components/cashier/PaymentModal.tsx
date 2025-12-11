import { useState, useRef, useEffect } from 'react';
import { MdCreditCard } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface PaymentModalProps {
  isOpen: boolean;
  totalAmount: number;
  onConfirm: (paymentDetails: {
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && amountPaid) {
    setTimeout(() => {
      setAmountPaid('');
    }, 0);
  }

  const paidAmount = parseFloat(amountPaid) || 0;
  const changeAmount = paidAmount - totalAmount;
  const isValidPayment = paidAmount >= totalAmount && totalAmount > 0;

  const handleConfirm = () => {
    if (isValidPayment) {
      onConfirm({
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
      <div className='bg-blue-600 px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center'>
        <h3 className='text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3'>
          <MdCreditCard size={24} className='sm:w-7 sm:h-7' />
          Payment
        </h3>
      </div>

      {/* Content */}
      <div className='bg-white px-4 py-4 sm:px-6 sm:py-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='flex flex-col justify-center space-y-4'>
            <div className='bg-blue-50 rounded-2xl p-6 border-2 border-blue-100 text-center'>
              <div className='font-medium text-blue-600 mb-2 uppercase tracking-wide'>
                Total to Pay
              </div>
              <div className='text-4xl sm:text-5xl font-bold text-blue-600'>
                Rp {totalAmount.toLocaleString()}
              </div>
            </div>
            <p className='text-center text-gray-500'>
              Please ensure the customer pays the exact amount or more.
            </p>
          </div>

          <div className='space-y-5'>
            <div>
              <label className='block font-medium mb-2'>
                Amount Paid
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <span className='text-gray-500 font-bold'>Rp</span>
                </div>
                <input
                  ref={inputRef}
                  type='number'
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder='0'
                  className='block w-full pl-12 pr-4 py-4 text-2xl font-bold  border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
                  min='0'
                />
              </div>
            </div>

            <div
              className={`rounded-xl p-5 border-2 transition-all duration-200 ${amountPaid
                ? isValidPayment
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
                }`}
            >
              <div className='flex justify-between items-center mb-1'>
                <span
                  className={`font-bold ${amountPaid
                    ? isValidPayment
                      ? 'text-green-600'
                      : 'text-red-600'
                    : 'text-gray-500'
                    }`}
                >
                  {amountPaid
                    ? isValidPayment
                      ? 'Change Due'
                      : 'Insufficient Payment'
                    : 'Change'}
                </span>
              </div>
              <div
                className={`text-3xl font-bold ${amountPaid
                  ? isValidPayment
                    ? 'text-green-600'
                    : 'text-red-600'
                  : 'text-gray-500'
                  }`}
              >
                {amountPaid ? (
                  isValidPayment ? (
                    <>Rp {changeAmount.toLocaleString()}</>
                  ) : (
                    <>Rp {Math.abs(changeAmount).toLocaleString()} short</>
                  )
                ) : (
                  'Rp 0'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 flex gap-3 border-t border-gray-200'>
        <Button
          variant='outline'
          onClick={onCancel}
          className='flex-1 rounded-xl sm:text-base h-auto py-2.5 sm:py-3'
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!isValidPayment}
          className='flex-1 rounded-xl sm:text-base font-bold bg-blue-600 hover:bg-blue-700 h-auto py-2.5 sm:py-3'
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
