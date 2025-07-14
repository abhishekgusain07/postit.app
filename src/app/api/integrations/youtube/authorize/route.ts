import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { YouTubeProvider } from '@/providers/youtube.provider';

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Initialize YouTube provider
    const youtubeProvider = new YouTubeProvider(
      process.env.YOUTUBE_CLIENT_ID || '',
      process.env.YOUTUBE_CLIENT_SECRET || '',
      `${process.env.FRONTEND_URL}/api/integrations/youtube/callback`
    );
    
    // Generate auth URL with state
    const { url, state } = await youtubeProvider.generateAuthUrl();
    
    // Create the response with redirect
    const response = NextResponse.redirect(url);
    
    // Set state as cookie on the response
    response.cookies.set('youtube_auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });
    
    // Set user ID for callback
    response.cookies.set('youtube_user_id', session.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });
    
    // Return the response with cookies
    return response;
  } catch (error) {
    console.error('YouTube authorization error:', error);
    return NextResponse.redirect(
      new URL(`/integrations?error=${encodeURIComponent('Failed to initiate YouTube authorization')}`, request.url)
    );
  }
}