import { NextRequest, NextResponse } from 'next/server';

import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { integration } from '@/db/schema';
import { db } from '@/db/drizzle';

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
    
    // Get integration ID from request body
    const { integrationId } = await request.json();
    
    if (!integrationId) {
      return NextResponse.json(
        { error: 'Integration ID is required' },
        { status: 400 }
      );
    }
    
    // Find the integration in the database
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
    
    // Instead of permanently deleting, mark as deleted with timestamp
    await db.update(integration)
      .set({
        deletedAt: new Date(),
        disabled: true,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(integration.id, integrationId),
          eq(integration.userId, userId)
        )
      );
    
    return NextResponse.json({
      success: true,
      message: 'LinkedIn account disconnected successfully'
    });
  } catch (error) {
    console.error('LinkedIn disconnect error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to disconnect LinkedIn account',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 