import { useState } from 'react';
import { StockBatch } from '@/lib/services/cashier-service';
import {
  MdAdd,
  MdEdit,
  MdCheck,
  MdClose,
  MdDelete,
  MdInventory,
} from 'react-icons/md';
import { IoArrowUndoCircle } from 'react-icons/io5';
import { Button } from '@/components/ui/Button';
import { Table } from './Table';
import { toast } from 'react-toastify';

interface ExpirationManagerProps {
  batches: StockBatch[];
  onAddBatch: (batch: Omit<StockBatch, 'productId' | 'isSoldOut'>) => void;
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
  const [newQuantity, setNewQuantity] = useState<string>('1');
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [editExpiration, setEditExpiration] = useState('');
  const [editQuantity, setEditQuantity] = useState<string>('0');

  const handleAdd = () => {
    const qty = parseInt(newQuantity) || 0;
    if (!newExpiration) return;
    if (newQuantity === '' || qty <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    onAddBatch({
      expirationDate: newExpiration,
      addedDate: new Date().toISOString(),
      quantity: qty,
    });

    setNewExpiration('');
    setNewQuantity('1');
  };

  const startEditing = (batch: StockBatch) => {
    setEditingBatchId(batch.addedDate);
    setEditExpiration(batch.expirationDate);
    setEditQuantity(batch.quantity.toString());
  };

  const cancelEditing = () => {
    setEditingBatchId(null);
    setEditExpiration('');
    setEditQuantity('0');
  };

  const saveEditing = (batch: StockBatch) => {
    if (!onUpdateBatch) return;
    const qty = editQuantity === '' ? 0 : parseInt(editQuantity) || 0;

    onUpdateBatch({
      ...batch,
      expirationDate: editExpiration,
      quantity: qty,
    });
    setEditingBatchId(null);
  };

  return (
    <div className='space-y-4'>
      <h3 className='font-bold'>Stock</h3>

      {/* Add New Batch */}
      <div className='flex flex-wrap gap-2 items-end bg-gray-50 p-3 rounded-md border border-gray-200'>
        <div className='flex-1 min-w-[150px]'>
          <label className='block mb-1'>Expiration Date</label>
          <input
            type='date'
            value={newExpiration}
            onChange={(e) => setNewExpiration(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker()}
            className='w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer bg-white'
          />
        </div>
        <div className='w-24'>
          <label className='block mb-1'>Quantity</label>
          <input
            type='number'
            min='1'
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            className='w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white'
          />
        </div>
        <Button
          type='button'
          onClick={handleAdd}
          disabled={!newExpiration}
          className='flex items-center gap-1 bg-blue-600 hover:bg-blue-800 h-auto py-1.5 px-3'
        >
          <MdAdd size={16} /> Add
        </Button>
      </div>

      {/* List Batches */}
      <div className='border rounded-md overflow-hidden'>
        {/* Mobile View */}
        <div className='md:hidden divide-y divide-gray-200'>
          {batches.length === 0 ? (
            <div className='p-8 text-center bg-white'>
              <h3 className='text-lg font-medium text-gray-500 mb-1'>
                No stock added yet.
              </h3>
            </div>
          ) : (
            batches.map((batch) => {
              const isDeleted = deletedBatchIds?.has(batch.addedDate);
              const isUnsaved = unsavedBatchIds?.has(batch.addedDate);
              const isEditing = editingBatchId === batch.addedDate;

              return (
                <div
                  key={batch.addedDate}
                  className={`p-4 space-y-3 ${
                    isDeleted
                      ? 'bg-gray-50 opacity-60'
                      : isUnsaved
                      ? 'bg-yellow-50'
                      : batch.isSoldOut
                      ? 'bg-gray-50'
                      : 'bg-white'
                  }`}
                >
                  {isEditing ? (
                    // Edit Mode Card
                    <div className='flex gap-3'>
                      {/* Input Grid */}
                      <div className='flex-1 grid grid-cols-2 gap-x-4 gap-y-3'>
                        {/* 1. Expiration Date */}
                        <div>
                          <label className='block font-medium text-gray-900 mb-1'>
                            Expiration Date
                          </label>
                          <input
                            type='date'
                            value={editExpiration}
                            onChange={(e) => setEditExpiration(e.target.value)}
                            onClick={(e) => e.currentTarget.showPicker()}
                            className='w-full px-2 py-1.5 border border-gray-200 rounded'
                          />
                        </div>
                        {/* 2. Quantity */}
                        <div>
                          <label className='block font-medium text-gray-900 mb-1'>
                            Quantity
                          </label>
                          <input
                            type='number'
                            min='0'
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            className='w-full px-2 py-1.5 border border-gray-200 rounded'
                          />
                        </div>
                        {/* 3. Created At */}
                        <div>
                          <label className='block font-medium text-gray-900 mb-1'>
                            Created At
                          </label>
                          <div className='py-1.5 text-gray-500'>
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
                        {/* 4. Status */}
                        <div>
                          <label className='block font-medium text-gray-900 mb-1'>
                            Status
                          </label>
                          <label className='flex items-center space-x-2 cursor-pointer h-[38px]'>
                            <input
                              type='checkbox'
                              checked={batch.isSoldOut}
                              onChange={() => onToggleSoldOut(batch.addedDate)}
                              className='hidden'
                            />
                            <div
                              className={`w-5 h-5 rounded border flex items-center justify-center ${
                                batch.isSoldOut
                                  ? 'border-red-600 bg-red-50'
                                  : 'border-green-600 bg-green-50'
                              }`}
                            >
                              {batch.isSoldOut ? (
                                <MdClose size={14} className='text-red-600' />
                              ) : (
                                <MdCheck size={14} className='text-green-600' />
                              )}
                            </div>
                            <span
                              className={`${
                                batch.isSoldOut
                                  ? 'text-red-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {batch.isSoldOut ? 'Unavailable' : 'Available'}
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Actions Column */}
                      <div className='flex flex-col gap-4 justify-center border-l border-gray-200 pl-3'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon-sm'
                          onClick={() => saveEditing(batch)}
                          className='text-green-600 hover:text-green-800'
                        >
                          <MdCheck size={22} />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon-sm'
                          onClick={cancelEditing}
                          className='text-red-600 hover:text-red-800'
                        >
                          <MdClose size={22} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode Card
                    <div className='flex gap-3'>
                      {/* Data Grid */}
                      <div className='flex-1 grid grid-cols-2 gap-x-4 gap-y-3'>
                        {/* 1. Expiration Date */}
                        <div>
                          <div className='font-medium text-gray-900 mb-1'>
                            Expiration Date
                          </div>
                          <div
                            className={`${
                              isDeleted || batch.isSoldOut
                                ? 'line-through text-gray-500'
                                : 'text-gray-500'
                            }`}
                          >
                            {new Date(batch.expirationDate).toLocaleDateString(
                              'en-GB'
                            )}
                          </div>
                        </div>
                        {/* 2. Quantity */}
                        <div>
                          <div className='font-medium text-gray-900 mb-1'>
                            Quantity
                          </div>
                          <div
                            className={`${
                              isDeleted || batch.isSoldOut
                                ? 'line-through text-gray-500'
                                : 'text-blue-600'
                            }`}
                          >
                            {batch.quantity}
                          </div>
                        </div>
                        {/* 3. Created At */}
                        <div>
                          <div className='font-medium text-gray-900 mb-1'>
                            Created At
                          </div>
                          <div
                            className={`${
                              isDeleted || batch.isSoldOut
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
                        {/* 4. Status */}
                        <div>
                          <div className='font-medium text-gray-900 mb-1'>
                            Status
                          </div>
                          <span
                            className={`${
                              batch.isSoldOut
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}
                          >
                            {batch.isSoldOut ? 'Unavailable' : 'Available'}
                          </span>
                        </div>
                      </div>

                      {/* Actions Column */}
                      <div className='flex flex-col gap-4 justify-center border-l border-gray-200 pl-3'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon-sm'
                          onClick={() => startEditing(batch)}
                          disabled={isDeleted}
                          className='text-blue-600 hover:text-blue-800 disabled:opacity-30'
                        >
                          <MdEdit size={20} />
                        </Button>
                        {onDeleteBatch && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon-sm'
                            onClick={() => onDeleteBatch(batch.addedDate)}
                            className={`${
                              isDeleted
                                ? 'text-green-600 hover:text-green-800'
                                : 'text-red-600 hover:text-red-800'
                            }`}
                          >
                            {isDeleted ? (
                              <IoArrowUndoCircle size={20} />
                            ) : (
                              <MdDelete size={20} />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View */}
        <Table
          size='sm'
          className='hidden md:block max-h-60 overflow-y-auto'
          columns={[
            {
              header: 'Expiration Date',
              renderRow: (batch) => {
                const isDeleted = deletedBatchIds?.has(batch.addedDate);
                if (editingBatchId === batch.addedDate) {
                  return (
                    <input
                      type='date'
                      value={editExpiration}
                      onChange={(e) => setEditExpiration(e.target.value)}
                      onClick={(e) => e.currentTarget.showPicker()}
                      className='w-full px-2 py-1 border border-gray-200 rounded cursor-pointer'
                    />
                  );
                }
                return (
                  <span
                    className={
                      isDeleted || batch.isSoldOut
                        ? 'line-through text-gray-500'
                        : ''
                    }
                  >
                    {new Date(batch.expirationDate).toLocaleDateString('en-GB')}
                  </span>
                );
              },
            },
            {
              header: 'Created At',
              renderRow: (batch) => {
                const isDeleted = deletedBatchIds?.has(batch.addedDate);
                return (
                  <span
                    className={
                      isDeleted || batch.isSoldOut
                        ? 'line-through text-gray-500'
                        : ''
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
                );
              },
            },
            {
              header: 'Quantity',
              renderRow: (batch) => {
                const isDeleted = deletedBatchIds?.has(batch.addedDate);
                if (editingBatchId === batch.addedDate) {
                  return (
                    <input
                      type='number'
                      min='0'
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      className='w-20 px-2 py-1 border border-gray-200 rounded'
                    />
                  );
                }
                return (
                  <span
                    className={`${
                      isDeleted || batch.isSoldOut
                        ? 'line-through text-gray-500'
                        : 'text-blue-600'
                    }`}
                  >
                    {batch.quantity}
                  </span>
                );
              },
            },
            {
              header: 'Status',
              renderRow: (batch) => {
                if (editingBatchId === batch.addedDate) {
                  return (
                    <div className='flex items-center space-x-2'>
                      <label className='flex items-center space-x-2 cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={batch.isSoldOut}
                          onChange={() => onToggleSoldOut(batch.addedDate)}
                          className='hidden'
                        />
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            batch.isSoldOut
                              ? 'border-red-600 bg-red-50'
                              : 'border-green-600 bg-green-50'
                          }`}
                        >
                          {batch.isSoldOut ? (
                            <MdClose size={14} className='text-red-600' />
                          ) : (
                            <MdCheck size={14} className='text-green-600' />
                          )}
                        </div>
                        <span
                          className={`${
                            batch.isSoldOut ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {batch.isSoldOut ? 'Unavailable' : 'Available'}
                        </span>
                      </label>
                    </div>
                  );
                }
                return (
                  <span
                    className={`${
                      batch.isSoldOut ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {batch.isSoldOut ? 'Unavailable' : 'Available'}
                  </span>
                );
              },
            },
            {
              header: 'Actions',
              align: 'right',
              renderRow: (batch) => {
                const isDeleted = deletedBatchIds?.has(batch.addedDate);
                if (editingBatchId === batch.addedDate) {
                  return (
                    <div className='flex justify-end gap-4'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-xs'
                        onClick={() => saveEditing(batch)}
                        className='text-green-600 hover:text-green-800'
                      >
                        <MdCheck size={22} />
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-xs'
                        onClick={cancelEditing}
                        className='text-red-600 hover:text-red-800'
                      >
                        <MdClose size={22} />
                      </Button>
                    </div>
                  );
                }
                return (
                  <div className='flex justify-end gap-4'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon-xs'
                      onClick={() => startEditing(batch)}
                      disabled={isDeleted}
                      className='text-blue-600 hover:text-blue-800 disabled:opacity-30'
                    >
                      <MdEdit size={20} />
                    </Button>
                    {onDeleteBatch && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-xs'
                        onClick={() => onDeleteBatch(batch.addedDate)}
                        className={`${
                          isDeleted
                            ? 'text-green-600 hover:text-green-800'
                            : 'text-red-600 hover:text-red-800'
                        }`}
                        title={isDeleted ? 'Undo Delete' : 'Delete'}
                      >
                        {isDeleted ? (
                          <IoArrowUndoCircle size={20} />
                        ) : (
                          <MdDelete size={20} />
                        )}
                      </Button>
                    )}
                  </div>
                );
              },
            },
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
