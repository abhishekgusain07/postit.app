import { NextRequest, NextResponse } from 'next/server';
import { YouTubeProvider } from '@/providers/youtube.provider';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // Check for OAuth error
    if (error) {
      console.error('YouTube OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/integrations?error=${encodeURIComponent('YouTube authorization failed')}`, request.url)
      );
    }
    
    // Verify required parameters
    if (!code || !state) {
      console.error('Missing required parameters:', { code: !!code, state: !!state });
      return NextResponse.redirect(
        new URL(`/integrations?error=${encodeURIComponent('Invalid authorization response')}`, request.url)
      );
    }
    
    // Get stored state and user ID from cookies
    const storedState = request.cookies.get('youtube_auth_state')?.value;
    const userId = request.cookies.get('youtube_user_id')?.value;
    
    if (!storedState || !userId) {
      console.error('Missing stored state or user ID');
      return NextResponse.redirect(
        new URL(`/integrations?error=${encodeURIComponent('Session expired. Please try again.')}`, request.url)
      );
    }
    
    // Verify state parameter (security check)
    if (state !== storedState) {
      console.error('State mismatch:', { received: state, stored: storedState });
      return NextResponse.redirect(
        new URL(`/integrations?error=${encodeURIComponent('Security verification failed')}`, request.url)
      );
    }
    
    // Initialize YouTube provider
    const youtubeProvider = new YouTubeProvider(
      process.env.YOUTUBE_CLIENT_ID || '',
      process.env.YOUTUBE_CLIENT_SECRET || '',
      `${process.env.FRONTEND_URL}/api/integrations/youtube/callback`
    );
    
    // Exchange code for tokens and store integration
    const result = await youtubeProvider.authenticate(code, userId);
    
    // Create response to redirect to integrations page
    const response = NextResponse.redirect(
      new URL(result.error 
        ? `/integrations?error=${encodeURIComponent(result.error)}`
        : '/integrations?success=YouTube connected successfully',
        request.url
      )
    );
    
    // Clear auth cookies
    response.cookies.set('youtube_auth_state', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
    });
    
    response.cookies.set('youtube_user_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('YouTube callback error:', error);
    return NextResponse.redirect(
      new URL(`/integrations?error=${encodeURIComponent('Failed to complete YouTube authorization')}`, request.url)
    );
  }
}