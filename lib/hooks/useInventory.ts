import { useState, useEffect, useCallback, startTransition } from 'react';
import {
  Product,
  StockBatch,
  cashierService,
} from '@/lib/services/cashier-service';

export type ProductWithStock = Product & {
  availableStock: number;
  batches: StockBatch[];
};

export function useInventory() {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<
    (Product & { batches: StockBatch[] }) | undefined
  >(undefined);
  const [isEditMode, setIsEditMode] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<
    (Product & { batches: StockBatch[] }) | null
  >(null);

  useEffect(() => {
    cashierService.getProductsWithStock().then((data) => {
      startTransition(() => {
        setProducts(data);
        setIsLoading(false);
      });
    });
  }, []);

  const refreshProducts = useCallback(async () => {
    const allProducts = await cashierService.getProductsWithStock();
    startTransition(() => {
      setProducts(allProducts);
    });
  }, []);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    setIsLoading(true);
    try {
      await cashierService.syncWithBackend();
      await refreshProducts();
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, [refreshProducts]);

  const handleAddClick = useCallback(() => {
    setEditingProduct(undefined);
    setIsEditMode(true);
    setIsModalOpen(true);
  }, []);

  const handleViewClick = useCallback(
    (product: Product & { batches: StockBatch[] }) => {
      setEditingProduct(product);
      setIsEditMode(false);
      setIsModalOpen(true);
    },
    []
  );

  const handleEditClick = useCallback(
    (product: Product & { batches: StockBatch[] }) => {
      setEditingProduct(product);
      setIsEditMode(true);
      setIsModalOpen(true);
    },
    []
  );

  const handleSave = useCallback(() => {
    setIsModalOpen(false);
    refreshProducts();
  }, [refreshProducts]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setIsEditMode(false);
  }, []);

  const handleDeleteClick = useCallback(
    (product: Product & { batches: StockBatch[] }) => {
      setProductToDelete(product);
      setIsDeleteModalOpen(true);
    },
    []
  );

  const confirmDelete = useCallback(async () => {
    if (!productToDelete) return;

    try {
      await cashierService.deleteProduct(productToDelete.name);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      refreshProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  }, [productToDelete, refreshProducts]);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm)
  );

  return {
    // Data
    products,
    filteredProducts,
    isLoading,
    searchTerm,
    isSyncing,

    // Modal state
    isModalOpen,
    editingProduct,
    isEditMode,
    isDeleteModalOpen,
    productToDelete,

    // Actions
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
  };
}
