import { MdInventory, MdEdit } from 'react-icons/md';
import { Product, StockBatch } from '@/lib/services/cashier-service';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/cashier/Table';

interface ProductViewModalProps {
  product: Product & { batches: StockBatch[] };
  onEdit: () => void;
}

export function ProductViewModal({ product, onEdit }: ProductViewModalProps) {
  const margin = product.price - (product.buyPrice || 0);

  return (
    <div className='space-y-6'>
      {/* Product Details View */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <label className='block font-medium'>Barcode</label>
          <div className='mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md'>
            {product.barcode}
          </div>
        </div>
        <div>
          <label className='block font-medium'>Product Name</label>
          <div className='mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md'>
            {product.name}
          </div>
        </div>
        <div>
          <label className='block font-medium'>Buy Price (Cost)</label>
          <div className='mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md'>
            Rp {(product.buyPrice || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <label className='block font-medium'>Sell Price</label>
          <div className='mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-blue-600'>
            Rp {product.price.toLocaleString()}
          </div>
        </div>
        <div>
          <label className='block font-medium'>Margin (per unit)</label>
          <div
            className={`mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md ${
              margin > 0
                ? 'text-green-600'
                : margin < 0
                ? 'text-red-600'
                : 'text-gray-500'
            }`}
          >
            Rp {margin.toLocaleString()}
          </div>
        </div>
        <div>
          <label className='block font-medium'>Total Sold</label>
          <div className='mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md'>
            {product.sold || 0} units
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className='border-t border-gray-200 pt-4'>
        <h3 className='font-bold mb-3'>Stock</h3>
        <div className='border rounded-md overflow-hidden'>
          {/* Mobile View */}
          <div className='md:hidden divide-y divide-gray-200'>
            {product.batches.length === 0 ? (
              <div className='p-6 text-center bg-gray-50'>
                <span className='text-gray-500'>No stock available.</span>
              </div>
            ) : (
              product.batches.map((batch) => (
                <div key={batch.addedDate} className='p-4 bg-white'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <div className='font-medium text-gray-900 mb-1'>
                        Expiration Date
                      </div>
                      <div
                        className={`${
                          batch.isSoldOut
                            ? 'line-through text-gray-500'
                            : 'text-gray-500'
                        }`}
                      >
                        {new Date(batch.expirationDate).toLocaleDateString(
                          'en-GB'
                        )}
                      </div>
                    </div>
                    <div>
                      <div className='font-medium text-gray-900 mb-1'>
                        Quantity
                      </div>
                      <div
                        className={`${
                          batch.isSoldOut
                            ? 'line-through text-gray-500'
                            : 'text-blue-600'
                        }`}
                      >
                        {batch.quantity}
                      </div>
                    </div>
                    <div>
                      <div className='font-medium text-gray-900 mb-1'>
                        Created At
                      </div>
                      <div
                        className={`${
                          batch.isSoldOut
                            ? 'line-through text-gray-500'
                            : 'text-gray-500'
                        }`}
                      >
                        {new Date(batch.addedDate).toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </div>
                    </div>
                    <div>
                      <div className='font-medium text-gray-900 mb-1'>
                        Status
                      </div>
                      <span
                        className={`text-base ${
                          batch.isSoldOut ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {batch.isSoldOut ? 'Unavailable' : 'Available'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <Table
            size='sm'
            className='hidden md:block max-h-60 overflow-y-auto'
            columns={[
              {
                header: 'Expiration Date',
                renderRow: (batch) => (
                  <span
                    className={
                      batch.isSoldOut ? 'line-through text-gray-500' : ''
                    }
                  >
                    {new Date(batch.expirationDate).toLocaleDateString('en-GB')}
                  </span>
                ),
              },
              {
                header: 'Created At',
                renderRow: (batch) => (
                  <span
                    className={
                      batch.isSoldOut ? 'line-through text-gray-500' : ''
                    }
                  >
                    {new Date(batch.addedDate).toLocaleString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </span>
                ),
              },
              {
                header: 'Quantity',
                renderRow: (batch) => (
                  <span
                    className={
                      batch.isSoldOut ? 'line-through text-gray-500' : ''
                    }
                  >
                    {batch.quantity}
                  </span>
                ),
              },
              {
                header: 'Status',
                renderRow: (batch) => (
                  <span
                    className={`px-2 py-1 rounded-full ${
                      batch.isSoldOut
                        ? 'bg-red-50 text-red-800 font-medium'
                        : 'bg-green-50 text-green-800'
                    }`}
                  >
                    {batch.isSoldOut ? 'Unavailable' : 'Available'}
                  </span>
                ),
              },
            ]}
            data={product.batches}
            rowKey={(batch) => batch.addedDate}
            emptyState={{
              icon: MdInventory,
              title: 'No stock available.',
              subtitle: '',
            }}
          />
        </div>
      </div>

      {/* Edit Button */}
      <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
        <Button
          onClick={onEdit}
          className='flex items-center gap-2 bg-blue-600 hover:bg-blue-800'
        >
          <MdEdit size={16} />
          Edit
        </Button>
      </div>
    </div>
  );
}
