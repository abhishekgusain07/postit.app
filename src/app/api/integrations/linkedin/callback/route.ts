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
    
    const userId = session.user.id;
    
    // Get URL parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    // Get stored state from cookies
    const storedState = request.cookies.get('linkedin_auth_state')?.value;
    
    // Check for errors
    if (error) {
      console.error('LinkedIn callback error:', error, errorDescription);
      
      const response = NextResponse.redirect(new URL(`/integrations?error=${encodeURIComponent(errorDescription || error)}`, request.url));

      response.cookies.delete('linkedin_auth_state');

      return response;
    }
    
    // Validate parameters
    if (!code || !state || !storedState) {
      console.error('Missing parameters in LinkedIn callback', { code, state, storedState });
      
      const response = NextResponse.redirect(new URL('/integrations?error=invalid_request', request.url));

      response.cookies.delete('linkedin_auth_state');

      return response;
    }
    
    // Verify state to prevent CSRF
    if (state !== storedState) {
      console.error('LinkedIn callback state mismatch');
      
      const response = NextResponse.redirect(new URL('/integrations?error=invalid_state', request.url));

      response.cookies.delete('linkedin_auth_state');

      return response;
    }
    
    // Initialize LinkedIn provider
    const linkedinProvider = new LinkedInProvider(
      process.env.LINKEDIN_CLIENT_ID || '',
      process.env.LINKEDIN_CLIENT_SECRET || '',
      `${process.env.FRONTEND_URL}/api/integrations/linkedin/callback`
    );
    
    // Exchange the code for tokens
    const result = await linkedinProvider.authenticate(code, userId);
    
    if (result.error) {
      console.error('LinkedIn authentication error:', result.error);

      const response = NextResponse.redirect(new URL(`/integrations?error=${encodeURIComponent(result.error)}`, request.url));

      response.cookies.delete('linkedin_auth_state');

      return response;
    }
    
    // Success - redirect back to the integrations page
    const response = NextResponse.redirect(new URL('/integrations?success=linkedin', request.url));

    response.cookies.delete('linkedin_auth_state');

    return response;
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    const response = NextResponse.redirect(new URL('/integrations?error=server_error', request.url));

    response.cookies.delete('linkedin_auth_state');

    return response;
  }
} 