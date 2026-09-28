import createIntlMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const handleIntl = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const origin = request.headers.get('origin') || '*';

  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers':
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const response = await handleIntl(request);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};