import { MdDelete, MdRemove, MdAdd } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import { CartItem } from '@/lib/hooks/useCart';

interface DesktopCartRowProps {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

export function DesktopCartRow({
  item,
  onRemove,
  onUpdateQuantity,
}: DesktopCartRowProps) {
  return (
    <tr className='hover:bg-gray-50 transition-colors'>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='text-lg font-medium'>{item.name}</div>
        <div className='text-gray-500'>{item.barcode}</div>
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-center text-gray-500'>
        Rp {item.price.toLocaleString()}
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex justify-center items-center gap-3'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onUpdateQuantity(item.id, -1)}
            className='rounded-full bg-gray-50 hover:bg-gray-200 text-gray-500 h-8 w-8'
          >
            <MdRemove size={16} />
          </Button>
          <span className='text-lg font-bold w-8 text-center'>
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
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-right font-bold text-lg'>
        Rp {(item.price * item.quantity).toLocaleString()}
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-right'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => onRemove(item.id)}
          className='text-red-600 hover:text-red-800'
        >
          <MdDelete size={20} />
        </Button>
      </td>
    </tr>
  );
}
