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
      <div className='bg-white px-6 py-6 space-y-8'>
        {/* Top Section: Date & Time */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='bg-gray-50 rounded-2xl p-5 border border-gray-200 flex flex-col justify-center'>
            <div className='text-sm text-gray-500 mb-1'>Date</div>
            <div className='text-base font-bold '>
              {formatDate(sale.timestamp)}
            </div>
          </div>
          <div className='bg-gray-50 rounded-2xl p-5 border border-gray-200 flex flex-col justify-center'>
            <div className='text-sm text-gray-500 mb-1'>Time</div>
            <div className='text-base font-bold '>
              {formatTime(sale.timestamp)}
            </div>
          </div>
        </div>

        {/* Middle Section: Products List */}
        <div className='space-y-3'>
          <h4 className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
            Items Purchased
          </h4>
          <div className='bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden'>
            <div className='divide-y divide-gray-200'>
              {sale.products.map((product, index) => (
                <div key={index} className='p-4 border-b border-gray-100 last:border-0'>
                  <div className='flex justify-between items-start mb-2'>
                    <div className='font-bold text-gray-900'>{product.productName}</div>
                    <div className='font-bold text-gray-900'>
                      Rp {(product.price * product.quantity).toLocaleString()}
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-y-1 text-sm'>
                    <div className='text-gray-500'>
                      Price: Rp {product.price.toLocaleString()} x {product.quantity}
                    </div>
                    <div className='text-right text-gray-500'>
                      Buy Price: Rp {(product.buyPrice || 0).toLocaleString()}
                    </div>
                    <div className='text-gray-500 col-span-2 text-right'>
                      <span className='mr-2'>Margin:</span>
                      <span className='text-green-600 font-medium'>
                        Rp {((product.price - (product.buyPrice || 0)) * product.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Financial Dashboard */}
        <div className='space-y-3'>
          <h4 className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
            Payment Summary
          </h4>
          <div className='grid grid-cols-1 gap-3'>
            {/* Grand Total */}
            <div className='bg-blue-600 rounded-xl p-3 text-white flex justify-between items-center'>
              <div className='text-sm font-medium'>
                Grand Total
              </div>
              <div className='text-xl font-bold'>
                Rp {sale.totalAmount.toLocaleString()}
              </div>
            </div>

            {/* Amount Paid */}
            <div className='bg-white rounded-xl p-3 border border-gray-200 flex justify-between items-center'>
              <div className='text-sm font-medium'>
                Amount Paid
              </div>
              <div className='text-xl font-bold'>
                Rp {sale.amountPaid.toLocaleString()}
              </div>
            </div>

            {/* Change */}
            <div className='bg-green-50 rounded-xl p-3 border border-green-200 flex justify-between items-center'>
              <div className='text-green-600 text-sm font-medium'>
                Change
              </div>
              <div className='text-xl font-bold text-green-600'>
                Rp {sale.change.toLocaleString()}
              </div>
            </div>

            {/* Total Profit */}
            <div className='bg-green-600 rounded-xl p-3 text-white flex justify-between items-center'>
              <div className='text-sm font-medium'>
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
