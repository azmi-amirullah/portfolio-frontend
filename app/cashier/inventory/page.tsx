'use client';

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
import ProductForm from '@/components/cashier/ProductForm';
import { PageHeader } from '@/components/cashier/PageHeader';
import { Table } from '@/components/cashier/Table';
import { useInventory } from '@/lib/hooks/useInventory';
import { MobileProductCard } from '@/components/cashier/MobileProductCard';
import { DeleteConfirmModal } from '@/components/cashier/DeleteConfirmModal';
import { ProductViewModal } from '@/components/cashier/ProductViewModal';

export default function InventoryPage() {
  const {
    filteredProducts,
    isLoading,
    searchTerm,
    isSyncing,
    isModalOpen,
    editingProduct,
    isEditMode,
    isDeleteModalOpen,
    productToDelete,
    setSearchTerm,
    setIsEditMode,
    handleSync,
    handleAddClick,
    handleViewClick,
    handleEditClick,
    handleSave,
    handleCloseModal,
    handleDeleteClick,
    confirmDelete,
    handleCloseDeleteModal,
  } = useInventory();

  return (
    <div className='space-y-4 lg:space-y-6 md:pb-0'>
      <PageHeader
        icon={MdInventory}
        title='Inventory Management'
        subtitle='Manage your product inventory and stock'
        actions={
          <>
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              className='flex items-center gap-2 w-full sm:w-auto justify-center bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 shadow-sm'
            >
              <MdSync size={20} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </Button>
            <Button
              onClick={handleAddClick}
              className='flex items-center gap-2 bg-blue-600 hover:bg-blue-800 w-full sm:w-auto justify-center shadow-sm shadow-blue-200'
            >
              <MdAdd size={20} />
              <span>New</span>
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
          className='block w-full pl-10 pr-3 py-3 lg:py-2 border border-gray-200 rounded-lg lg:rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-base h-10'
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
                {searchTerm
                  ? 'Try adjusting your search query'
                  : 'Add your first product to get started'}
              </p>
            </div>
          ) : (
            <div className='md:hidden space-y-3'>
              {filteredProducts.map((product) => (
                <MobileProductCard
                  key={product.id}
                  product={product}
                  onClick={() => handleViewClick(product)}
                />
              ))}
            </div>
          )}

          <Table
            columns={[
              { header: 'Barcode', key: 'barcode' },
              { header: 'Name', key: 'name' },
              {
                header: 'Buy Price',
                renderRow: (product) => (
                  <span>Rp {(product.buyPrice || 0).toLocaleString()}</span>
                ),
              },
              {
                header: 'Margin',
                renderRow: (product) => {
                  const margin = product.price - (product.buyPrice || 0);
                  return (
                    <span
                      className={`${
                        margin > 0
                          ? 'text-green-600'
                          : margin < 0
                          ? 'text-red-600'
                          : ''
                      }`}
                    >
                      Rp {margin.toLocaleString()}
                    </span>
                  );
                },
              },
              {
                header: 'Sell Price',
                renderRow: (product) => (
                  <span>Rp {product.price.toLocaleString()}</span>
                ),
              },
              {
                header: 'Stock',
                renderRow: (product) => (
                  <span
                    className={`px-2 inline-flex leading-5 font-medium rounded-full ${
                      product.availableStock > 0
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {product.availableStock}
                  </span>
                ),
              },
              {
                header: 'Actions',
                align: 'right',
                renderRow: (product) => (
                  <div className='flex justify-end'>
                    <Button
                      variant='ghost'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewClick(product);
                      }}
                      className='text-green-600 hover:text-green-800 p-2 h-auto mr-2'
                      aria-label='View product'
                    >
                      <MdVisibility size={18} />
                    </Button>
                    <Button
                      variant='ghost'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(product);
                      }}
                      className='text-blue-600 hover:text-blue-800 p-2 h-auto mr-2'
                      aria-label='Edit product'
                    >
                      <MdEdit size={18} />
                    </Button>
                    <Button
                      variant='ghost'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(product);
                      }}
                      className='text-red-600 hover:text-red-800 p-2 h-auto'
                      aria-label='Delete product'
                    >
                      <MdDelete size={18} />
                    </Button>
                  </div>
                ),
              },
            ]}
            data={filteredProducts}
            onRowClick={handleViewClick}
            emptyState={{
              icon: MdInventory,
              title: 'No products found',
              subtitle: searchTerm
                ? 'Try adjusting your search query'
                : 'Add your first product to get started',
            }}
          />
        </>
      )}

      {/* Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        maxWidth='4xl'
        title={
          !editingProduct
            ? 'New Product'
            : isEditMode
            ? 'Edit Product'
            : 'Product Details'
        }
        headerIcon={<MdInventory size={24} />}
        headerClassName='bg-blue-600 border-blue-400 text-white'
      >
        <div className='p-4 sm:p-6'>
          {isEditMode || !editingProduct ? (
            <ProductForm
              initialProduct={editingProduct}
              initialBatches={editingProduct?.batches}
              onSave={handleSave}
              onCancel={handleCloseModal}
            />
          ) : (
            <ProductViewModal
              product={editingProduct}
              onEdit={() => setIsEditMode(true)}
            />
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        itemName={productToDelete?.name || ''}
        onConfirm={confirmDelete}
        onCancel={handleCloseDeleteModal}
      />
    </div>
  );
}
