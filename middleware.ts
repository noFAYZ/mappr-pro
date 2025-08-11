import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

// Protected routes
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/portfolio',
  '/wallets',
  '/extensions',
  '/analytics',
];

// Auth routes that should redirect if already authenticated
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
];

// Admin routes
const ADMIN_ROUTES = [
  '/admin',
];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return response;
  }

  // Create Supabase client
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          response.cookies.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );

  try {
    // First check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    let user = null;
    
    // Only try to get user if we have a session
    if (session && !sessionError) {
      try {
        const { data: { user: authenticatedUser }, error: userError } = await supabase.auth.getUser();
        if (!userError) {
          user = authenticatedUser;
        }
      } catch (userError) {
        console.error('Error getting user:', userError);
        // Continue without user
      }
    }

    const isAuthenticated = !!user;

    // Check route types
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      pathname.startsWith(route)
    );

    const isAuthRoute = AUTH_ROUTES.some(route => 
      pathname.startsWith(route)
    );

    const isAdminRoute = ADMIN_ROUTES.some(route => 
      pathname.startsWith(route)
    );

    // Redirect unauthenticated users from protected routes
    if (isProtectedRoute && !isAuthenticated) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect authenticated users from auth routes
    if (isAuthRoute && isAuthenticated) {
      const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // Handle admin routes
    if (isAdminRoute && isAuthenticated && user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (!profile || (profile.role !== 'owner' && profile.role !== 'admin')) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch (profileError) {
        console.error('Error fetching profile for admin check:', profileError);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Handle auth callback routes
    if (pathname.startsWith('/auth/callback')) {
      const code = request.nextUrl.searchParams.get('code');
      
      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Auth callback error:', error);
            return NextResponse.redirect(new URL('/auth/login?error=callback_error', request.url));
          }
          
          const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard';
          return NextResponse.redirect(new URL(redirectTo, request.url));
        } catch (callbackError) {
          console.error('Callback processing error:', callbackError);
          return NextResponse.redirect(new URL('/auth/login?error=callback_error', request.url));
        }
      }
    }

    // Handle password reset routes
    if (pathname.startsWith('/auth/reset-password')) {
      const accessToken = request.nextUrl.searchParams.get('access_token');
      const refreshToken = request.nextUrl.searchParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('Password reset session error:', error);
            return NextResponse.redirect(new URL('/auth/login?error=reset_error', request.url));
          }
        } catch (resetError) {
          console.error('Reset session error:', resetError);
          return NextResponse.redirect(new URL('/auth/login?error=reset_error', request.url));
        }
      }
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // For protected routes, redirect to login on any error
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      pathname.startsWith(route)
    );
    
    if (isProtectedRoute) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};