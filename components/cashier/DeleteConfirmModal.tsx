import { MdDelete } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    itemName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function DeleteConfirmModal({
    isOpen,
    itemName,
    onConfirm,
    onCancel,
}: DeleteConfirmModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title='Delete Product'
            headerIcon={<MdDelete size={24} />}
            headerClassName='bg-red-600 border-red-400 text-white'
            maxWidth='md'
        >
            <div className='p-4 sm:p-6'>
                <p className='mb-1'>
                    Are you sure you want to delete{' '}
                    <span className='font-medium'>&quot;{itemName}&quot;</span>?
                </p>
                <p className='text-gray-500'>⚠️ This action cannot be undone.</p>
                <div className='flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200'>
                    <Button variant='outline' onClick={onCancel} type='button'>
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className='bg-red-600 hover:bg-red-700'
                        type='button'
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
