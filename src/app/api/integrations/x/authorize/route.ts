import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { XProvider } from '@/providers/x.provider';

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Initialize X provider
    const xProvider = new XProvider(
      process.env.X_CLIENT_ID || '',
      process.env.X_CLIENT_SECRET || '',
      `${process.env.FRONTEND_URL}/api/integrations/x/callback`
    );
    
    // Generate auth URL with state and code verifier
    const { url, state, codeVerifier } = await xProvider.generateAuthUrl();
    
    // Create the response with redirect
    const response = NextResponse.redirect(url);
    
    // Set state and code verifier as cookies on the response
    response.cookies.set('x_auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });
    
    response.cookies.set('x_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });
    
    // Return the response with cookies
    return response;
  } catch (error) {
    console.error('X authorization error:', error);
    return NextResponse.redirect(
      new URL(`/integrations?error=${encodeURIComponent('Failed to initiate X authorization')}`, request.url)
    );
  }
}