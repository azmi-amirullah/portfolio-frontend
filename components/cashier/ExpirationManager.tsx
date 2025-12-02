'use client';

import { useState } from 'react';
import { StockBatch } from '@/lib/services/cashier-service';
import { MdAdd, MdEdit, MdCheck, MdClose } from 'react-icons/md';
import { Button } from '@/components/ui/Button';

interface ExpirationManagerProps {
  batches: StockBatch[];
  onAddBatch: (
    batch: Omit<StockBatch, 'id' | 'productId' | 'isSoldOut'>
  ) => void;
  onUpdateBatch?: (batch: StockBatch) => void;
  onToggleSoldOut: (batchId: string) => void;
}

export default function ExpirationManager({
  batches,
  onAddBatch,
  onUpdateBatch,
  onToggleSoldOut,
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
      addedDate: new Date().toISOString().split('T')[0],
      quantity: newQuantity,
    });

    setNewExpiration('');
    setNewQuantity(1);
  };

  const startEditing = (batch: StockBatch) => {
    setEditingBatchId(batch.id);
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
      <h3 className='text-sm font-medium text-gray-700'>Stock Management</h3>

      {/* Add New Batch */}
      <div className='flex gap-2 items-end bg-gray-50 p-3 rounded-md border border-gray-200'>
        <div className='flex-1'>
          <label className='block text-xs text-gray-500 mb-1'>
            Expiration Date
          </label>
          <input
            type='date'
            value={newExpiration}
            onChange={(e) => setNewExpiration(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker()}
            className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer'
          />
        </div>
        <div className='w-24'>
          <label className='block text-xs text-gray-500 mb-1'>Quantity</label>
          <input
            type='number'
            min='1'
            value={newQuantity}
            onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
            className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
          />
        </div>
        <Button
          type='button'
          onClick={handleAdd}
          disabled={!newExpiration || newQuantity <= 0}
          className='flex items-center gap-1 bg-blue-600 hover:bg-blue-700 h-auto py-1.5 px-3 text-sm'
        >
          <MdAdd size={16} /> Add
        </Button>
      </div>

      {/* List Batches */}
      <div className='border rounded-md overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Exp. Date
              </th>
              <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Added
              </th>
              <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Qty
              </th>
              <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {batches.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className='px-3 py-4 text-center text-sm text-gray-500'
                >
                  No stock added yet.
                </td>
              </tr>
            ) : (
              batches.map((batch) => (
                <tr
                  key={batch.id}
                  className={batch.isSoldOut ? 'bg-gray-50' : ''}
                >
                  {editingBatchId === batch.id ? (
                    <>
                      <td className='px-3 py-2'>
                        <input
                          type='date'
                          value={editExpiration}
                          onChange={(e) => setEditExpiration(e.target.value)}
                          onClick={(e) => e.currentTarget.showPicker()}
                          className='w-full px-2 py-1 text-xs border border-gray-300 rounded cursor-pointer'
                        />
                      </td>
                      <td className='px-3 py-2 text-sm text-gray-500'>
                        {batch.addedDate}
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='number'
                          min='0'
                          value={editQuantity}
                          onChange={(e) =>
                            setEditQuantity(parseInt(e.target.value) || 0)
                          }
                          className='w-20 px-2 py-1 text-xs border border-gray-300 rounded'
                        />
                      </td>
                      <td className='px-3 py-2 text-sm'>
                        <label className='flex items-center space-x-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={batch.isSoldOut}
                            onChange={() => onToggleSoldOut(batch.id)}
                            className='rounded cursor-pointer text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300'
                          />
                          <span
                            className={`text-xs ${
                              batch.isSoldOut
                                ? 'text-red-500 font-medium'
                                : 'text-gray-500'
                            }`}
                          >
                            {batch.isSoldOut ? 'Sold Out' : 'Available'}
                          </span>
                        </label>
                      </td>
                      <td className='px-3 py-2 text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => saveEditing(batch)}
                            className='text-green-600 hover:text-green-800 hover:bg-green-50 h-6 w-6'
                          >
                            <MdCheck size={16} />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={cancelEditing}
                            className='text-red-600 hover:text-red-800 hover:bg-red-50 h-6 w-6'
                          >
                            <MdClose size={16} />
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td
                        className={`px-3 py-2 text-sm text-gray-900 ${
                          batch.isSoldOut ? 'line-through text-gray-400' : ''
                        }`}
                      >
                        {batch.expirationDate}
                      </td>
                      <td
                        className={`px-3 py-2 text-sm text-gray-500 ${
                          batch.isSoldOut ? 'line-through text-gray-400' : ''
                        }`}
                      >
                        {batch.addedDate}
                      </td>
                      <td
                        className={`px-3 py-2 text-sm text-gray-900 ${
                          batch.isSoldOut ? 'line-through text-gray-400' : ''
                        }`}
                      >
                        {batch.quantity}
                      </td>
                      <td className='px-3 py-2 text-sm'>
                        <label className='flex items-center space-x-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={batch.isSoldOut}
                            onChange={() => onToggleSoldOut(batch.id)}
                            className='rounded cursor-pointer text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300'
                          />
                          <span
                            className={`text-xs ${
                              batch.isSoldOut
                                ? 'text-red-500 font-medium'
                                : 'text-gray-500'
                            }`}
                          >
                            {batch.isSoldOut ? 'Sold Out' : 'Available'}
                          </span>
                        </label>
                      </td>
                      <td className='px-3 py-2 text-right'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => startEditing(batch)}
                          className='text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-6 w-6'
                        >
                          <MdEdit size={14} />
                        </Button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
