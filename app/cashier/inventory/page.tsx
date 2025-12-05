'use client';

import { useState, useEffect } from 'react';
import {
  Product,
  StockBatch,
  cashierService,
} from '@/lib/services/cashier-service';
import ProductForm from '@/components/cashier/ProductForm';
import {
  MdAdd,
  MdEdit,
  MdSearch,
  MdInventory,
  MdVisibility,
  MdSync,
  MdDelete,
} from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function ProductRow({
  product,
  stock,
  onEdit,
  onView,
  onDelete,
}: {
  product: Product & { batches: StockBatch[] };
  stock: number;
  onEdit: (p: Product & { batches: StockBatch[] }) => void;
  onView: (p: Product & { batches: StockBatch[] }) => void;
  onDelete: (p: Product & { batches: StockBatch[] }) => void;
}) {
  return (
    <tr
      className='hover:bg-gray-50 cursor-pointer'
      onClick={() => onView(product)}
    >
      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
        {product.barcode}
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
        {product.name}
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
        Rp {product.price.toLocaleString()}
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
        <span
          className={`px-2 inline-flex leading-5 font-semibold rounded-full ${stock > 0
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
            }`}
        >
          {stock}
        </span>
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
        <Button
          variant='ghost'
          onClick={(e) => {
            e.stopPropagation();
            onView(product);
          }}
          className='text-green-600 hover:text-green-900 hover:bg-green-50 p-2 h-auto mr-2'
        >
          <MdVisibility size={18} />
        </Button>
        <Button
          variant='ghost'
          onClick={(e) => {
            e.stopPropagation();
            onEdit(product);
          }}
          className='text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 h-auto mr-2'
        >
          <MdEdit size={18} />
        </Button>
        <Button
          variant='ghost'
          onClick={(e) => {
            e.stopPropagation();
            onDelete(product);
          }}
          className='text-red-600 hover:text-red-900 hover:bg-red-50 p-2 h-auto'
        >
          <MdDelete size={18} />
        </Button>
      </td>
    </tr>
  );
}

export default function InventoryPage() {
  const [products, setProducts] = useState<
    (Product & { availableStock: number; batches: StockBatch[] })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<
    (Product & { batches: StockBatch[] }) | undefined
  >(undefined);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<
    (Product & { batches: StockBatch[] }) | null
  >(null);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const allProducts = cashierService.getProductsWithStock();
        setProducts(allProducts);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const refreshProducts = () => {
    const allProducts = cashierService.getProductsWithStock();
    setProducts(allProducts);
  };

  const handleAddClick = () => {
    setEditingProduct(undefined);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleViewClick = (product: Product & { batches: StockBatch[] }) => {
    setEditingProduct(product);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditClick = (product: Product & { batches: StockBatch[] }) => {
    setEditingProduct(product);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setIsModalOpen(false);
    refreshProducts();
  };

  const handleDelete = (product: Product & { batches: StockBatch[] }) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await cashierService.deleteProduct(productToDelete.name);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      refreshProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm)
  );

  return (
    <div className='space-y-4 lg:space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
        <div>
          <h1 className='text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 lg:gap-3'>
            <MdInventory className='text-blue-600' size={28} />
            <span>Inventory Management</span>
          </h1>
          <p className='text-gray-500 mt-1 text-sm lg:text-base'>
            Manage your product inventory and stock
          </p>
        </div>
        <div className='flex gap-2 w-full sm:w-auto'>
          <Button
            onClick={async () => {
              setIsLoading(true);
              await cashierService.syncWithBackend();
              refreshProducts();
              setIsLoading(false);
            }}
            variant='outline'
            className='flex items-center gap-2 w-full sm:w-auto justify-center'
          >
            <MdSync size={20} />
            <span>Sync</span>
          </Button>
          <Button
            onClick={handleAddClick}
            className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto justify-center'
          >
            <MdAdd size={20} />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <MdSearch className='h-5 w-5 text-gray-400' />
        </div>
        <input
          type='text'
          placeholder='Search by name or barcode...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='block w-full pl-10 pr-3 py-3 lg:py-2 border border-gray-300 rounded-lg lg:rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-base lg:text-sm h-10'
        />
      </div>

      {/* Product List */}
      {isLoading ? (
        <div className='bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-12 text-center'>
          <LoadingSpinner size='lg' />
          <p className='text-gray-500 mt-2'>Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className='bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-12 text-center'>
          <div className='bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
            <MdInventory size={32} className='text-gray-400' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-1'>
            No products found
          </h3>
          <p className='text-gray-500'>
            {searchTerm ? 'Try adjusting your search query' : 'Add your first product to get started'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className='lg:hidden space-y-3'>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleViewClick(product)}
                className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 active:bg-gray-50 transition-colors cursor-pointer'
              >
                <div className='flex justify-between items-start mb-3'>
                  <div className='flex-1'>
                    <div className='font-semibold text-gray-900'>
                      {product.name}
                    </div>
                    <div className='text-xs text-gray-500 mt-1'>
                      {product.barcode}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${product.availableStock > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {product.availableStock}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <div className='text-sm font-semibold text-blue-600'>
                    Rp {product.price.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className='hidden lg:block bg-white shadow overflow-hidden rounded-lg border border-gray-200'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Barcode
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Name
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Price
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Total Stock
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    stock={product.availableStock}
                    onEdit={handleEditClick}
                    onView={handleViewClick}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
        }}
        maxWidth='2xl'
        title={
          !editingProduct
            ? 'Add New Product'
            : isEditMode
              ? 'Edit Product'
              : 'Product Details'
        }
        headerIcon={<MdInventory size={24} />}
        headerClassName='bg-blue-600 border-blue-400 text-white'
      >
        <div className='p-6'>
          {isEditMode || !editingProduct ? (
            <ProductForm
              initialProduct={editingProduct}
              initialBatches={editingProduct?.batches}
              onSave={handleSave}
              onCancel={() => {
                setIsModalOpen(false);
                setIsEditMode(false);
              }}
            />
          ) : (
            <div className='space-y-6'>
              {/* Product Details View - Same layout as form */}
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Barcode
                  </label>
                  <div className='mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900'>
                    {editingProduct.barcode}
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Product Name
                  </label>
                  <div className='mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900'>
                    {editingProduct.name}
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Price
                  </label>
                  <div className='mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-semibold text-blue-600'>
                    Rp {editingProduct.price.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Total Sold
                  </label>
                  <div className='mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-semibold text-gray-900'>
                    {editingProduct.sold || 0} units
                  </div>
                </div>
              </div>

              {/* Stock Table - Read-only */}
              <div className='border-t border-gray-200 pt-4'>
                <h3 className='text-sm font-medium text-gray-700 mb-3'>
                  Stock Batches
                </h3>
                <div className='border rounded-md overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Exp. Date
                        </th>
                        <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Created At
                        </th>
                        <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Qty
                        </th>
                        <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {editingProduct.batches.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className='px-3 py-4 text-center text-sm text-gray-500'
                          >
                            No stock batches available.
                          </td>
                        </tr>
                      ) : (
                        editingProduct.batches.map((batch) => (
                          <tr
                            key={batch.addedDate}
                            className={batch.isSoldOut ? 'bg-gray-50' : ''}
                          >
                            <td
                              className={`px-3 py-2 text-sm text-gray-900 ${batch.isSoldOut
                                ? 'line-through text-gray-400'
                                : ''
                                }`}
                            >
                              {new Date(batch.expirationDate).toLocaleDateString('en-GB')}
                            </td>
                            <td
                              className={`px-3 py-2 text-sm text-gray-900 ${batch.isSoldOut
                                ? 'line-through text-gray-400'
                                : ''
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
                            </td>
                            <td
                              className={`px-3 py-2 text-sm text-gray-900 ${batch.isSoldOut
                                ? 'line-through text-gray-400'
                                : ''
                                }`}
                            >
                              {batch.quantity}
                            </td>
                            <td className='px-3 py-2 text-sm'>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${batch.isSoldOut
                                  ? 'bg-red-100 text-red-700 font-medium'
                                  : 'bg-green-100 text-green-700'
                                  }`}
                              >
                                {batch.isSoldOut ? 'Unavailable' : 'Available'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Edit Button */}
              <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
                <Button
                  onClick={() => setIsEditMode(true)}
                  className='text-sm flex items-center gap-2 bg-blue-600 hover:bg-blue-700'
                >
                  <MdEdit size={16} />
                  Edit Product
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        title='Delete Product'
        headerIcon={<MdDelete size={24} />}
        headerClassName='bg-red-600 border-red-400 text-white'
        maxWidth='md'
      >
        <div className='p-6'>
          <p className='text-gray-700 mb-1'>
            Are you sure you want to delete{' '}
            <span className='font-semibold text-gray-900'>
              &quot;{productToDelete?.name}&quot;
            </span>
            ?
          </p>
          <p className='text-sm text-gray-500'>
            ⚠️ This action cannot be undone.
          </p>
          <div className='flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200'>
            <Button
              variant='outline'
              onClick={() => {
                setIsDeleteModalOpen(false);
                setProductToDelete(null);
              }}
              className='text-sm'
              type='button'
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className='text-sm bg-red-600 hover:bg-red-700'
              type='button'
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
