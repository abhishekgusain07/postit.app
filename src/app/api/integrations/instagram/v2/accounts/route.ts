import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
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
    
    // Get stored accounts from cookies
    const accountsJson = request.cookies.get('instagram_v2_accounts')?.value;
    
    if (!accountsJson) {
      return NextResponse.json(
        { error: 'No accounts found. Please restart the authorization process.' },
        { status: 400 }
      );
    }
    
    try {
      const accounts = JSON.parse(accountsJson);
      return NextResponse.json({ 
        success: true, 
        accounts 
      });
    } catch (parseError) {
      console.error('Error parsing accounts:', parseError);
      return NextResponse.json(
        { error: 'Invalid account data. Please restart the authorization process.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Instagram v2 accounts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
} 