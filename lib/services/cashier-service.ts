import { v4 as uuidv4 } from 'uuid';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
}

export interface StockBatch {
  id: string;
  productId: string;
  expirationDate: string; // Format: YYYY-MM-DD
  addedDate: string; // Format: YYYY-MM-DD
  quantity: number;
  isSoldOut: boolean; // Manual override to mark batch as unavailable
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  timestamp: number;
  discount?: number;
  taxRate?: number;
  amountPaid?: number;
  grandTotal?: number;
  price?: number; // Price per unit at the time of sale
}

const STORAGE_KEYS = {
  PRODUCTS: 'cashier_products',
  STOCK: 'cashier_stock',
  SALES: 'cashier_sales',
};

// Simulate API delay
const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

class CashierService {
  // Helper to get data from localStorage
  private get<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // Helper to set data to localStorage
  private set<T>(key: string, data: T[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- Products ---

  async getProducts(): Promise<Product[]> {
    await delay();
    return this.get<Product>(STORAGE_KEYS.PRODUCTS);
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    await delay();
    const products = this.get<Product>(STORAGE_KEYS.PRODUCTS);
    return products.find((p) => p.barcode === barcode);
  }

  async saveProduct(product: Product): Promise<void> {
    await delay();
    const products = this.get<Product>(STORAGE_KEYS.PRODUCTS);
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    this.set(STORAGE_KEYS.PRODUCTS, products);
  }

  async deleteProduct(productId: string): Promise<void> {
    await delay();
    const products = this.get<Product>(STORAGE_KEYS.PRODUCTS);
    const newProducts = products.filter((p) => p.id !== productId);
    this.set(STORAGE_KEYS.PRODUCTS, newProducts);
  }

  // --- Stock ---

  async getStockBatches(productId: string): Promise<StockBatch[]> {
    await delay();
    const allStock = this.get<StockBatch>(STORAGE_KEYS.STOCK);
    return allStock.filter((s) => s.productId === productId);
  }

  async addStock(
    productId: string,
    batch: Omit<StockBatch, 'id' | 'productId' | 'isSoldOut'>
  ): Promise<void> {
    await delay();
    const allStock = this.get<StockBatch>(STORAGE_KEYS.STOCK);
    const newBatch: StockBatch = {
      ...batch,
      id: uuidv4(),
      productId,
      isSoldOut: false,
    };
    allStock.push(newBatch);
    this.set(STORAGE_KEYS.STOCK, allStock);
  }

  async updateStockBatch(batch: StockBatch): Promise<void> {
    await delay();
    const allStock = this.get<StockBatch>(STORAGE_KEYS.STOCK);
    const index = allStock.findIndex((s) => s.id === batch.id);
    if (index >= 0) {
      allStock[index] = batch;
      this.set(STORAGE_KEYS.STOCK, allStock);
    }
  }

  // --- Sales ---

  async processSale(
    cartItems: { productId: string; quantity: number; price: number }[],
    paymentDetails?: {
      discount: number;
      taxRate: number;
      amountPaid: number;
      grandTotal: number;
    }
  ): Promise<void> {
    await delay();
    const allSales = this.get<Sale>(STORAGE_KEYS.SALES);
    const timestamp = Date.now();

    cartItems.forEach((item) => {
      const sale: Sale = {
        id: uuidv4(),
        productId: item.productId,
        quantity: item.quantity,
        timestamp,
        discount: paymentDetails?.discount,
        taxRate: paymentDetails?.taxRate,
        amountPaid: paymentDetails?.amountPaid,
        grandTotal: paymentDetails?.grandTotal,
        price: item.price,
      };
      allSales.push(sale);
    });

    this.set(STORAGE_KEYS.SALES, allSales);
  }

  async getSalesHistory(): Promise<
    (Sale & { productName: string; productPrice: number })[]
  > {
    await delay();
    const allSales = this.get<Sale>(STORAGE_KEYS.SALES);
    const products = this.get<Product>(STORAGE_KEYS.PRODUCTS);

    return allSales
      .map((sale) => {
        const product = products.find((p) => p.id === sale.productId);
        return {
          ...sale,
          productName: product?.name || 'Unknown Product',
          productPrice: sale.price || 0, // Use recorded price, fallback to 0 for old records
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp); // Most recent first
  }

  // --- Calculations ---

  async getProductStock(productId: string): Promise<number> {
    await delay();
    const batches = await this.getStockBatches(productId);
    const allSales = this.get<Sale>(STORAGE_KEYS.SALES);
    const productSales = allSales.filter((s) => s.productId === productId);

    const totalAdded = batches.reduce((sum, batch) => sum + batch.quantity, 0);
    const totalSold = productSales.reduce(
      (sum, sale) => sum + sale.quantity,
      0
    );

    return totalAdded - totalSold;
  }

  async getProductsWithStock(): Promise<
    (Product & { stock: number; batches: StockBatch[] })[]
  > {
    await delay();
    const products = this.get<Product>(STORAGE_KEYS.PRODUCTS);
    const allStock = this.get<StockBatch>(STORAGE_KEYS.STOCK);
    const allSales = this.get<Sale>(STORAGE_KEYS.SALES);

    return products.map((product) => {
      const batches = allStock.filter((s) => s.productId === product.id);
      const productSales = allSales.filter((s) => s.productId === product.id);

      const totalAdded = batches.reduce(
        (sum, batch) => sum + batch.quantity,
        0
      );
      const totalSold = productSales.reduce(
        (sum, sale) => sum + sale.quantity,
        0
      );

      return {
        ...product,
        stock: totalAdded - totalSold,
        batches,
      };
    });
  }
}

export const cashierService = new CashierService();
