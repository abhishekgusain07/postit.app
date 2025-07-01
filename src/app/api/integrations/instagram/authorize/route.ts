import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { InstagramProvider } from '@/providers/instagram.provider';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Initialize Instagram provider
    const instagramProvider = new InstagramProvider(
      process.env.FACEBOOK_CLIENT_ID || '',
      process.env.FACEBOOK_CLIENT_SECRET || '',
      `${process.env.FRONTEND_URL}/api/integrations/instagram/callback`
    );
    
    // Generate auth URL with state
    const { url, state } = await instagramProvider.generateAuthUrl();
    
    // Create response with redirect to Instagram's authorization URL
    const response = NextResponse.redirect(url);
    
    // Set the state in a cookie on the response
    response.cookies.set('instagram_auth_state', state, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Instagram authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Instagram authorization' },
      { status: 500 }
    );
  }
} 