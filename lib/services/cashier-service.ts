import { authService } from './auth-service';
import { toast } from 'react-toastify';
import { apiFetch } from '../api';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  buyPrice: number;
  sold?: number;
  stock?: StockBatch[];
}

export interface StockBatch {
  productId: string;
  expirationDate: string; // Format: YYYY-MM-DD
  addedDate: string; // ISO timestamp, also serves as unique ID
  quantity: number;
  isSoldOut: boolean; // Manual override to mark batch as unavailable
}

export interface Transaction {
  id: string; // timestamp as string
  timestamp: number;
  products: {
    productId: string;
    productName: string;
    productBarcode: string;
    price: number;
    buyPrice: number;
    quantity: number;
  }[];
  totalAmount: number;
  amountPaid: number;
  change: number;
}

export interface CashierData {
  products: (Product & { stock?: StockBatch[] })[];
  sales: Transaction[];
}

class CashierService {
  private syncPromise: Promise<boolean> | null = null;
  private salesSyncPromise: Promise<void> | null = null;
  private initialSyncDone = false;
  private initialSalesSyncDone = false;

  private getStorageKey(key: string): string {
    const user = authService.getUser();
    if (!user) return key;
    return `cashier_${user.username}_${key}`;
  }

  private get<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    try {
      const storageKey = this.getStorageKey(key);
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to parse localStorage data:', error);
      return [];
    }
  }

  private set<T>(key: string, data: T[]) {
    if (typeof window === 'undefined') return;
    const storageKey = this.getStorageKey(key);
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  async syncWithBackend(token?: string): Promise<boolean> {
    // If already syncing, return the existing promise
    if (this.syncPromise) {
      return this.syncPromise;
    }

    // Create new sync promise
    this.syncPromise = (async () => {
      try {
        const jwt = token || authService.getToken();
        if (!jwt) {
          return false;
        }

        const user = authService.getUser();
        if (!user) {
          return false;
        }

        const response = await apiFetch('/api/frontend/getProducts', {
          method: 'GET',
          headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
        });

        if (!response.ok) {
          return false;
        }

        const data: { products: (Product & { stock?: StockBatch[] })[] } =
          await response.json();

        // Store the fetched data in localStorage with username prefix
        if (typeof window !== 'undefined') {
          const prefix = `cashier_${user.username}_`;
          const products = data.products || [];
          localStorage.setItem(`${prefix}products`, JSON.stringify(products));
        }

        this.initialSyncDone = true;
        return true;
      } catch (error) {
        console.error('Sync error:', error);
        toast.error('Failed to sync products. Please try again.');
        return false;
      } finally {
        this.syncPromise = null;
      }
    })();

    return this.syncPromise;
  }

  hasData(): boolean {
    if (typeof window === 'undefined') return false;
    const user = authService.getUser();
    if (!user) return false;

    const prefix = `cashier_${user.username}_`;
    const products = localStorage.getItem(`${prefix}products`);

    return !!(products && products !== '[]');
  }

  async getProducts(): Promise<Product[]> {
    const products = this.get<Product>('products');
    if (products.length === 0 && !this.initialSyncDone) {
      await this.syncWithBackend();
      return this.get<Product>('products');
    }
    return products;
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find((p) => p.barcode === barcode);
  }

  async saveProduct(product: Product): Promise<void> {
    const products = await this.getProducts();
    const existingProduct = products.find((p) => p.id === product.id);

    try {
      const token = authService.getToken();
      if (!token) throw new Error('No authentication token');

      // Ensure we preserve the 'sold' count from the existing product if it's not provided in the update
      // This acts as a guard to prevent accidental overwrites of the sold count
      const productToSave = {
        ...product,
        sold: existingProduct?.sold || product.sold || 0,
      };

      let response;
      if (existingProduct) {
        // Edit existing product
        response = await apiFetch('/api/frontend/editProduct', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oldName: existingProduct.name,
            product: productToSave,
          }),
        });
      } else {
        // Add new product
        response = await apiFetch('/api/frontend/addProduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: productToSave }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || 'Failed to save product');
      }

      // Update local storage directly instead of fetching from backend
      const allProducts = this.get<Product>('products');
      const productIndex = allProducts.findIndex(
        (p) => p.id === productToSave.id
      );

      if (productIndex >= 0) {
        // Update existing product
        allProducts[productIndex] = productToSave;
      } else {
        // Add new product
        allProducts.push(productToSave);
      }

      // If editing and name changed, also update the ID to match the new name
      if (existingProduct && existingProduct.name !== productToSave.name) {
        // Update the product ID to the new name for consistency
        allProducts[
          productIndex >= 0 ? productIndex : allProducts.length - 1
        ].id = productToSave.name;
      }

      this.set('products', allProducts);
      toast.success('Product saved successfully');
    } catch (error: unknown) {
      console.error('Save product error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to save product';
      toast.error(message);
      throw error;
    }
  }

  async deleteProduct(productName: string): Promise<void> {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('No authentication token');

      const response = await apiFetch('/api/frontend/deleteProduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error?.message || 'Failed to delete product'
        );
      }

      // Update local storage directly instead of fetching from backend
      const allProducts = this.get<Product>('products');
      const filteredProducts = allProducts.filter(
        (p) => p.name !== productName
      );
      this.set('products', filteredProducts);

      toast.success('Product deleted successfully');
    } catch (error: unknown) {
      console.error('Delete product error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to delete product';
      toast.error(message);
      throw error;
    }
  }

  async getStockBatches(productId: string): Promise<StockBatch[]> {
    const product = await this.getProductById(productId);
    return product?.stock || [];
  }

  async getProductById(productId: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find((p) => p.id === productId);
  }

  async addStock(
    productId: string,
    batch: Omit<StockBatch, 'productId' | 'isSoldOut'>
  ): Promise<void> {
    const product = await this.getProductById(productId);

    if (product) {
      const newBatch: StockBatch = {
        ...batch,
        productId,
        isSoldOut: false,
      };

      const updatedProduct = {
        ...product,
        stock: [...(product.stock || []), newBatch],
      };

      await this.saveProduct(updatedProduct);
    }
  }

  async updateStockBatch(batch: StockBatch): Promise<void> {
    const product = await this.getProductById(batch.productId);

    if (product && product.stock) {
      const updatedStock = product.stock.map((s) =>
        s.addedDate === batch.addedDate ? batch : s
      );

      const updatedProduct = {
        ...product,
        stock: updatedStock,
      };
      await this.saveProduct(updatedProduct);
    }
  }

  async saveSaleToBackend(transaction: Transaction): Promise<void> {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('No authentication token');

      const response = await apiFetch('/api/frontend/saveSale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error?.message || 'Failed to save transaction to backend'
        );
      }
    } catch (error) {
      console.error('Failed to save transaction to backend:', error);
      throw error; // Re-throw to let caller handle error display
    }
  }

  async processSale(
    cartItems: {
      productId: string;
      quantity: number;
      price: number;
      buyPrice: number;
      name: string;
      barcode: string;
    }[],
    paymentDetails: {
      amountPaid: number;
      grandTotal: number;
    }
  ): Promise<void> {
    const timestamp = Date.now();
    const transactionId = timestamp.toString();

    const transaction: Transaction = {
      id: transactionId,
      timestamp,
      products: cartItems.map((item) => ({
        productId: item.productId,
        productName: item.name,
        productBarcode: item.barcode,
        price: item.price,
        buyPrice: item.buyPrice,
        quantity: item.quantity,
      })),
      totalAmount: paymentDetails.grandTotal,
      amountPaid: paymentDetails.amountPaid,
      change: paymentDetails.amountPaid - paymentDetails.grandTotal,
    };

    // 1. Try to save to backend FIRST
    await this.saveSaleToBackend(transaction);

    // 2. If successful, update local state
    const allSales = this.get<Transaction>('sales');
    const products = this.get<Product>('products');

    allSales.push(transaction);

    // Update local product sold count
    transaction.products.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        product.sold = (product.sold || 0) + item.quantity;
      }
    });

    this.set('sales', allSales);
    this.set('products', products);
  }

  async syncSalesWithBackend(): Promise<void> {
    // If already syncing, return the existing promise
    if (this.salesSyncPromise) {
      return this.salesSyncPromise;
    }

    // Create new sync promise
    this.salesSyncPromise = (async () => {
      try {
        const token = authService.getToken();
        if (!token) return;

        const response = await apiFetch('/api/frontend/getSales');

        if (!response.ok) {
          throw new Error('Failed to fetch sales history');
        }

        const data: { sales: Transaction[] } = await response.json();
        const sales = data.sales || [];

        this.set('sales', sales);
      } catch (error) {
        console.error('Sync sales error:', error);
        // Don't throw, just log error so UI doesn't break
        toast.error('Failed to sync sales history.');
      } finally {
        this.salesSyncPromise = null;
      }
    })();

    return this.salesSyncPromise;
  }

  async getSalesHistory(): Promise<Transaction[]> {
    const allSales = this.get<Transaction>('sales');

    // Auto-fetch if local data is empty and not yet synced
    if (allSales.length === 0 && !this.initialSalesSyncDone) {
      await this.syncSalesWithBackend();
      this.initialSalesSyncDone = true;
      const syncedSales = this.get<Transaction>('sales');
      return syncedSales.sort((a, b) => b.timestamp - a.timestamp);
    }

    return allSales.sort((a, b) => b.timestamp - a.timestamp);
  }

  async getProductStock(productId: string): Promise<number> {
    const batches = await this.getStockBatches(productId);
    const products = this.get<Product>('products');
    const product = products.find((p) => p.id === productId);

    const totalAdded = batches.reduce((sum, batch) => sum + batch.quantity, 0);
    const sold = product?.sold || 0;

    return totalAdded - sold;
  }

  async getProductsWithStock(): Promise<
    (Product & {
      availableStock: number;
      batches: StockBatch[];
    })[]
  > {
    let products = this.get<Product>('products');

    // Auto-fetch if local data is empty and not yet synced
    if (products.length === 0 && !this.initialSyncDone) {
      await this.syncWithBackend();
      this.initialSyncDone = true;
      products = this.get<Product>('products');
    }

    return products.map((product) => {
      const batches = product.stock || [];

      const totalAdded = batches.reduce(
        (sum, batch) => sum + batch.quantity,
        0
      );
      const sold = product.sold || 0;

      return {
        ...product,
        availableStock: totalAdded - sold,
        batches,
      };
    });
  }
}

export const cashierService = new CashierService();
