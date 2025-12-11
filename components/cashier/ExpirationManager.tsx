
import { useState } from 'react';
import { StockBatch } from '@/lib/services/cashier-service';
import { MdAdd, MdEdit, MdCheck, MdClose, MdDelete, MdInventory } from 'react-icons/md';
import { IoArrowUndoCircle } from 'react-icons/io5';
import { Button } from '@/components/ui/Button';
import { Table } from './Table';

interface ExpirationManagerProps {
  batches: StockBatch[];
  onAddBatch: (
    batch: Omit<StockBatch, 'productId' | 'isSoldOut'>
  ) => void;
  onUpdateBatch?: (batch: StockBatch) => void;
  onDeleteBatch?: (batchId: string) => void;
  onToggleSoldOut: (batchId: string) => void;
  unsavedBatchIds?: Set<string>;
  deletedBatchIds?: Set<string>;
}

export default function ExpirationManager({
  batches,
  onAddBatch,
  onUpdateBatch,
  onDeleteBatch,
  onToggleSoldOut,
  unsavedBatchIds,
  deletedBatchIds,
}: ExpirationManagerProps) {
  const [newExpiration, setNewExpiration] = useState('');
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [editExpiration, setEditExpiration] = useState('');
  const [editQuantity, setEditQuantity] = useState<number>(0);

  const handleAdd = () => {
    if (!newExpiration || newQuantity <= 0) return;

    onAddBatch({
      expirationDate: newExpiration,
      addedDate: new Date().toISOString(),
      quantity: newQuantity,
    });

    setNewExpiration('');
    setNewQuantity(1);
  };

  const startEditing = (batch: StockBatch) => {
    setEditingBatchId(batch.addedDate);
    setEditExpiration(batch.expirationDate);
    setEditQuantity(batch.quantity);
  };

  const cancelEditing = () => {
    setEditingBatchId(null);
    setEditExpiration('');
    setEditQuantity(0);
  };

  const saveEditing = (batch: StockBatch) => {
    if (!onUpdateBatch) return;

    onUpdateBatch({
      ...batch,
      expirationDate: editExpiration,
      quantity: editQuantity,
    });
    setEditingBatchId(null);
  };

  return (
    <div className='space-y-4'>
      <h3 className='font-medium'>Stock Management</h3>

      {/* Add New Batch */}
      <div className='flex flex-wrap gap-2 items-end bg-gray-50 p-3 rounded-md border border-gray-200'>
        <div className='flex-1 min-w-[150px]'>
          <label className='block text-gray-500 mb-1'>
            Expiration Date
          </label>
          <input
            type='date'
            value={newExpiration}
            onChange={(e) => setNewExpiration(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker()}
            className='w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer'
          />
        </div>
        <div className='w-24'>
          <label className='block text-gray-500 mb-1'>Quantity</label>
          <input
            type='number'
            min='1'
            value={newQuantity}
            onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
            className='w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
          />
        </div>
        <Button
          type='button'
          onClick={handleAdd}
          disabled={!newExpiration || newQuantity <= 0}
          className='flex items-center gap-1 bg-blue-600 hover:bg-blue-700 h-auto py-1.5 px-3'
        >
          <MdAdd size={16} /> Add
        </Button>
      </div>

      {/* List Batches */}
      <div className='border rounded-md overflow-x-auto'>
        <Table
          size='sm'
          className='block max-h-60 overflow-y-auto'
          columns={[
            {
              header: 'Exp. Date',
              renderRow: (batch) => {
                const isDeleted = deletedBatchIds?.has(batch.addedDate);
                if (editingBatchId === batch.addedDate) {
                  return (
                    <input
                      type='date'
                      value={editExpiration}
                      onChange={(e) => setEditExpiration(e.target.value)}
                      onClick={(e) => e.currentTarget.showPicker()}
                      className='w-full px-2 py-1 border border-gray-300 rounded cursor-pointer'
                    />
                  );
                }
                return (
                  <span className={isDeleted || batch.isSoldOut ? 'line-through' : ''}>
                    {new Date(batch.expirationDate).toLocaleDateString('en-GB')}
                  </span>
                );
              }
            },
            {
              header: 'Created At',
              renderRow: (batch) => {
                const isDeleted = deletedBatchIds?.has(batch.addedDate);
                return (
                  <span className={`${isDeleted || batch.isSoldOut ? 'line-through' : ''}`}>
                    {new Date(batch.addedDate).toLocaleString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </span>
                );
              }
            },
            {
              header: 'Qty',
              renderRow: (batch) => {
                const isDeleted = deletedBatchIds?.has(batch.addedDate);
                if (editingBatchId === batch.addedDate) {
                  return (
                    <input
                      type='number'
                      min='0'
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                      className='w-20 px-2 py-1 border border-gray-300 rounded'
                    />
                  );
                }
                return (
                  <span className={isDeleted || batch.isSoldOut ? 'line-through' : ''}>
                    {batch.quantity}
                  </span>
                );
              }
            },
            {
              header: 'Status',
              renderRow: (batch) => (
                <label className='flex items-center space-x-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={batch.isSoldOut}
                    onChange={() => onToggleSoldOut(batch.addedDate)}
                    className='rounded cursor-pointer text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300'
                  />
                  <span
                    className={`${batch.isSoldOut ? 'text-red-600 font-medium' : ''}`}
                  >
                    {batch.isSoldOut ? 'Unavailable' : 'Available'}
                  </span>
                </label>
              )
            },
            {
              header: 'Actions',
              align: 'right',
              renderRow: (batch) => {
                const isDeleted = deletedBatchIds?.has(batch.addedDate);
                if (editingBatchId === batch.addedDate) {
                  return (
                    <div className='flex justify-end gap-2'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => saveEditing(batch)}
                        className='text-green-600 hover:text-green-800 h-6 w-6'
                      >
                        <MdCheck size={16} />
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={cancelEditing}
                        className='text-red-600 hover:text-red-800 h-6 w-6'
                      >
                        <MdClose size={16} />
                      </Button>
                    </div>
                  );
                }
                return (
                  <div className='flex justify-end gap-1'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => startEditing(batch)}
                      disabled={isDeleted}
                      className='text-blue-600 hover:text-blue-800 h-6 w-6 disabled:opacity-30'
                    >
                      <MdEdit size={14} />
                    </Button>
                    {onDeleteBatch && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => onDeleteBatch(batch.addedDate)}
                        className={`h-6 w-6 ${isDeleted ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                        title={isDeleted ? 'Undo Delete' : 'Delete'}
                      >
                        {isDeleted ? <IoArrowUndoCircle size={14} /> : <MdDelete size={14} />}
                      </Button>
                    )}
                  </div>
                );
              }
            }
          ]}
          data={batches}
          rowKey={(batch) => batch.addedDate}
          rowClassName={(batch) => {
            const isUnsaved = unsavedBatchIds?.has(batch.addedDate);
            const isDeleted = deletedBatchIds?.has(batch.addedDate);
            return isDeleted
              ? 'bg-gray-500 opacity-60'
              : isUnsaved
                ? 'bg-yellow-100'
                : batch.isSoldOut
                  ? 'bg-gray-50'
                  : '';
          }}
          emptyState={{
            icon: MdInventory, // Ignored in sm
            title: 'No stock added yet.',
            subtitle: '', // Ignored in sm
          }}
        />
      </div>
    </div>
  );
}
