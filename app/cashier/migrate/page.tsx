'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  MdSync,
  MdCheckCircle,
  MdError,
  MdWarning,
  MdLogin,
} from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

interface MigrationStatus {
  products: { total: number; migrated: number };
  sales: { total: number; migrated: number };
  error: string | null;
}

interface StrapiProduct {
  id: string;
  name: string;
  barcode: string;
  price: number;
  buyPrice: number;
  sold?: number;
  stock?: {
    productId: string;
    expirationDate: string;
    addedDate: string;
    quantity: number;
    isSoldOut: boolean;
  }[];
  createdAt?: string;
  lastEditAt?: string;
}

interface StrapiTransaction {
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

export default function MigratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [strapiToken, setStrapiToken] = useState<string | null>(null);
  const [strapiEmail, setStrapiEmail] = useState('');
  const [strapiPassword, setStrapiPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [strapiProducts, setStrapiProducts] = useState<StrapiProduct[]>([]);
  const [strapiSales, setStrapiSales] = useState<StrapiTransaction[]>([]);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    products: { total: 0, migrated: 0 },
    sales: { total: 0, migrated: 0 },
    error: null,
  });
  const [migrationComplete, setMigrationComplete] = useState(false);

  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  const supabase = createClient();

  const handleStrapiLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strapiUrl) {
      toast.error('STRAPI_URL not configured');
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await fetch(`${strapiUrl}/api/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: strapiEmail,
          password: strapiPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.jwt) {
        setStrapiToken(data.jwt);
        toast.success('Connected to Strapi!');
        fetchStrapiData(data.jwt);
      } else {
        toast.error(data.error?.message || 'Strapi login failed');
      }
    } catch (error) {
      console.error('Strapi login error:', error);
      toast.error('Failed to connect to Strapi');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchStrapiData = async (token: string) => {
    setIsLoading(true);
    try {
      // Fetch products
      const productsRes = await fetch(`${strapiUrl}/api/frontend/getProducts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!productsRes.ok) {
        throw new Error('Failed to fetch products from Strapi');
      }

      const productsData = await productsRes.json();
      const products: StrapiProduct[] = productsData.products || [];
      setStrapiProducts(products);

      // Fetch sales
      const salesRes = await fetch(`${strapiUrl}/api/frontend/getSales`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let sales: StrapiTransaction[] = [];
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        sales = salesData.sales || [];
        setStrapiSales(sales);
      }

      setMigrationStatus({
        products: { total: products.length, migrated: 0 },
        sales: { total: sales.length, migrated: 0 },
        error: null,
      });
    } catch (error) {
      console.error('Failed to fetch Strapi data:', error);
      toast.error('Failed to fetch data from Strapi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigration = async () => {
    if (strapiProducts.length === 0 && strapiSales.length === 0) {
      toast.error('No data to migrate');
      return;
    }

    setIsMigrating(true);
    setMigrationStatus((prev) => ({ ...prev, error: null }));

    try {
      // Get current Supabase user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Please login to Supabase first (main login page)');
      }

      // Migrate products
      let productsMigrated = 0;
      for (const product of strapiProducts) {
        try {
          // Insert product
          const { data: newProduct, error: productError } = await supabase
            .from('products')
            .insert({
              user_id: user.id,
              name: product.name,
              barcode: product.barcode || '',
              price: product.price,
              buy_price: product.buyPrice || 0,
              sold: product.sold || 0,
              created_at: product.createdAt || new Date().toISOString(),
              last_edit_at: product.lastEditAt || new Date().toISOString(),
            })
            .select()
            .single();

          if (productError) {
            console.error(
              `Failed to migrate product ${product.name}:`,
              productError
            );
            continue;
          }

          // Insert stock batches
          if (product.stock && product.stock.length > 0 && newProduct) {
            const batches = product.stock.map((batch) => ({
              product_id: newProduct.id,
              user_id: user.id,
              expiration_date: batch.expirationDate || null,
              added_date: batch.addedDate,
              quantity: batch.quantity,
              is_sold_out: batch.isSoldOut || false,
            }));

            await supabase.from('stock_batches').insert(batches);
          }

          productsMigrated++;
          setMigrationStatus((prev) => ({
            ...prev,
            products: { ...prev.products, migrated: productsMigrated },
          }));
        } catch (err) {
          console.error(`Error migrating product ${product.name}:`, err);
        }
      }

      // Migrate sales
      let salesMigrated = 0;
      for (const sale of strapiSales) {
        try {
          // Insert transaction
          const { data: newTx, error: txError } = await supabase
            .from('transactions')
            .insert({
              user_id: user.id,
              timestamp: new Date(sale.timestamp).toISOString(),
              total_amount: sale.totalAmount,
              amount_paid: sale.amountPaid,
              change: sale.change,
            })
            .select()
            .single();

          if (txError) {
            console.error(`Failed to migrate sale ${sale.id}:`, txError);
            continue;
          }

          // Insert transaction items
          if (sale.products && sale.products.length > 0 && newTx) {
            const items = sale.products.map((item) => ({
              transaction_id: newTx.id,
              product_id: item.productId,
              product_name: item.productName,
              product_barcode: item.productBarcode || '',
              price: item.price,
              buy_price: item.buyPrice || 0,
              quantity: item.quantity,
            }));

            await supabase.from('transaction_items').insert(items);
          }

          salesMigrated++;
          setMigrationStatus((prev) => ({
            ...prev,
            sales: { ...prev.sales, migrated: salesMigrated },
          }));
        } catch (err) {
          console.error(`Error migrating sale ${sale.id}:`, err);
        }
      }

      setMigrationComplete(true);
      toast.success(
        `Migration complete! ${productsMigrated} products, ${salesMigrated} sales migrated.`
      );
    } catch (error) {
      console.error('Migration error:', error);
      const message =
        error instanceof Error ? error.message : 'Migration failed';
      setMigrationStatus((prev) => ({ ...prev, error: message }));
      toast.error(message);
    } finally {
      setIsMigrating(false);
    }
  };

  // Not logged into Strapi yet
  if (!strapiToken) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold'>Data Migration Tool</h1>
          <p className='text-gray-500 mt-1'>
            Login to Strapi to fetch your existing data
          </p>
        </div>

        <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3'>
          <MdWarning className='h-6 w-6 text-amber-600 shrink-0 mt-0.5' />
          <div>
            <p className='font-medium text-amber-800'>Temporary Page</p>
            <p className='text-amber-800'>
              Delete this page after migration is complete.
            </p>
          </div>
        </div>

        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h2 className='font-bold mb-4 flex items-center gap-2'>
            <MdLogin className='h-5 w-5' />
            Login to Strapi
          </h2>
          <form onSubmit={handleStrapiLogin} className='space-y-4'>
            <div>
              <label className='block font-medium mb-1'>Email / Username</label>
              <input
                type='text'
                value={strapiEmail}
                onChange={(e) => setStrapiEmail(e.target.value)}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600'
                placeholder='Enter Strapi email or username'
                required
              />
            </div>
            <div>
              <label className='block font-medium mb-1'>Password</label>
              <input
                type='password'
                value={strapiPassword}
                onChange={(e) => setStrapiPassword(e.target.value)}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600'
                placeholder='Enter Strapi password'
                required
              />
            </div>
            <Button type='submit' disabled={isLoggingIn}>
              {isLoggingIn ? 'Connecting...' : 'Connect to Strapi'}
            </Button>
          </form>

          {!strapiUrl && (
            <p className='mt-4 text-red-600'>
              ⚠️ NEXT_PUBLIC_STRAPI_URL is not configured in .env
            </p>
          )}
        </div>

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h3 className='font-medium text-blue-800 mb-2'>Important:</h3>
          <p className='text-blue-800'>
            You must be logged into Supabase (main login page) before running
            the migration. The data will be linked to your Supabase user.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Data Migration Tool</h1>
        <p className='text-gray-500 mt-1'>
          Migrate your data from Strapi to Supabase
        </p>
      </div>

      <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3'>
        <MdWarning className='h-6 w-6 text-amber-600 shrink-0 mt-0.5' />
        <div>
          <p className='font-medium text-amber-800'>Temporary Page</p>
          <p className='text-amber-800'>
            Delete this page after migration is complete.
          </p>
        </div>
      </div>

      <div className='bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3'>
        <MdCheckCircle className='h-6 w-6 text-green-600' />
        <span className='text-green-800 font-medium'>Connected to Strapi</span>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <h2 className='font-bold mb-4'>Strapi Data Preview</h2>

        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-gray-50 rounded-lg p-4'>
            <p className='text-gray-500'>Products</p>
            <p className='text-3xl font-bold'>{strapiProducts.length}</p>
            {migrationStatus.products.migrated > 0 && (
              <span className='text-green-600 flex items-center gap-1 mt-2'>
                <MdCheckCircle /> {migrationStatus.products.migrated} migrated
              </span>
            )}
          </div>
          <div className='bg-gray-50 rounded-lg p-4'>
            <p className='text-gray-500'>Sales</p>
            <p className='text-3xl font-bold'>{strapiSales.length}</p>
            {migrationStatus.sales.migrated > 0 && (
              <span className='text-green-600 flex items-center gap-1 mt-2'>
                <MdCheckCircle /> {migrationStatus.sales.migrated} migrated
              </span>
            )}
          </div>
        </div>
      </div>

      {migrationStatus.error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
          <MdError className='h-6 w-6 text-red-600 shrink-0 mt-0.5' />
          <div>
            <p className='font-medium text-red-800'>Migration Error</p>
            <p className='text-red-800'>{migrationStatus.error}</p>
          </div>
        </div>
      )}

      {migrationComplete && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3'>
          <MdCheckCircle className='h-6 w-6 text-green-600 shrink-0 mt-0.5' />
          <div>
            <p className='font-medium text-green-800'>Migration Complete!</p>
            <p className='text-green-800'>
              {migrationStatus.products.migrated} products and{' '}
              {migrationStatus.sales.migrated} sales migrated. You can now
              delete this page.
            </p>
          </div>
        </div>
      )}

      <div className='flex gap-4'>
        <Button
          onClick={handleMigration}
          disabled={isMigrating || migrationComplete}
          className='flex items-center gap-2'
        >
          {isMigrating ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
              Migrating...
            </>
          ) : (
            <>
              <MdSync className='h-5 w-5' />
              Start Migration
            </>
          )}
        </Button>

        <Button
          variant='secondary'
          onClick={() => strapiToken && fetchStrapiData(strapiToken)}
          disabled={isMigrating}
        >
          Refresh Preview
        </Button>
      </div>
    </div>
  );
}
