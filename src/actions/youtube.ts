"use server";
import { db } from "@/db/drizzle";
import { integration } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import dayjs from "dayjs";

export async function storeYouTubeIntegration(
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
    // First check if the integration exists
    const existingIntegration = await db
      .select()
      .from(integration)
      .where(
        and(
          eq(integration.userId, userId),
          eq(integration.internalId, internalId),
          eq(integration.providerIdentifier, 'youtube')
        )
      );

    if (existingIntegration.length > 0) {
      // Update existing integration
      await db.update(integration)
        .set({
          name,
          picture,
          token: accessToken,
          refreshToken,
          tokenExpiration: dayjs().add(expiresIn, 'seconds').toDate(),
          profile,
          updatedAt: new Date(),
        })
        .where(eq(integration.id, existingIntegration[0].id));
    } else {
      // Insert new integration
      await db.insert(integration)
        .values({
          internalId,
          userId,
          name,
          picture,
          providerIdentifier: 'youtube',
          type: 'social_media',
          token: accessToken,
          refreshToken,
          tokenExpiration: dayjs().add(expiresIn, 'seconds').toDate(),
          profile,
        });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error storing YouTube integration:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to store integration' };
  }
}

export async function updateYouTubeTokens(
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
          eq(integration.providerIdentifier, 'youtube')
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
    console.error('Error updating YouTube tokens:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update tokens' };
  }
}

export async function getYouTubeIntegration(userId: string, internalId: string) {
  try {
    const [integrationData] = await db.select()
      .from(integration)
      .where(
        and(
          eq(integration.userId, userId),
          eq(integration.internalId, internalId),
          eq(integration.providerIdentifier, 'youtube')
        )
      );
      
    return { success: true, data: integrationData };
  } catch (error) {
    console.error('Error getting YouTube integration:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get integration' };
  }
}