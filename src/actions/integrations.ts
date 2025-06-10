"use server"

import { db } from "@/db/drizzle";
import { integration } from "@/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { XProvider } from "@/providers/x.provider";
import { LinkedInProvider } from "@/providers/linkedin.provider";
import { TikTokProvider } from "@/providers/tiktok.provider";
import { YouTubeProvider } from "@/providers/youtube.provider";
import { InstagramProvider } from "@/providers/instagram.provider";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
 * Handles Twitter/X authorization
 * Generates authorization URL and returns it
 */
export async function authorizeTwitter() {
  try {
    // Initialize X provider
    const xProvider = new XProvider(
      process.env.X_CLIENT_ID || '',
      process.env.X_CLIENT_SECRET || '',
      `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/x/callback`
    );
    
    // Generate auth URL with state and code verifier
    const { url, state, codeVerifier } = await xProvider.generateAuthUrl();
    
    // Store data to be used in the callback
    // Note: In a real app, these could be stored in a database or session
    // For simplicity, we're using the return value to be handled by the client
    return { 
      success: true, 
      url,
      state,
      codeVerifier
    };
  } catch (error) {
    console.error('X authorization error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to initiate X authorization'
    };
  }
}

/**
 * Completes Twitter authorization by exchanging the code for tokens
 */
export async function completeTwitterAuth(userId: string, code: string, codeVerifier: string) {
  try {
    // Initialize X provider
    const xProvider = new XProvider(
      process.env.X_CLIENT_ID || '',
      process.env.X_CLIENT_SECRET || '',
      `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/x/callback`
    );
    
    // Exchange code for tokens
    const result = await xProvider.authenticate(code, userId, codeVerifier);
    
    if (result.error) {
      return { 
        success: false, 
        error: result.error 
      };
    }
    
    return { 
      success: true, 
      data: {
        name: result.name,
        picture: result.picture,
        username: result.username
      }
    };
  } catch (error) {
    console.error('X authentication completion error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to complete X authorization'
    };
  }
}

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

export async function refreshIntegrationToken(integrationId: string) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: "Unauthorized",
        redirectTo: "/sign-in"
      };
    }

    const userId = session.user.id;
    
    // Fetch the specific integration
    const [integrationData] = await db.select()
      .from(integration)
      .where(
        and(
          eq(integration.id, integrationId),
          eq(integration.userId, userId)
        )
      );
    
    if (!integrationData) {
      return { 
        success: false, 
        error: "Integration not found" 
      };
    }

    // Determine provider and refresh accordingly
    let refreshResult;
    switch (integrationData.providerIdentifier) {
      case 'twitter':
        const xProvider = new XProvider(
          process.env.X_CLIENT_ID || '',
          process.env.X_CLIENT_SECRET || '',
          `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/x/callback`
        );
        refreshResult = await xProvider.refreshToken(
          userId, 
          integrationData.internalId
        );
        break;
      
      case 'linkedin':
        const linkedinProvider = new LinkedInProvider(
          process.env.LINKEDIN_CLIENT_ID || '',
          process.env.LINKEDIN_CLIENT_SECRET || '',
          `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/linkedin/callback`
        );
        refreshResult = await linkedinProvider.refreshToken(
          userId, 
          integrationData.internalId
        );
        break;
      
      case 'tiktok':
        const tiktokProvider = new TikTokProvider(
          process.env.TIKTOK_CLIENT_KEY || '',
          process.env.TIKTOK_CLIENT_SECRET || '',
          `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/tiktok/callback`
        );
        refreshResult = await tiktokProvider.refreshToken(
          userId, 
          integrationData.internalId
        );
        break;
      
      case 'youtube':
        const youtubeProvider = new YouTubeProvider(
          process.env.YOUTUBE_CLIENT_ID || '',
          process.env.YOUTUBE_CLIENT_SECRET || '',
          `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/youtube/callback`
        );
        refreshResult = await youtubeProvider.refreshToken(
          userId, 
          integrationData.internalId
        );
        break;
      
      case 'instagram':
        const instagramProvider = new InstagramProvider(
          process.env.INSTAGRAM_CLIENT_ID || '',
          process.env.INSTAGRAM_CLIENT_SECRET || '',
          `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/instagram/callback`
        );
        refreshResult = await instagramProvider.refreshToken(
          userId, 
          integrationData.internalId
        );
        break;
      
      default:
        return { 
          success: false, 
          error: `Unsupported provider: ${integrationData.providerIdentifier}` 
        };
    }

    return {
      success: true,
      message: `${integrationData.providerIdentifier.charAt(0).toUpperCase() + integrationData.providerIdentifier.slice(1)} token refreshed successfully`
    };
  } catch (error) {
    console.error('Error refreshing integration token:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to refresh token" 
    };
  }
} 