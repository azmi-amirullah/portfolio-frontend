import { MdDelete, MdRemove, MdAdd } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import { CartItem } from '@/lib/hooks/useCart';

interface MobileCartItemProps {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

export function MobileCartItem({
  item,
  onRemove,
  onUpdateQuantity,
}: MobileCartItemProps) {
  return (
    <div className='bg-gray-50 rounded-lg p-3 border border-gray-200'>
      <div className='flex justify-between items-start mb-2'>
        <div className='flex-1'>
          <div className='font-medium'>{item.name}</div>
          <div className='text-gray-500'>{item.barcode}</div>
        </div>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => onRemove(item.id)}
          className='text-red-600 hover:text-red-800 h-8 w-8'
        >
          <MdDelete size={18} />
        </Button>
      </div>
      <div className='flex justify-between items-center'>
        <div className='text-gray-500'>Rp {item.price.toLocaleString()}</div>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onUpdateQuantity(item.id, -1)}
            className='rounded-full bg-gray-50 hover:bg-gray-200 text-gray-500 h-8 w-8'
          >
            <MdRemove size={16} />
          </Button>
          <span className='text-base font-bold w-8 text-center'>
            {item.quantity}
          </span>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onUpdateQuantity(item.id, 1)}
            className='rounded-full bg-gray-50 hover:bg-gray-200 text-gray-500 h-8 w-8'
          >
            <MdAdd size={16} />
          </Button>
        </div>
        <div className='font-bold'>
          Rp {(item.price * item.quantity).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
