import { NextRequest, NextResponse } from 'next/server';

import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { integration } from '@/db/schema';
import { db } from '@/db/drizzle';
import { LinkedInProvider } from '@/providers/linkedin.provider';

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get integration ID from request body
    const { integrationId } = await request.json();
    
    if (!integrationId) {
      return NextResponse.json(
        { error: 'Integration ID is required' },
        { status: 400 }
      );
    }
    
    // Get integration details from database
    const integrationData = await db.select().from(integration).where(and(
        eq(integration.id, integrationId),
        eq(integration.userId, userId),
        eq(integration.providerIdentifier, 'linkedin')
      )
    );
    
    if (!integrationData) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }
    
    // Initialize LinkedIn provider
    const linkedinProvider = new LinkedInProvider(
      process.env.LINKEDIN_CLIENT_ID || '',
      process.env.LINKEDIN_CLIENT_SECRET || '',
      `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/linkedin/callback`
    );
    
    // Refresh token
    const refreshResult = await linkedinProvider.refreshToken(
      userId,
      integrationData[0].internalId
    );
    
    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('LinkedIn token refresh error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to refresh token',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 