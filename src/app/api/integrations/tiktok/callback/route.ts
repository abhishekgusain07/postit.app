import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { TikTokProvider } from '@/providers/tiktok.provider';

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
    
    // Get stored state from request cookies
    const storedState = request.cookies.get('tiktok_auth_state')?.value;
    
    // Check for errors
    if (error) {
      console.error('TikTok callback error:', error);
      const response = NextResponse.redirect(new URL('/integrations?error=tiktok_auth_denied', request.url));
      // Clear the auth cookie
      response.cookies.delete('tiktok_auth_state');
      return response;
    }
    
    // Validate parameters
    if (!code || !state || !storedState) {
      console.error('Missing parameters in TikTok callback', { code, state, storedState });
      const response = NextResponse.redirect(new URL('/integrations?error=invalid_request', request.url));
      // Clear the auth cookie
      response.cookies.delete('tiktok_auth_state');
      return response;
    }
    
    // Verify state to prevent CSRF
    if (state !== storedState) {
      console.error('TikTok callback state mismatch');
      const response = NextResponse.redirect(new URL('/integrations?error=invalid_state', request.url));
      // Clear the auth cookie
      response.cookies.delete('tiktok_auth_state');
      return response;
    }
    
    // Initialize TikTok provider
    const tiktokProvider = new TikTokProvider(
      process.env.TIKTOK_CLIENT_KEY || '',
      process.env.TIKTOK_CLIENT_SECRET || '',
      `${process.env.FRONTEND_URL}/api/integrations/tiktok/callback`
    );
    
    // Exchange the code for tokens
    const result = await tiktokProvider.authenticate(code, userId);
    
    if (result.error) {
      console.error('TikTok authentication error:', result.error);
      const response = NextResponse.redirect(new URL(`/integrations?error=${encodeURIComponent(result.error)}`, request.url));
      // Clear the auth cookie
      response.cookies.delete('tiktok_auth_state');
      return response;
    }
    
    // Success - redirect back to the integrations page
    const response = NextResponse.redirect(new URL('/integrations?success=tiktok', request.url));
    // Clear the auth cookie
    response.cookies.delete('tiktok_auth_state');
    return response;
  } catch (error) {
    console.error('TikTok callback error:', error);
    const response = NextResponse.redirect(new URL('/integrations?error=server_error', request.url));
    // Clear the auth cookie
    response.cookies.delete('tiktok_auth_state');
    return response;
  }
} 