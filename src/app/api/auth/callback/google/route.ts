// File: app/api/auth/google/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { YouTubeProvider } from '@/providers/youtube.provider';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('Google callback handler started');
    
    // Get the search parameters from the URL
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    // Log important information for debugging
    console.log('Callback params:', { 
      code: code ? `${code.substring(0, 5)}...` : null,
      error
    });
    
    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/api/auth/error?error=${encodeURIComponent(error)}`, request.url)
      );
    }
    
    if (!code) {
      console.error('No authorization code provided');
      return NextResponse.redirect(
        new URL('/api/auth/error?error=no_code', request.url)
      );
    }
    
    // Get the authenticated session
    const session = await auth.api.getSession({
      headers: await headers()
    });
    console.log('Session retrieved:', !!session);
    
    if (!session || !session.user?.id) {
      console.error('No authenticated session found');
      return NextResponse.redirect(
        new URL('/api/auth/error?error=no_session', request.url)
      );
    }
    
    const userId = session.user.id;
    
    // Get OAuth credentials from environment variables
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI || `${process.env.FRONTEND_URL}/api/auth/callback/google`;
    
    // Log credentials availability (not the actual values)
    console.log('Credentials check:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      redirectUri
    });
    
    if (!clientId || !clientSecret) {
      console.error('Missing OAuth credentials');
      return NextResponse.redirect(
        new URL('/api/auth/error?error=missing_credentials', request.url)
      );
    }
    
    // Initialize the YouTube provider
    const youtubeProvider = new YouTubeProvider(
      clientId,
      clientSecret,
      redirectUri
    );
    
    console.log('Authenticating with YouTube...');
    const authDetails = await youtubeProvider.authenticate(code, userId);
    
    if (authDetails.error) {
      console.error('YouTube authentication error:', authDetails.error);
      return NextResponse.redirect(
        new URL(`/api/auth/error?error=${encodeURIComponent(authDetails.error)}`, request.url)
      );
    }
    
    console.log('YouTube authentication successful');
    
    // Successful authentication - redirect to dashboard
    return NextResponse.redirect(
      new URL('/dashboard?youtubeConnected=true', request.url)
    );
  } catch (error) {
    console.error('Unexpected error in Google callback handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.redirect(
      new URL(`/api/auth/error?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}