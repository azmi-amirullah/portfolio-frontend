import { Product } from '@/lib/services/cashier-service';
import { formatDateCompact } from '@/lib/utils/date';
import { MdEdit, MdDelete } from 'react-icons/md';
import { Button } from '@/components/ui/Button';

interface MobileProductCardProps {
  product: Product & { availableStock: number };
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MobileProductCard({
  product,
  onClick,
  onEdit,
  onDelete,
}: MobileProductCardProps) {
  const margin = product.price - (product.buyPrice || 0);

  return (
    <div
      onClick={onClick}
      className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 active:bg-gray-50 transition-colors cursor-pointer'
    >
      <div className='flex justify-between items-start'>
        <div className='flex-1'>
          <div className='text-gray-500'>{product.barcode}</div>
          <div className='mt-1'>{product.name}</div>
          <div className='text-blue-600 mt-1'>
            Rp {product.price.toLocaleString()}
          </div>
        </div>
        <div className='text-right'>
          <span
            className={`px-2 py-1 font-medium rounded-full ${
              product.availableStock > 0
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {product.availableStock}
          </span>
          <div
            className={`mt-2 ${
              margin > 0
                ? 'text-green-600'
                : margin < 0
                ? 'text-red-600'
                : 'text-gray-500'
            }`}
          >
            Margin: Rp {margin.toLocaleString()}
          </div>
        </div>
      </div>
      <div className='flex justify-between items-center mt-3 pt-3 border-t border-gray-200'>
        <div className='text-gray-500 text-sm'>
          <div>Created: {formatDateCompact(product.createdAt)}</div>
          <div>Edited: {formatDateCompact(product.lastEditAt)}</div>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='ghost'
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className='text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 h-auto'
            aria-label='Edit product'
          >
            <MdEdit size={20} />
          </Button>
          <Button
            variant='ghost'
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className='text-red-600 hover:text-red-800 hover:bg-red-50 p-2 h-auto'
            aria-label='Delete product'
          >
            <MdDelete size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
