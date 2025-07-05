"use server";

import { db } from "@/db/drizzle";
import { integration } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import dayjs from "dayjs";

export async function storeInstagramV2Integration(
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
        providerIdentifier: 'instagram',
        type: 'social_media',
        token: accessToken,
        refreshToken,
        tokenExpiration: dayjs().add(expiresIn, 'seconds').toDate(),
        profile,
        additionalSettings: { version: 'v2' },
      })
      .onConflictDoUpdate({
        target: [integration.userId, integration.internalId],
        set: {
          token: accessToken,
          refreshToken,
          tokenExpiration: dayjs().add(expiresIn, 'seconds').toDate(),
          updatedAt: new Date(),
        },
      });

    return { success: true };
  } catch (error) {
    console.error('Error storing Instagram V2 integration:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to store integration' };
  }
}

export async function updateInstagramV2Tokens(
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
          eq(integration.providerIdentifier, 'instagram')
        )
      );

    if (!integrationData) {
      throw new Error('Integration not found');
    }

    await db.update(integration)
      .set({
        token: accessToken,
        refreshToken: refreshToken || integrationData.refreshToken,
        tokenExpiration: dayjs().add(expiresIn, 'seconds').toDate(),
        updatedAt: new Date(),
      })
      .where(eq(integration.id, integrationData.id));

    return { success: true };
  } catch (error) {
    console.error('Error updating Instagram V2 tokens:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update tokens' };
  }
}

export async function getInstagramV2Integration(userId: string, internalId: string) {
  try {
    const [integrationData] = await db.select()
      .from(integration)
      .where(
        and(
          eq(integration.userId, userId),
          eq(integration.internalId, internalId),
          eq(integration.providerIdentifier, 'instagram')
        )
      );

    return { success: true, data: integrationData };
  } catch (error) {
    console.error('Error getting Instagram V2 integration:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get integration' };
  }
}

export async function getUserInstagramV2Integrations(userId: string) {
  try {
    const integrations = await db.select()
      .from(integration)
      .where(
        and(
          eq(integration.userId, userId),
          eq(integration.providerIdentifier, 'instagram')
        )
      );

    // Filter for V2 integrations only
    const v2Integrations = integrations.filter(int => 
      int.additionalSettings && 
      typeof int.additionalSettings === 'object' &&
      (int.additionalSettings as any).version === 'v2'
    );

    return { success: true, data: v2Integrations };
  } catch (error) {
    console.error('Error getting Instagram V2 integrations:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get integrations' };
  }
}

export async function disconnectInstagramV2Integration(userId: string, internalId: string) {
  try {
    await db.delete(integration)
      .where(
        and(
          eq(integration.userId, userId),
          eq(integration.internalId, internalId),
          eq(integration.providerIdentifier, 'instagram')
        )
      );

    return { success: true };
  } catch (error) {
    console.error('Error disconnecting Instagram V2 integration:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to disconnect integration' };
  }
} 