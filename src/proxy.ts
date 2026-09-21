import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, Next.js internal bundles, and public files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico' ||
    pathname === '/hestra-logo.svg' ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$/i)
  ) {
    return NextResponse.next();
  }

  // Allow background API calls
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('hestra_auth')?.value;
  const roleCookie = request.cookies.get('hestra_role')?.value;

  // If user is accessing the login page
  if (pathname === '/login') {
    // If already authenticated, redirect to portal or dashboard
    if (authCookie) {
      if (roleCookie === 'Employee') {
        return NextResponse.redirect(new URL('/portal/staff', request.url));
      }
      if (roleCookie === 'Manager') {
        return NextResponse.redirect(new URL('/portal/manager', request.url));
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // If user is NOT authenticated, redirect to /login
  if (!authCookie) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Role-Based Access Control (RBAC)
  if (roleCookie === 'Employee') {
    // Restrict employees from sensitive management sections
    if (
      pathname.startsWith('/users') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/payroll') ||
      pathname.startsWith('/recruitment')
    ) {
      return NextResponse.redirect(new URL('/portal/staff', request.url));
    }
  } else if (roleCookie === 'Manager') {
    // Restrict managers from full user administration and core system settings
    if (pathname.startsWith('/users') || pathname.startsWith('/settings')) {
      return NextResponse.redirect(new URL('/portal/manager', request.url));
    }
  }

  // Intelligent root navigation based on role
  if (pathname === '/') {
    if (roleCookie === 'Employee') {
      return NextResponse.redirect(new URL('/portal/staff', request.url));
    }
    if (roleCookie === 'Manager') {
      return NextResponse.redirect(new URL('/portal/manager', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
