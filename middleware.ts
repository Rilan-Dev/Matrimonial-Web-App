// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const clientHeader = request.headers.get('x-app-client')
  const origin = request.headers.get('origin') || ''
  const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1'

  // Allow local browser requests during development
  if (!isLocal && clientHeader !== 'matrimonial-mobile') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const response = NextResponse.next()

  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', origin || '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-App-Client')

  return response
}

// ✅ Match only specific routes
export const config = {
  matcher: ['/api/register'],
}
