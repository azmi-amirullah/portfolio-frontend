import { Product } from '@/lib/services/cashier-service';

interface MobileProductCardProps {
  product: Product & { availableStock: number };
  onClick: () => void;
}

export function MobileProductCard({
  product,
  onClick,
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
    </div>
  );
}
