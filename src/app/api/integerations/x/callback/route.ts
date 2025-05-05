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
    
    // Get stored state and code verifier from cookies
    const storedState = request.cookies.get('x_auth_state')?.value;
    const codeVerifier = request.cookies.get('x_code_verifier')?.value;
    
    // Create the response first (we'll redirect later)
    let response: NextResponse;
    
    // Check for errors
    if (error) {
      console.error('X callback error:', error);
      response = NextResponse.redirect(new URL('/integrations?error=x_auth_denied', request.url));
    }
    // Validate parameters
    else if (!code || !state || !storedState || !codeVerifier) {
      console.error('Missing parameters in X callback', { code, state, storedState, hasVerifier: !!codeVerifier });
      response = NextResponse.redirect(new URL('/integrations?error=invalid_request', request.url));
    }
    // Verify state to prevent CSRF
    else if (state !== storedState) {
      console.error('X callback state mismatch');
      response = NextResponse.redirect(new URL('/integrations?error=invalid_state', request.url));
    }
    else {
      // Initialize X provider
      const xProvider = new XProvider(
        process.env.X_CLIENT_ID || '',
        process.env.X_CLIENT_SECRET || '',
        `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/x/callback`
      );
      
      // Exchange the code for tokens
      const result = await xProvider.authenticate(code, userId, codeVerifier);
      
      if (result.error) {
        console.error('X authentication error:', result.error);
        response = NextResponse.redirect(new URL(`/integrations?error=${encodeURIComponent(result.error)}`, request.url));
      } else {
        // Success - redirect back to the integrations page
        response = NextResponse.redirect(new URL('/integrations?success=twitter', request.url));
      }
    }
    
    // Clear cookies regardless of outcome
    response.cookies.delete('x_auth_state');
    response.cookies.delete('x_code_verifier');
    
    return response;
  } catch (error) {
    console.error('X callback error:', error);
    const response = NextResponse.redirect(new URL('/integrations?error=server_error', request.url));
    
    // Clear cookies on error as well
    response.cookies.delete('x_auth_state');
    response.cookies.delete('x_code_verifier');
    
    return response;
  }
} 