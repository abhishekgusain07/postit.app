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
    
    const userId = session.user.id;
    
    // Get URL parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // Check for errors from Twitter
    if (error) {
      return NextResponse.redirect(
        new URL(`/integrations?error=${encodeURIComponent(`Authentication error: ${error}`)}`, request.url)
      );
    }
    
    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/integrations?error=invalid_request', request.url)
      );
    }
    
    // Get the stored state and code verifier from cookies
    const storedState = request.cookies.get('x_auth_state')?.value;
    const codeVerifier = request.cookies.get('x_code_verifier')?.value;
    
    // Verify state parameter for security
    if (!storedState || state !== storedState) {
      return NextResponse.redirect(
        new URL('/integrations?error=invalid_state', request.url)
      );
    }
    
    if (!codeVerifier) {
      return NextResponse.redirect(
        new URL('/integrations?error=missing_verifier', request.url)
      );
    }
    
    // Initialize X provider
    const xProvider = new XProvider(
      process.env.X_CLIENT_ID || '',
      process.env.X_CLIENT_SECRET || '',
      `${process.env.FRONTEND_URL}/api/integrations/x/callback`
    );
    
    // Complete the OAuth flow
    const result = await xProvider.authenticate(code, userId, codeVerifier);
    
    // Create response for redirect
    const response = NextResponse.redirect(
      new URL(
        result.error 
          ? `/integrations?error=${encodeURIComponent(result.error)}`
          : '/integrations?success=twitter', 
        request.url
      )
    );
    
    // Clear the auth cookies
    response.cookies.delete('x_auth_state');
    response.cookies.delete('x_code_verifier');
    
    return response;
  } catch (error) {
    console.error('X callback error:', error);
    return NextResponse.redirect(
      new URL('/integrations?error=server_error', request.url)
    );
  }
}