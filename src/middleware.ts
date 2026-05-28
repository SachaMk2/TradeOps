import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('MIDDLEWARE START:', request.nextUrl.pathname);
  const response = await updateSession(request);
  console.log('MIDDLEWARE END:', request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
