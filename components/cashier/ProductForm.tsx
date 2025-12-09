

import { useState, useMemo } from 'react';
import {
  Product,
  StockBatch,
  cashierService,
} from '@/lib/services/cashier-service';
import ExpirationManager from './ExpirationManager';
import { MdSave } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';


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




  const [deletedBatchIds, setDeletedBatchIds] = useState<Set<string>>(new Set());

  const unsavedBatchIds = useMemo(() => {
    const unsaved = new Set<string>();
    const initialMap = new Map(
      (initialBatches || []).map((b) => [b.addedDate, b])
    );

    batches.forEach((batch) => {
      if (deletedBatchIds.has(batch.addedDate)) return;

      const initial = initialMap.get(batch.addedDate);
      if (!initial) {
        unsaved.add(batch.addedDate);
      } else {
        if (
          initial.quantity !== batch.quantity ||
          initial.expirationDate !== batch.expirationDate ||
          initial.isSoldOut !== batch.isSoldOut
        ) {
          unsaved.add(batch.addedDate);
        }
      }
    });
    return unsaved;
  }, [batches, initialBatches, deletedBatchIds]);

  const handleAddBatch = (
    batch: Omit<StockBatch, 'productId' | 'isSoldOut'>
  ) => {
    const productId = initialProduct?.id || name;

    const newBatch: StockBatch = {
      ...batch,
      productId,
      isSoldOut: false,
    };
    setBatches([...batches, newBatch]);
  };

  const handleToggleSoldOut = (batchId: string) => {
    const batch = batches.find((b) => b.addedDate === batchId);
    if (batch) {
      const updatedBatch = { ...batch, isSoldOut: !batch.isSoldOut };
      setBatches(
        batches.map((b) => (b.addedDate === batchId ? updatedBatch : b))
      );
    }
  };

  const handleUpdateBatch = (batch: StockBatch) => {
    setBatches(
      batches.map((b) => (b.addedDate === batch.addedDate ? batch : b))
    );
  };

  const handleDeleteBatch = (batchId: string) => {
    const isExisting = initialBatches?.some((b) => b.addedDate === batchId);

    if (isExisting) {
      const newDeleted = new Set(deletedBatchIds);
      if (newDeleted.has(batchId)) {
        newDeleted.delete(batchId);
      } else {
        newDeleted.add(batchId);
      }
      setDeletedBatchIds(newDeleted);
    } else {
      setBatches(batches.filter((b) => b.addedDate !== batchId));
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode || !name || !price) return;

    const allProducts = await cashierService.getProducts();
    const duplicate = allProducts.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );

    if (!initialProduct && duplicate) {
      toast.error(
        'A product with this name already exists. Please use a different name.'
      );
      return;
    }

    if (initialProduct && name !== initialProduct.name && duplicate) {
      toast.error(
        'A product with this name already exists. Please use a different name.'
      );
      return;
    }

    const finalBatches = batches.filter((b) => !deletedBatchIds.has(b.addedDate));

    const product: Product = {
      id: initialProduct?.id || name,
      barcode,
      name,
      price: parseFloat(price),
      stock: finalBatches,
    };

    await cashierService.saveProduct(product);

    onSave();
  };

  const getInputClass = (current: string, initial?: string) => {
    const baseClass =
      'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
    if (initial !== undefined && current !== initial) {
      return `${baseClass} border-yellow-400 bg-yellow-50`;
    }
    return `${baseClass} border-gray-300`;
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
            className={getInputClass(barcode, initialProduct?.barcode)}
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
            className={getInputClass(name, initialProduct?.name)}
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
            className={getInputClass(
              price,
              initialProduct?.price?.toString()
            )}
            required
            min='0'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Total Sold
          </label>
          <input
            type='text'
            value={`${initialProduct?.sold || 0} units`}
            disabled
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm'
          />
        </div>
      </div>

      <div className='border-t border-gray-200 pt-4'>
        <ExpirationManager
          batches={batches}
          onAddBatch={handleAddBatch}
          onUpdateBatch={handleUpdateBatch}
          onDeleteBatch={handleDeleteBatch}
          onToggleSoldOut={handleToggleSoldOut}
          unsavedBatchIds={unsavedBatchIds}
          deletedBatchIds={deletedBatchIds}
        />
        {!initialProduct && batches.length === 0 && (
          <p className='text-xs text-yellow-600 mt-2'>
            Note: You can add stock after saving, or add it now.
          </p>
        )}
      </div>

      <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
        <Button variant='outline' onClick={onCancel} className='text-sm' type='button'>
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
