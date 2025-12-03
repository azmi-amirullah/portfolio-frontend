import type { Metadata } from 'next';
import CashierLayoutClient from './CashierLayoutClient';

export const metadata: Metadata = {
  title: 'Mini Market Cashier System',
  description: 'Mini Market Cashier System',
};

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CashierLayoutClient>{children}</CashierLayoutClient>;
}
