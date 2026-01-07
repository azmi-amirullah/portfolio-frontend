import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect cashier routes (except login page and migrate page)
  const isCashierRoute = request.nextUrl.pathname.startsWith('/cashier');
  const isLoginPage = request.nextUrl.pathname === '/cashier';
  const isMigratePage = request.nextUrl.pathname === '/cashier/migrate';

  if (isCashierRoute && !isLoginPage && !isMigratePage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/cashier';
    return NextResponse.redirect(url);
  }

  // Redirect to POS if already authenticated and on login page
  if (isLoginPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/cashier/pos';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
