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
    });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get request body
    const { integrationId, text, media } = await request.json();
    
    if (!integrationId) {
      return NextResponse.json(
        { error: 'Integration ID is required' },
        { status: 400 }
      );
    }
    
    if (!text && (!media || media.length === 0)) {
      return NextResponse.json(
        { error: 'Post content is required (text or media)' },
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
    
    if (integrationData[0].disabled) {
      return NextResponse.json(
        { error: 'This LinkedIn integration is disabled' },
        { status: 400 }
      );
    }
    
    // Check if token is expired or refresh is needed
    const tokenExpiration = integrationData[0].tokenExpiration;
    const needsRefresh = integrationData[0].refreshNeeded || 
      (tokenExpiration && new Date(tokenExpiration) <= new Date());
    
    // Initialize LinkedIn provider
    const linkedinProvider = new LinkedInProvider(
      process.env.LINKEDIN_CLIENT_ID || '',
      process.env.LINKEDIN_CLIENT_SECRET || '',
      `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/linkedin/callback`
    );
    
    let accessToken = integrationData[0].token;
    
    // Refresh token if needed
    if (needsRefresh && integrationData[0].refreshToken) {
      try {
        const refreshResult = await linkedinProvider.refreshToken(
          userId,
          integrationData[0].internalId
        );
        accessToken = refreshResult.accessToken;
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to refresh token, please reconnect your LinkedIn account' },
          { status: 401 }
        );
      }
    }
    
    // Create post on LinkedIn
    const postResult = await linkedinProvider.post(
      accessToken,
      {
        id: integrationId,
        text,
        media
      }
    );
    
    if (!postResult.success) {
      return NextResponse.json(
        { error: postResult.error || 'Failed to create LinkedIn post' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      postId: postResult.postId,
      releaseURL: postResult.releaseURL
    });
  } catch (error) {
    console.error('LinkedIn post error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create LinkedIn post',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 