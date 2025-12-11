import type { Metadata } from 'next';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToTop from '@/components/ScrollToTop';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: "Azmi's Portfolio",
  description: 'Personal portfolio showcasing my projects and skills.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className='antialiased'>
        {children}


        <ToastContainer closeOnClick autoClose={2000} />
        <ScrollToTop />

        <SpeedInsights />
        <Analytics />
        <NextTopLoader color="#2563EB" showSpinner={false} />
      </body>
    </html>
  );
}
