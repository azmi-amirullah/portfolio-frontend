'use client';

import { useState, useEffect, startTransition } from 'react';
import {
  Product,
  StockBatch,
  cashierService,
} from '@/lib/services/cashier-service';
import ProductForm from '@/components/cashier/ProductForm';
import { PageHeader } from '@/components/cashier/PageHeader';
import { Table } from '@/components/cashier/Table';
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
import Loading from '@/components/ui/Loading';


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
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    cashierService.getProductsWithStock().then((data) => {
      startTransition(() => {
        setProducts(data);
        setIsLoading(false);
      });
    });
  }, []);

  const refreshProducts = async () => {
    const allProducts = await cashierService.getProductsWithStock();
    startTransition(() => {
      setProducts(allProducts);
    });
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
      <PageHeader
        icon={MdInventory}
        title='Inventory Management'
        subtitle='Manage your product inventory and stock'
        actions={
          <>
            <Button
              onClick={async () => {
                setIsSyncing(true);
                setIsLoading(true);
                try {
                  await cashierService.syncWithBackend();
                  await refreshProducts();
                } finally {
                  setIsSyncing(false);
                  setIsLoading(false);
                }
              }}
              disabled={isSyncing}
              className='flex items-center gap-2 w-full sm:w-auto justify-center bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
            >
              <MdSync size={20} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </Button>
            <Button
              onClick={handleAddClick}
              className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto justify-center'
            >
              <MdAdd size={20} />
              <span>Add Product</span>
            </Button>
          </>
        }
      />

      {/* Search */}
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <MdSearch className='h-5 w-5 text-gray-500' />
        </div>
        <input
          type='text'
          placeholder='Search by name or barcode...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='block w-full pl-10 pr-3 py-3 lg:py-2 border border-gray-300 rounded-lg lg:rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-base h-10'
        />
      </div>

      {/* Product List */}
      {isLoading ? (
        <div className='bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-12 text-center'>
          <Loading />
        </div>
      ) : (
        <>
          {/* Mobile Card Layout */}
          {filteredProducts.length === 0 ? (
            <div className='md:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center'>
              <div className='bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                <MdInventory size={32} className='text-gray-500' />
              </div>
              <h3 className='text-lg font-medium text-gray-500 mb-1'>
                No products found
              </h3>
              <p className='text-gray-500'>
                {searchTerm ? 'Try adjusting your search query' : 'Add your first product to get started'}
              </p>
            </div>
          ) : (
            <div className='md:hidden space-y-3'>
              {filteredProducts.map((product) => {
                const margin = product.price - (product.buyPrice || 0);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleViewClick(product)}
                    className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 active:bg-gray-50 transition-colors cursor-pointer'
                  >
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <div className='text-gray-500'>
                          {product.barcode}
                        </div>
                        <div className='mt-1'>
                          {product.name}
                        </div>
                        <div className='text-blue-600 mt-1'>
                          Rp {product.price.toLocaleString()}
                        </div>
                      </div>
                      <div className='text-right'>
                        <span
                          className={`px-2 py-1 font-medium rounded-full ${product.availableStock > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {product.availableStock}
                        </span>
                        <div className={`mt-2 ${margin > 0 ? 'text-green-600' : margin < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          Margin: Rp {margin.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Table
            columns={[
              { header: 'Barcode', key: 'barcode' },
              { header: 'Name', key: 'name' },
              {
                header: 'Buy Price',
                renderRow: (product) => <span>Rp {(product.buyPrice || 0).toLocaleString()}</span>
              },
              {
                header: 'Margin',
                renderRow: (product) => {
                  const margin = product.price - (product.buyPrice || 0);
                  return (
                    <span className={`${margin > 0 ? 'text-green-600' : margin < 0 ? 'text-red-600' : ''}`}>
                      Rp {margin.toLocaleString()}
                    </span>
                  );
                }
              },
              {
                header: 'Sell Price',
                renderRow: (product) => <span>Rp {product.price.toLocaleString()}</span>
              },
              {
                header: 'Stock',
                renderRow: (product) => (
                  <span className={`px-2 inline-flex leading-5 font-medium rounded-full ${product.availableStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {product.availableStock}
                  </span>
                )
              },
              {
                header: 'Actions',
                align: 'right',
                renderRow: (product) => (
                  <div className='flex justify-end'>
                    <Button
                      variant='ghost'
                      onClick={(e) => { e.stopPropagation(); handleViewClick(product); }}
                      className='text-green-600 hover:text-green-800 p-2 h-auto mr-2'
                    >
                      <MdVisibility size={18} />
                    </Button>
                    <Button
                      variant='ghost'
                      onClick={(e) => { e.stopPropagation(); handleEditClick(product); }}
                      className='text-blue-600 hover:text-blue-800 p-2 h-auto mr-2'
                    >
                      <MdEdit size={18} />
                    </Button>
                    <Button
                      variant='ghost'
                      onClick={(e) => { e.stopPropagation(); handleDelete(product); }}
                      className='text-red-600 hover:text-red-800 p-2 h-auto'
                    >
                      <MdDelete size={18} />
                    </Button>
                  </div>
                )
              },
            ]}
            data={filteredProducts}
            onRowClick={handleViewClick}
            emptyState={{
              icon: MdInventory,
              title: 'No products found',
              subtitle: searchTerm ? 'Try adjusting your search query' : 'Add your first product to get started',
            }}
          />
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
        }}
        maxWidth='4xl'
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
                  <label className='block font-medium'>
                    Barcode
                  </label>
                  <div className='mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md '>
                    {editingProduct.barcode}
                  </div>
                </div>
                <div>
                  <label className='block font-medium'>
                    Product Name
                  </label>
                  <div className='mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md '>
                    {editingProduct.name}
                  </div>
                </div>
                <div>
                  <label className='block font-medium'>
                    Buy Price (Cost)
                  </label>
                  <div className='mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md '>
                    Rp {(editingProduct.buyPrice || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className='block font-medium'>
                    Sell Price
                  </label>
                  <div className='mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-blue-600'>
                    Rp {editingProduct.price.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className='block font-medium'>
                    Margin (per unit)
                  </label>
                  {(() => {
                    const margin = editingProduct.price - (editingProduct.buyPrice || 0);
                    return (
                      <div className={`mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md ${margin > 0 ? 'text-green-600' : margin < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        Rp {margin.toLocaleString()}
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className='block font-medium'>
                    Total Sold
                  </label>
                  <div className='mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md '>
                    {editingProduct.sold || 0} units
                  </div>
                </div>
              </div>

              {/* Stock Table - Read-only */}
              <div className='border-t border-gray-200 pt-4'>
                <h3 className='font-medium mb-3'>
                  Stock Batches
                </h3>
                <div className='border rounded-md overflow-x-auto'>
                  <Table
                    size='sm'
                    className='block max-h-60 overflow-y-auto'
                    columns={[
                      {
                        header: 'Exp. Date',
                        renderRow: (batch) => (
                          <span className={batch.isSoldOut ? 'line-through text-gray-500' : ''}>
                            {new Date(batch.expirationDate).toLocaleDateString('en-GB')}
                          </span>
                        )
                      },
                      {
                        header: 'Created At',
                        renderRow: (batch) => (
                          <span className={batch.isSoldOut ? 'line-through text-gray-500' : ''}>
                            {new Date(batch.addedDate).toLocaleString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </span>
                        )
                      },
                      {
                        header: 'Qty',
                        renderRow: (batch) => (
                          <span className={batch.isSoldOut ? 'line-through text-gray-500' : ''}>
                            {batch.quantity}
                          </span>
                        )
                      },
                      {
                        header: 'Status',
                        renderRow: (batch) => (
                          <span
                            className={`px-2 py-1 rounded-full ${batch.isSoldOut
                              ? 'bg-red-100 text-red-800 font-medium'
                              : 'bg-green-100 text-green-800'
                              }`}
                          >
                            {batch.isSoldOut ? 'Unavailable' : 'Available'}
                          </span>
                        )
                      }
                    ]}
                    data={editingProduct.batches}
                    rowKey={(batch) => batch.addedDate}
                    emptyState={{
                      icon: MdInventory, // Ignored in sm
                      title: 'No stock batches available.',
                      subtitle: '', // Ignored in sm
                    }}
                  />
                </div>
              </div>

              {/* Edit Button */}
              <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
                <Button
                  onClick={() => setIsEditMode(true)}
                  className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700'
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
          <p className='mb-1'>
            Are you sure you want to delete{' '}
            <span className='font-medium '>
              &quot;{productToDelete?.name}&quot;
            </span>
            ?
          </p>
          <p className='text-gray-500'>
            ⚠️ This action cannot be undone.
          </p>
          <div className='flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200'>
            <Button
              variant='outline'
              onClick={() => {
                setIsDeleteModalOpen(false);
                setProductToDelete(null);
              }}
              className=''
              type='button'
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className='bg-red-600 hover:bg-red-700'
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
