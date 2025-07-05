import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { InstagramV2Provider } from '@/providers/instagram-v2.provider';

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    
    const userId = session.user.id;
    
    // Get URL parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    // Get stored state and code verifier from cookies
    const storedState = request.cookies.get('instagram_v2_auth_state')?.value;
    const codeVerifier = request.cookies.get('instagram_v2_code_verifier')?.value;
    
    // Check for errors
    if (error) {
      console.error('Instagram v2 callback error:', error, errorDescription);
      
      const response = NextResponse.redirect(new URL(`/integrations?error=${encodeURIComponent(errorDescription || error)}`, request.url));
      response.cookies.delete('instagram_v2_auth_state');
      response.cookies.delete('instagram_v2_code_verifier');
      return response;
    }
    
    // Validate parameters
    if (!code || !state || !storedState || !codeVerifier) {
      console.error('Missing parameters in Instagram v2 callback', { code, state, storedState, codeVerifier });
      
      const response = NextResponse.redirect(new URL('/integrations?error=invalid_request', request.url));
      response.cookies.delete('instagram_v2_auth_state');
      response.cookies.delete('instagram_v2_code_verifier');
      return response;
    }
    
    // Verify state to prevent CSRF
    if (state !== storedState) {
      console.error('Instagram v2 callback state mismatch');
      
      const response = NextResponse.redirect(new URL('/integrations?error=invalid_state', request.url));
      response.cookies.delete('instagram_v2_auth_state');
      response.cookies.delete('instagram_v2_code_verifier');
      return response;
    }
    
    // Initialize Instagram v2 provider
    const instagramProvider = new InstagramV2Provider(
      process.env.FACEBOOK_CLIENT_ID || '',
      process.env.FACEBOOK_CLIENT_SECRET || '',
      `${process.env.FRONTEND_URL}/api/integrations/instagram/v2/callback`
    );
    
    // Authenticate and get user access token
    const authResult = await instagramProvider.authenticate({
      code,
      codeVerifier,
      refresh: searchParams.get('refresh') || undefined,
    });
    
    if (authResult.error) {
      console.error('Instagram v2 authentication error:', authResult.error);
      
      const response = NextResponse.redirect(new URL(`/integrations?error=${encodeURIComponent(authResult.error)}`, request.url));
      response.cookies.delete('instagram_v2_auth_state');
      response.cookies.delete('instagram_v2_code_verifier');
      return response;
    }
    
    // Get available Instagram accounts
    const pages = await instagramProvider.pages(authResult.accessToken);
    
    if (pages.length === 0) {
      const response = NextResponse.redirect(new URL('/integrations?error=no_instagram_accounts', request.url));
      response.cookies.delete('instagram_v2_auth_state');
      response.cookies.delete('instagram_v2_code_verifier');
      return response;
    }
    
    // If there's only one account, connect it directly
    if (pages.length === 1) {
      const result = await instagramProvider.connectInstagramAccount(
        userId,
        authResult.accessToken,
        pages[0].id
      );
      
      if (result.success) {
        const response = NextResponse.redirect(new URL('/integrations?success=instagram_v2_connected', request.url));
        response.cookies.delete('instagram_v2_auth_state');
        response.cookies.delete('instagram_v2_code_verifier');
        return response;
      } else {
        const response = NextResponse.redirect(new URL(`/integrations?error=${encodeURIComponent(result.error || 'Failed to connect account')}`, request.url));
        response.cookies.delete('instagram_v2_auth_state');
        response.cookies.delete('instagram_v2_code_verifier');
        return response;
      }
    }
    
    // Store the access token temporarily for account selection
    const response = NextResponse.redirect(new URL('/integrations?instagram_v2_selection=true', request.url));
    
    // Store auth data in cookies for account selection
    response.cookies.set('instagram_v2_temp_token', authResult.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });
    
    response.cookies.set('instagram_v2_accounts', JSON.stringify(pages), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });
    
    // Clean up auth cookies
    response.cookies.delete('instagram_v2_auth_state');
    response.cookies.delete('instagram_v2_code_verifier');
    
    return response;
  } catch (error) {
    console.error('Instagram v2 callback error:', error);
    
    const response = NextResponse.redirect(new URL('/integrations?error=server_error', request.url));
    response.cookies.delete('instagram_v2_auth_state');
    response.cookies.delete('instagram_v2_code_verifier');
    return response;
  }
} 