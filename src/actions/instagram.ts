"use server";

import { db } from "@/db/drizzle";
import { integration } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import dayjs from "dayjs";

export async function storeInstagramIntegration(
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
    console.error('Error storing Instagram integration:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to store integration' };
  }
}

export async function updateInstagramTokens(
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
    console.error('Error updating Instagram tokens:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update tokens' };
  }
}

export async function getInstagramIntegration(userId: string, internalId: string) {
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
    console.error('Error getting Instagram integration:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get integration' };
  }
} 