import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { InstagramV2Provider } from '@/providers/instagram-v2.provider';

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get request body
    const body = await request.json();
    const { accountId } = body;
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }
    
    // Get stored access token from cookies
    const tempToken = request.cookies.get('instagram_v2_temp_token')?.value;
    
    if (!tempToken) {
      return NextResponse.json(
        { error: 'No temporary token found. Please restart the authorization process.' },
        { status: 400 }
      );
    }
    
    // Initialize Instagram v2 provider
    const instagramProvider = new InstagramV2Provider(
      process.env.FACEBOOK_CLIENT_ID || '',
      process.env.FACEBOOK_CLIENT_SECRET || '',
      `${process.env.FRONTEND_URL}/api/integrations/instagram/v2/callback`
    );
    
    // Connect the Instagram account
    const result = await instagramProvider.connectInstagramAccount(
      userId,
      tempToken,
      accountId
    );
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    // Clean up temporary cookies
    const response = NextResponse.json({ 
      success: true, 
      account: result.account 
    });
    
    response.cookies.delete('instagram_v2_temp_token');
    response.cookies.delete('instagram_v2_accounts');
    
    return response;
  } catch (error) {
    console.error('Instagram v2 connect error:', error);
    return NextResponse.json(
      { error: 'Failed to connect Instagram account' },
      { status: 500 }
    );
  }
} 