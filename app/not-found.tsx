'use client';

import { Button } from '@/components/ui/Button';
import { usePathname } from 'next/navigation';

export default function NotFound() {
  const pathname = usePathname();

  // Extract segments to identify depth
  // e.g. "/cashier/inventory" -> segments=["cashier", "inventory"] (len=2) -> return "/cashier"
  // e.g. "/ss" -> segments=["ss"] (len=1) -> return "/"
  const segments = pathname?.split('/').filter(Boolean) || [];

  // If we are strictly inside a section (depth > 1), return to that section's root.
  // Otherwise (depth <= 1), return to home.
  const returnPath = segments.length > 1 ? `/${segments[0]}` : '/';

  return (
    <div className='min-h-dvh flex flex-col items-center justify-center bg-background px-6 text-center'>
      <h1 className='text-9xl font-heading font-bold text-secondary mb-2 cursor-default'>
        404
      </h1>
      <h2 className='text-2xl font-bold text-foreground mb-4'>
        Page Not Found
      </h2>
      <p className='text-muted-foreground mb-8 max-w-md text-lg'>
        Sorry, the page you are looking for doesn&apos;t exist or has been
        moved.
      </p>

      <Button
        href={returnPath}
        size='lg'
        aria-label='Return to previous section'
      >
        {segments.length > 1 ? 'Go Back' : 'Back to Home'}
      </Button>
    </div>
  );
}
