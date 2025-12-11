import Modal from '@/components/ui/Modal';
import { MdReceipt } from 'react-icons/md';
import { Transaction } from '@/lib/services/cashier-service';

interface SaleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Transaction | null;
}

export default function SaleDetailsModal({
  isOpen,
  onClose,
  sale,
}: SaleDetailsModalProps) {
  if (!sale) return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='lg'
      title={`Transaction #${sale.id}`}
      headerIcon={<MdReceipt size={28} />}
      headerClassName='bg-blue-600 border-blue-400 text-white'
    >
      {/* Content */}
      <div className='bg-white px-4 py-4 sm:px-6 sm:py-6 space-y-8'>
        {/* Top Section: Date & Time */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='bg-gray-50 rounded-2xl p-5 border border-gray-200 flex flex-col justify-center'>
            <div className='text-gray-500 mb-1'>Date</div>
            <div className='text-base font-bold '>
              {formatDate(sale.timestamp)}
            </div>
          </div>
          <div className='bg-gray-50 rounded-2xl p-5 border border-gray-200 flex flex-col justify-center'>
            <div className='text-gray-500 mb-1'>Time</div>
            <div className='text-base font-bold '>
              {formatTime(sale.timestamp)}
            </div>
          </div>
        </div>

        {/* Middle Section: Products List */}
        <div className='space-y-3'>
          <h4 className='font-bold text-gray-500 uppercase tracking-wider'>
            Items Purchased
          </h4>
          <div className='bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden'>
            <div className='divide-y divide-gray-200'>
              {sale.products.map((product, index) => (
                <div key={index} className='p-4 border-b border-gray-200 last:border-0'>
                  {/* Row 1: Name & Price */}
                  <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 sm:mb-1 gap-1 sm:gap-0'>
                    <div className='font-bold text-gray-900'>
                      {product.productName} <span className='text-gray-500 font-normal'>@{product.price.toLocaleString()} x {product.quantity}</span>
                    </div>
                    <div className='font-bold text-gray-900'>
                      Rp {(product.price * product.quantity).toLocaleString()}
                    </div>
                  </div>
                  {/* Row 2: Buy Price & Total Cost */}
                  <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:mb-1 gap-1 sm:gap-0'>
                    <div className='text-gray-500'>
                      Buy Price: {product.buyPrice ? product.buyPrice.toLocaleString() : 0} x {product.quantity}
                    </div>
                    <div className='text-gray-500'>
                      Rp {((product.buyPrice || 0) * product.quantity).toLocaleString()}
                    </div>
                  </div>
                  {/* Row 3: Margin */}
                  <div className='text-left sm:text-right'>
                    <span className='text-gray-500 mr-2'>Margin:</span>
                    <span className='text-green-600 font-medium'>
                      Rp {((product.price - (product.buyPrice || 0)) * product.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Financial Dashboard */}
        <div className='space-y-3'>
          <h4 className='font-bold text-gray-500 uppercase tracking-wider'>
            Payment Summary
          </h4>
          <div className='grid grid-cols-1 gap-3'>
            {/* Total Transaction */}
            <div className='bg-blue-600 rounded-xl p-3 text-white flex justify-between items-center'>
              <div className='font-medium'>
                Total Transaction
              </div>
              <div className='text-xl font-bold'>
                Rp {sale.totalAmount.toLocaleString()}
              </div>
            </div>

            {/* Amount Paid */}
            <div className='bg-white rounded-xl p-3 border border-gray-200 flex justify-between items-center'>
              <div className='font-medium'>
                Amount Paid
              </div>
              <div className='text-xl font-bold'>
                Rp {sale.amountPaid.toLocaleString()}
              </div>
            </div>

            {/* Change */}
            <div className='bg-green-50 rounded-xl p-3 border border-green-200 flex justify-between items-center'>
              <div className='text-green-600 font-medium'>
                Change
              </div>
              <div className='text-xl font-bold text-green-600'>
                Rp {sale.change.toLocaleString()}
              </div>
            </div>

            {/* Total Profit */}
            <div className='bg-green-600 rounded-xl p-3 text-white flex justify-between items-center'>
              <div className='font-medium'>
                Total Profit
              </div>
              <div className='text-xl font-bold'>
                Rp {sale.products.reduce((sum, p) => sum + ((p.price - (p.buyPrice || 0)) * p.quantity), 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
