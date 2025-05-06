import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { TikTokProvider } from '@/providers/tiktok.provider';
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
    
    // Initialize TikTok provider
    const tiktokProvider = new TikTokProvider(
      process.env.TIKTOK_CLIENT_KEY || '',
      process.env.TIKTOK_CLIENT_SECRET || '',
      `${process.env.FRONTEND_URL}/api/integrations/tiktok/callback`
    );
    
    // Generate auth URL with state
    const { url, state } = await tiktokProvider.generateAuthUrl();
    
    // Create response with redirect to TikTok's authorization URL
    const response = NextResponse.redirect(url);
    
    // Set the state in a cookie on the response
    response.cookies.set('tiktok_auth_state', state, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('TikTok authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate TikTok authorization' },
      { status: 500 }
    );
  }
} 