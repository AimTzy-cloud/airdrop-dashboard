import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');
    console.log('[API Logout] Current cookies:', cookieStore.getAll());
    console.log('[API Logout] Token before deletion:', token);

    // Hapus cookie auth_token
    cookieStore.delete('auth_token');

    console.log('[API Logout] Cookies after deletion:', cookieStore.getAll());
    console.log('[API Logout] Clearing server-side session and cookie completed');

    // Set ulang cookie dengan Set-Cookie header
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.headers.set(
      'Set-Cookie',
      'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict'
    );

    return response;
  } catch (error) {
    console.error('[API Logout] Error:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}