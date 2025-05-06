"use server";

import { db } from "@/db/drizzle";
import { integration } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import dayjs from "dayjs";

export async function storeTikTokIntegration(
  userId: string,
  internalId: string,
  name: string,
  picture: string,
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  profile: string
) {
  try {
    await db.insert(integration)
      .values({
        internalId,
        userId,
        name,
        picture,
        providerIdentifier: 'tiktok',
        type: 'social_media',
        token: accessToken,
        refreshToken,
        tokenExpiration: dayjs().add(expiresIn, 'seconds').toDate(),
        profile,
        postingTimes: JSON.stringify([
          { time: 480 }, // 8:00 AM
          { time: 720 }, // 12:00 PM
          { time: 1020 } // 5:00 PM
        ]),
        additionalSettings: JSON.stringify([])
      })
      .onConflictDoUpdate({
        target: integration.internalId,
        set: {
          token: accessToken,
          refreshToken,
          tokenExpiration: dayjs().add(expiresIn, 'seconds').toDate(),
          updatedAt: new Date(),
          disabled: false,
          deletedAt: null
        },
      });

    return { success: true };
  } catch (error) {
    console.error('Error storing TikTok integration:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to store integration' };
  }
}

export async function updateTikTokTokens(
  userId: string,
  internalId: string,
  accessToken: string,
  refreshToken: string,
  expiresIn: number
) {
  try {
    const [integrationData] = await db.select()
      .from(integration)
      .where(
        and(
          eq(integration.userId, userId),
          eq(integration.internalId, internalId),
          eq(integration.providerIdentifier, 'tiktok')
        )
      );

    if (!integrationData) {
      throw new Error('Integration not found');
    }

    await db.update(integration)
      .set({
        token: accessToken,
        refreshToken,
        tokenExpiration: dayjs().add(expiresIn, 'seconds').toDate(),
        updatedAt: new Date(),
        refreshNeeded: false
      })
      .where(eq(integration.id, integrationData.id));

    return { success: true, accessToken, refreshToken };
  } catch (error) {
    // Mark that refresh is needed
    const [integrationData] = await db.select()
      .from(integration)
      .where(
        and(
          eq(integration.userId, userId),
          eq(integration.internalId, internalId),
          eq(integration.providerIdentifier, 'tiktok')
        )
      );

    if (integrationData) {
      await db.update(integration)
        .set({
          refreshNeeded: true
        })
        .where(eq(integration.id, integrationData.id));
    }
    
    console.error('Error updating TikTok tokens:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update tokens' };
  }
}

export async function getTikTokIntegration(userId: string, internalId: string) {
  try {
    const [integrationData] = await db.select()
      .from(integration)
      .where(
        and(
          eq(integration.userId, userId),
          eq(integration.internalId, internalId),
          eq(integration.providerIdentifier, 'tiktok')
        )
      );

    return { success: true, data: integrationData };
  } catch (error) {
    console.error('Error getting TikTok integration:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get integration' };
  }
}

export async function isTikTokConnected(userId: string): Promise<{ connected: boolean; accountId?: string; accountName?: string }> {
  try {
    const [integrationData] = await db.select()
      .from(integration)
      .where(
        and(
          eq(integration.userId, userId),
          eq(integration.providerIdentifier, 'tiktok')
        )
      );
    
    if (integrationData) {
      return { connected: true, accountId: integrationData.internalId, accountName: integrationData.name };
    }
    return { connected: false };
  } catch (error) {
    console.error('Error checking TikTok connection:', error);
    return { connected: false };
  }
} 