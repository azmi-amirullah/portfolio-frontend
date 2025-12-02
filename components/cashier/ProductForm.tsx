'use client';

import { useState, useEffect } from 'react';
import {
  Product,
  StockBatch,
  cashierService,
} from '@/lib/services/cashier-service';
import ExpirationManager from './ExpirationManager';
import { MdSave } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Extend Window interface for temporary product ID storage
interface WindowWithTempProduct extends Window {
  tempProductId?: string;
}

declare const window: WindowWithTempProduct;

interface ProductFormProps {
  initialProduct?: Product;
  initialBatches?: StockBatch[];
  onSave: () => void;
  onCancel: () => void;
}

export default function ProductForm({
  initialProduct,
  initialBatches,
  onSave,
  onCancel,
}: ProductFormProps) {
  const [barcode, setBarcode] = useState(initialProduct?.barcode || '');
  const [name, setName] = useState(initialProduct?.name || '');
  const [price, setPrice] = useState(initialProduct?.price?.toString() || '');
  const [batches, setBatches] = useState<StockBatch[]>(initialBatches || []);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  useEffect(() => {
    if (initialProduct && !initialBatches) {
      const fetchBatches = async () => {
        setIsLoadingBatches(true);
        try {
          const fetchedBatches = await cashierService.getStockBatches(
            initialProduct.id
          );
          setBatches(fetchedBatches);
        } finally {
          setIsLoadingBatches(false);
        }
      };
      fetchBatches();
    }
  }, [initialProduct, initialBatches]);

  const refreshBatches = async () => {
    // We can also show loading here if desired, but usually refresh is quick after an action
    // For now, let's keep it simple as user mainly asked for "first open" / initial load
    if (initialProduct) {
      const updated = await cashierService.getStockBatches(initialProduct.id);
      setBatches(updated);
    } else {
      const productId = window.tempProductId;
      if (productId) {
        const updated = await cashierService.getStockBatches(productId);
        setBatches(updated);
      }
    }
  };

  const handleAddBatch = async (
    batch: Omit<StockBatch, 'id' | 'productId' | 'isSoldOut'>
  ) => {
    const productId =
      initialProduct?.id || window.tempProductId || crypto.randomUUID();
    if (!initialProduct) {
      window.tempProductId = productId;
    }

    await cashierService.addStock(productId, batch);
    await refreshBatches();
  };

  const handleToggleSoldOut = async (batchId: string) => {
    const batch = batches.find((b) => b.id === batchId);
    if (batch) {
      const updatedBatch = { ...batch, isSoldOut: !batch.isSoldOut };
      await cashierService.updateStockBatch(updatedBatch);
      await refreshBatches();
    }
  };

  const handleUpdateBatch = async (batch: StockBatch) => {
    await cashierService.updateStockBatch(batch);
    await refreshBatches();
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode || !name || !price) return;

    const productId =
      initialProduct?.id || window.tempProductId || crypto.randomUUID();

    const product: Product = {
      id: productId,
      barcode,
      name,
      price: parseFloat(price),
    };

    await cashierService.saveProduct(product);

    if (window.tempProductId) delete window.tempProductId;

    onSave();
  };

  return (
    <form onSubmit={handleFinalSubmit} className='space-y-6'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Barcode
          </label>
          <input
            type='text'
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            required
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Product Name
          </label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            required
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Price
          </label>
          <input
            type='number'
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            required
            min='0'
          />
        </div>
      </div>

      <div className='border-t border-gray-200 pt-4'>
        {isLoadingBatches ? (
          <div className='flex justify-center py-8'>
            <LoadingSpinner size='md' />
          </div>
        ) : (
          <>
            <ExpirationManager
              batches={batches}
              onAddBatch={handleAddBatch}
              onUpdateBatch={handleUpdateBatch}
              onToggleSoldOut={handleToggleSoldOut}
            />
            {!initialProduct && batches.length === 0 && (
              <p className='text-xs text-yellow-600 mt-2'>
                Note: You can add stock after saving, or add it now.
              </p>
            )}
          </>
        )}
      </div>

      <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
        <Button variant='outline' onClick={onCancel} className='text-sm'>
          Cancel
        </Button>
        <Button
          type='submit'
          className='text-sm flex items-center gap-2 bg-blue-600 hover:bg-blue-700'
        >
          <MdSave size={16} />
          Save Product
        </Button>
      </div>
    </form>
  );
}
