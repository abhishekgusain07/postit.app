// api/integrations/linkedin/authorize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { LinkedInProvider } from '@/providers/linkedin.provider';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Initialize LinkedIn provider
    const linkedinProvider = new LinkedInProvider(
      process.env.LINKEDIN_CLIENT_ID || '',
      process.env.LINKEDIN_CLIENT_SECRET || '',
      `${process.env.FRONTEND_URL}/api/integrations/linkedin/callback`
    );
    
    // Generate auth URL with state
    const { url, state } = await linkedinProvider.generateAuthUrl();
    
    // Store the state in a cookie
    const response = NextResponse.json({ url, state });
    
    // Set the state in a cookie on the response
    response.cookies.set('linkedin_auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });
    
    console.log('Returning LinkedIn auth URL:', url);
    
    return response;
  } catch (error) {
    console.error('LinkedIn authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate LinkedIn authorization' },
      { status: 500 }
    );
  }
}