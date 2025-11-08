import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Para demonstração, vamos usar um sistema simples baseado em cookies
  // Em produção, isso seria integrado com Supabase ou outro sistema de auth
  
  const authToken = request.cookies.get('authToken')?.value
  
  // Rotas que requerem autenticação
  const protectedRoutes = ['/dashboard']
  const authRoutes = ['/login', '/register', '/forgot-password']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname)

  // Se usuário não está autenticado e tenta acessar rota protegida
  if (!authToken && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se usuário está autenticado e tenta acessar rotas de auth
  if (authToken && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/forgot-password'
  ]
}