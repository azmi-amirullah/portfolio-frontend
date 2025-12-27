import {
  useState,
  useEffect,
  useCallback,
  startTransition,
  useMemo,
} from 'react';
import {
  Product,
  StockBatch,
  cashierService,
} from '@/lib/services/cashier-service';

export type ProductWithStock = Product & {
  availableStock: number;
  batches: StockBatch[];
};

export type SortField = 'name' | 'price' | 'stock' | 'createdAt' | 'lastEditAt';
export type SortOrder = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 25;

export function useInventory() {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

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
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (!productToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await cashierService.deleteProduct(productToDelete.name);
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      refreshProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      setIsDeleting(false);
    }
  }, [productToDelete, refreshProducts, isDeleting]);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  }, []);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.includes(searchTerm)
    );

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.availableStock - b.availableStock;
          break;
        case 'createdAt':
          const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          comparison = aCreated - bCreated;
          break;
        case 'lastEditAt':
          const aEdit = a.lastEditAt ? new Date(a.lastEditAt).getTime() : 0;
          const bEdit = b.lastEditAt ? new Date(b.lastEditAt).getTime() : 0;
          comparison = aEdit - bEdit;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [products, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages || 1)));
    },
    [totalPages]
  );

  return {
    // Data
    products,
    filteredProducts,
    paginatedProducts,
    isLoading,
    searchTerm,
    isSyncing,
    sortBy,
    sortOrder,

    // Pagination
    currentPage,
    pageSize,
    totalPages,
    totalItems: filteredProducts.length,

    // Modal state
    isModalOpen,
    editingProduct,
    isEditMode,
    isDeleteModalOpen,
    productToDelete,
    isDeleting,

    // Actions
    setSearchTerm,
    setIsEditMode,
    setSortBy,
    setSortOrder,
    setPageSize,
    goToPage,
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
