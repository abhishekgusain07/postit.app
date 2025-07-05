import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { InstagramV2Provider } from '@/providers/instagram-v2.provider';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    
    // Initialize Instagram v2 provider
    const instagramProvider = new InstagramV2Provider(
      process.env.FACEBOOK_CLIENT_ID || '',
      process.env.FACEBOOK_CLIENT_SECRET || '',
      `${process.env.FRONTEND_URL}/api/integrations/instagram/v2/callback`
    );
    
    // Generate auth URL with state
    const { url, state, codeVerifier } = await instagramProvider.generateAuthUrl();
    
    // Create response with redirect to Instagram's authorization URL
    const response = NextResponse.redirect(url);
    
    // Set the state and code verifier in cookies
    response.cookies.set('instagram_v2_auth_state', state, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });
    
    response.cookies.set('instagram_v2_code_verifier', codeVerifier, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Instagram v2 authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Instagram authorization' },
      { status: 500 }
    );
  }
} 