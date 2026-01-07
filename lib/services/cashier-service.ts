import { authService } from './auth-service';
import { toast } from 'react-toastify';
import { createClient } from '../supabase/client';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  buyPrice: number;
  sold?: number;
  stock?: StockBatch[];
  createdAt?: string;
  lastEditAt?: string;
}

export interface StockBatch {
  productId: string;
  expirationDate: string;
  addedDate: string;
  quantity: number;
  isSoldOut: boolean;
}

export interface Transaction {
  id: string;
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
  private supabase = createClient();
  private syncPromise: Promise<boolean> | null = null;
  private salesSyncPromise: Promise<void> | null = null;
  private initialSyncDone = false;
  private initialSalesSyncDone = false;

  private async getStorageKey(key: string): Promise<string> {
    const user = await authService.getUser();
    if (!user) return key;
    return `cashier_${user.username || user.id}_${key}`;
  }

  private async get<T>(key: string): Promise<T[]> {
    if (typeof window === 'undefined') return [];
    try {
      const storageKey = await this.getStorageKey(key);
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to parse localStorage data:', error);
      return [];
    }
  }

  private async set<T>(key: string, data: T[]) {
    if (typeof window === 'undefined') return;
    const storageKey = await this.getStorageKey(key);
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  async syncWithBackend(): Promise<boolean> {
    if (this.syncPromise) {
      return this.syncPromise;
    }

    this.syncPromise = (async () => {
      try {
        const user = await authService.getUser();
        if (!user) return false;

        // Fetch products with stock batches from Supabase
        const { data: products, error } = await this.supabase
          .from('products')
          .select('*, stock_batches(*)')
          .order('name');

        if (error) {
          console.error('Sync error:', error);
          return false;
        }

        // Transform Supabase data to match our interface
        const transformedProducts: Product[] = (products || []).map((p) => ({
          id: p.name,
          name: p.name,
          barcode: p.barcode || '',
          price: Number(p.price),
          buyPrice: Number(p.buy_price) || 0,
          sold: p.sold || 0,
          createdAt: p.created_at,
          lastEditAt: p.last_edit_at,
          stock: (p.stock_batches || []).map((s: Record<string, unknown>) => ({
            productId: p.name,
            expirationDate: s.expiration_date || '',
            addedDate: s.added_date,
            quantity: s.quantity,
            isSoldOut: s.is_sold_out || false,
          })),
        }));

        await this.set('products', transformedProducts);
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

  async hasData(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const products = await this.get<Product>('products');
    return products.length > 0;
  }

  async getProducts(): Promise<Product[]> {
    const products = await this.get<Product>('products');
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
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const now = new Date().toISOString();

      if (existingProduct) {
        // Update existing product
        const { error } = await this.supabase
          .from('products')
          .update({
            name: product.name,
            barcode: product.barcode,
            price: product.price,
            buy_price: product.buyPrice || null,
            last_edit_at: now,
          })
          .eq('name', existingProduct.name)
          .eq('user_id', user.id);

        if (error) throw error;

        // Handle stock batches update
        if (product.stock) {
          // Delete existing batches and insert new ones
          await this.supabase
            .from('stock_batches')
            .delete()
            .eq('user_id', user.id)
            .in(
              'product_id',
              (
                await this.supabase
                  .from('products')
                  .select('id')
                  .eq('name', product.name)
                  .eq('user_id', user.id)
              ).data?.map((p) => p.id) || []
            );

          // Get the product ID
          const { data: productData } = await this.supabase
            .from('products')
            .select('id')
            .eq('name', product.name)
            .eq('user_id', user.id)
            .single();

          if (productData && product.stock.length > 0) {
            const batchesToInsert = product.stock.map((batch) => ({
              product_id: productData.id,
              user_id: user.id,
              expiration_date: batch.expirationDate || null,
              added_date: batch.addedDate,
              quantity: batch.quantity,
              is_sold_out: batch.isSoldOut,
            }));

            await this.supabase.from('stock_batches').insert(batchesToInsert);
          }
        }
      } else {
        // Insert new product
        const { data: newProduct, error } = await this.supabase
          .from('products')
          .insert({
            user_id: user.id,
            name: product.name,
            barcode: product.barcode,
            price: product.price,
            buy_price: product.buyPrice || null,
            sold: 0,
            created_at: now,
            last_edit_at: now,
          })
          .select()
          .single();

        if (error) throw error;

        // Insert stock batches if any
        if (product.stock && product.stock.length > 0 && newProduct) {
          const batchesToInsert = product.stock.map((batch) => ({
            product_id: newProduct.id,
            user_id: user.id,
            expiration_date: batch.expirationDate || null,
            added_date: batch.addedDate,
            quantity: batch.quantity,
            is_sold_out: batch.isSoldOut,
          }));

          await this.supabase.from('stock_batches').insert(batchesToInsert);
        }
      }

      // Refresh local cache
      await this.syncWithBackend();
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
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await this.supabase
        .from('products')
        .delete()
        .eq('name', productName)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local storage
      const allProducts = await this.get<Product>('products');
      const filteredProducts = allProducts.filter(
        (p) => p.name !== productName
      );
      await this.set('products', filteredProducts);

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
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

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

    let insertedTxId: number | null = null;

    try {
      // Insert transaction to Supabase
      const { data: txData, error: txError } = await this.supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          timestamp: new Date(timestamp).toISOString(),
          total_amount: transaction.totalAmount,
          amount_paid: transaction.amountPaid,
          change: transaction.change,
        })
        .select()
        .single();

      if (txError) throw txError;
      insertedTxId = txData.id;

      // Insert transaction items
      const items = transaction.products.map((item) => ({
        transaction_id: txData.id,
        product_id: item.productId,
        product_name: item.productName,
        product_barcode: item.productBarcode,
        price: item.price,
        buy_price: item.buyPrice,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await this.supabase
        .from('transaction_items')
        .insert(items);

      if (itemsError) throw itemsError;

      // Batch-fetch all products to avoid N+1 queries
      const productNames = cartItems.map((item) => item.productId);
      const { data: productsData } = await this.supabase
        .from('products')
        .select('name, sold')
        .eq('user_id', user.id)
        .in('name', productNames);

      const productSoldMap = new Map(
        (productsData || []).map((p) => [p.name, p.sold || 0])
      );

      // Update sold counts for products
      for (const item of cartItems) {
        const currentSold = productSoldMap.get(item.productId) || 0;

        await this.supabase
          .from('products')
          .update({ sold: currentSold + item.quantity })
          .eq('name', item.productId)
          .eq('user_id', user.id);
      }

      // Update local state
      const allSales = await this.get<Transaction>('sales');
      const products = await this.get<Product>('products');

      allSales.push(transaction);

      transaction.products.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          product.sold = (product.sold || 0) + item.quantity;
        }
      });

      await this.set('sales', allSales);
      await this.set('products', products);
    } catch (error) {
      // Cleanup orphaned transaction if items insert failed
      if (insertedTxId) {
        await this.supabase
          .from('transactions')
          .delete()
          .eq('id', insertedTxId);
      }
      throw error;
    }
  }

  async syncSalesWithBackend(): Promise<void> {
    if (this.salesSyncPromise) {
      return this.salesSyncPromise;
    }

    this.salesSyncPromise = (async () => {
      try {
        const { data: transactions, error } = await this.supabase
          .from('transactions')
          .select('*, transaction_items(*)')
          .order('timestamp', { ascending: false });

        if (error) throw error;

        const sales: Transaction[] = (transactions || []).map((tx) => ({
          id: new Date(tx.timestamp).getTime().toString(),
          timestamp: new Date(tx.timestamp).getTime(),
          products: (tx.transaction_items || []).map(
            (item: Record<string, unknown>) => ({
              productId: item.product_id,
              productName: item.product_name,
              productBarcode: item.product_barcode || '',
              price: Number(item.price),
              buyPrice: Number(item.buy_price),
              quantity: item.quantity,
            })
          ),
          totalAmount: Number(tx.total_amount),
          amountPaid: Number(tx.amount_paid),
          change: Number(tx.change),
        }));

        await this.set('sales', sales);
      } catch (error) {
        console.error('Sync sales error:', error);
        toast.error('Failed to sync sales history.');
      } finally {
        this.salesSyncPromise = null;
      }
    })();

    return this.salesSyncPromise;
  }

  async getSalesHistory(): Promise<Transaction[]> {
    const allSales = await this.get<Transaction>('sales');

    if (allSales.length === 0 && !this.initialSalesSyncDone) {
      await this.syncSalesWithBackend();
      this.initialSalesSyncDone = true;
      const syncedSales = await this.get<Transaction>('sales');
      return syncedSales.sort((a, b) => b.timestamp - a.timestamp);
    }

    return allSales.sort((a, b) => b.timestamp - a.timestamp);
  }

  async getProductStock(productId: string): Promise<number> {
    const batches = await this.getStockBatches(productId);
    const products = await this.get<Product>('products');
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
    let products = await this.get<Product>('products');

    if (products.length === 0 && !this.initialSyncDone) {
      await this.syncWithBackend();
      this.initialSyncDone = true;
      products = await this.get<Product>('products');
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
