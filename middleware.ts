import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_NAME = 'auth_token';

// Export middleware configuration
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};

// Convert string to Uint8Array for jose
const textEncoder = new TextEncoder();
const secretKey = textEncoder.encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const cookieStore = request.cookies;
  const token = cookieStore.get(TOKEN_NAME)?.value;

  // For debugging
  console.log('Middleware path:', request.nextUrl.pathname);
  console.log('Middleware cookies:', cookieStore.getAll());
  console.log('Token exists:', !!token);

  // Check if the path is protected
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      console.log('No token, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await jwtVerify(token, secretKey);
      console.log('Token verified, allowing access to dashboard');
      return NextResponse.next();
    } catch (error) {
      console.log('Invalid token, redirecting to login:', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // Redirect authenticated users away from login/register pages
  if (token && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    try {
      await jwtVerify(token, secretKey);
      console.log('User already authenticated, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // Invalid token, allow access to login/register
      console.log('Invalid token on login/register page:', error);
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}