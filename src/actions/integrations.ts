"use server"

import { db } from "@/db/drizzle";
import { integration } from "@/db/schema";
import { eq, isNull, and } from "drizzle-orm";

// Type definition matching the client component's expected type
export type Integration = {
  id: string;
  name: string;
  picture: string | null;
  providerIdentifier: string;
  profile: string | null;
  createdAt: Date;
};

/**
 * Fetches all active integrations for a user
 * @param userId The ID of the user to fetch integrations for
 * @returns An array of integrations
 */
export async function getUserIntegrations(userId: string) {
  try {
    // Fetch the user's integrations from the database with explicit field selection
    const integrationsData = await db.select({
        id: integration.id,
        name: integration.name,
        picture: integration.picture,
        providerIdentifier: integration.providerIdentifier,
        profile: integration.profile,
        createdAt: integration.createdAt
      })
      .from(integration)
      .where(
        and(
          eq(integration.userId, userId),
          isNull(integration.deletedAt)
        )
      )
      .orderBy(integration.createdAt);

    // Ensure createdAt is never null by providing a default value
    const integrations: Integration[] = integrationsData.map(item => ({
      id: item.id,
      name: item.name,
      picture: item.picture,
      providerIdentifier: item.providerIdentifier,
      profile: item.profile,
      createdAt: item.createdAt || new Date() // Fallback to current date if null
    }));

    return { success: true, data: integrations };
  } catch (error) {
    console.error("Error fetching user integrations:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch integrations" 
    };
  }
}

/**
 * Deletes an integration by ID
 * @param integrationId The ID of the integration to delete
 * @returns Success status and error message if applicable
 */
export async function deleteIntegration(integrationId: string) {
  try {
    // Soft delete by setting deletedAt
    await db.update(integration)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(integration.id, integrationId));
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting integration:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete integration" 
    };
  }
} 