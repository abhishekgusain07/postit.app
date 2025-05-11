import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { LinkedInProvider } from '@/providers/linkedin.provider';

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Initialize LinkedIn provider
    const linkedinProvider = new LinkedInProvider(
      process.env.LINKEDIN_CLIENT_ID || '',
      process.env.LINKEDIN_CLIENT_SECRET || '',
      `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/linkedin/callback`
    );
    
    // Generate auth URL with state
    const { url, state } = await linkedinProvider.generateAuthUrl();
    
    // Store the state and userId in cookies
    const response = NextResponse.redirect(url);
    
    // Set the state in a cookie on the response
    response.cookies.set('linkedin_auth_state', state, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('LinkedIn authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate LinkedIn authorization' },
      { status: 500 }
    );
  }
} 