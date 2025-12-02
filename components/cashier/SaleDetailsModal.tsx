import Modal from '@/components/ui/Modal';
import { MdReceipt } from 'react-icons/md';

interface SaleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: {
    id: string;
    productName: string;
    productPrice: number;
    quantity: number;
    timestamp: number;
    discount?: number;
    taxRate?: number;
    amountPaid?: number;
  } | null;
}

export default function SaleDetailsModal({
  isOpen,
  onClose,
  sale,
}: SaleDetailsModalProps) {
  if (!sale) return null;

  const subtotal = sale.productPrice * sale.quantity;
  const discount = sale.discount || 0;
  const taxRate = sale.taxRate || 0;
  const subtotalAfterDiscount = subtotal - discount;
  const taxAmount = (subtotalAfterDiscount * taxRate) / 100;
  const grandTotal = subtotalAfterDiscount + taxAmount;
  const amountPaid = sale.amountPaid || grandTotal;
  const change = amountPaid - grandTotal;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='lg'
      title='Sale Details'
      headerIcon={<MdReceipt size={28} />}
      headerClassName='bg-blue-600 border-blue-400 text-white'
    >
      {/* Content */}
      <div className='bg-white px-6 py-6 space-y-6'>
        {/* Date & Time */}
        <div className='bg-gray-50 rounded-xl p-4 border border-gray-200'>
          <div className='text-sm text-gray-600 mb-1'>Transaction Date</div>
          <div className='text-lg font-bold text-gray-900'>
            {formatDate(sale.timestamp)}
          </div>
          <div className='text-sm text-gray-500'>
            {formatTime(sale.timestamp)}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h4 className='text-sm font-medium text-gray-700 mb-3'>Product</h4>
          <div className='bg-gray-50 rounded-xl p-4 border border-gray-200'>
            <div className='flex justify-between items-center mb-2'>
              <span className='font-semibold text-gray-900'>
                {sale.productName}
              </span>
              <span className='text-gray-600'>
                Rp {sale.productPrice.toLocaleString()}
              </span>
            </div>
            <div className='flex justify-between items-center text-sm'>
              <span className='text-gray-600'>Quantity</span>
              <span className='font-semibold text-gray-900'>
                {sale.quantity}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div>
          <h4 className='text-sm font-medium text-gray-700 mb-3'>
            Payment Details
          </h4>
          <div className='bg-blue-50 rounded-xl p-4 border border-blue-200 space-y-2 text-sm'>
            <div className='flex justify-between text-gray-700'>
              <span>Subtotal:</span>
              <span>Rp {subtotal.toLocaleString()}</span>
            </div>
            <div className='flex justify-between text-red-600'>
              <span>Discount:</span>
              <span>- Rp {discount.toLocaleString()}</span>
            </div>
            <div className='flex justify-between text-gray-700'>
              <span>Tax ({taxRate}%):</span>
              <span>+ Rp {taxAmount.toLocaleString()}</span>
            </div>
            <div className='flex justify-between font-bold text-blue-700 text-base pt-2 border-t border-blue-300'>
              <span>Grand Total:</span>
              <span>Rp {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Amount Paid & Change */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-gray-50 rounded-xl p-4 border border-gray-200'>
            <div className='text-sm text-gray-600 mb-1'>Amount Paid</div>
            <div className='text-xl font-bold text-gray-900'>
              Rp {amountPaid.toLocaleString()}
            </div>
          </div>
          <div className='bg-green-50 rounded-xl p-4 border border-green-200'>
            <div className='text-sm text-green-700 mb-1'>Change</div>
            <div className='text-xl font-bold text-green-700'>
              Rp {change.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
