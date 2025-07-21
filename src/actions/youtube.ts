"use server";
import { db } from "@/db/drizzle";
import { integration } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import dayjs from "dayjs";
import { getUserIntegrations } from './integrations';
import { Integration } from '@/types';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { YouTubeProvider } from "@/providers/youtube.provider";

// Zod schema for YouTube video validation
const youtubeVideoSchema = z.object({
  title: z.string()
    .min(1, { message: "Title cannot be empty" })
    .max(100, { message: "Title must be 100 characters or less" }),
  description: z.string()
    .max(5000, { message: "Description must be 5000 characters or less" })
    .optional(),
  videoUrl: z.string()
    .url({ message: "Please enter a valid video URL" }),
  privacyStatus: z.enum(['public', 'private', 'unlisted']).optional().default('private'),
  tags: z.string().optional(),
  categoryId: z.string().optional(),
});

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

export async function checkYouTubeIntegration() {
  try {
    // Get the current session
    const session = await auth.api.getSession({
        headers: await headers() 
    })
    
    if (!session?.user) {
      return { 
        success: false, 
        error: "Authentication required",
        redirectTo: "/sign-in"
      };
    }

    // Fetch user's integrations
    const result = await getUserIntegrations(session.user.id);
    
    if (!result.success) {
      return { 
        success: false, 
        error: result.error || "Failed to fetch integrations" 
      };
    }

    // Find YouTube integration
    const youTubeIntegration = result.data?.find(
      integration => integration.providerIdentifier === 'youtube'
    );

    if (!youTubeIntegration) {
      return {
        success: true,
        isConnected: false
      };
    }

    console.log('YouTube integration found:', {
      id: youTubeIntegration?.id,
      name: youTubeIntegration?.name,
      tokenPresent: !!youTubeIntegration?.token,
      tokenType: typeof youTubeIntegration?.token,
      tokenLength: youTubeIntegration.token?.length || 0,
      tokenExpiration: youTubeIntegration.tokenExpiration,
      refreshTokenPresent: !!youTubeIntegration.refreshToken
    });
    
    // Check if token is expired
    if (youTubeIntegration.tokenExpiration && new Date() > new Date(youTubeIntegration.tokenExpiration)) {
      console.log('Token is expired, attempting refresh...');
      return {
        success: false,
        error: "Token expired. Please re-authenticate.",
        needsReauth: true
      };
    }
    
    // Validate token exists
    if (!youTubeIntegration.token) {
      return {
        success: false,
        error: "No access token found. Please re-authenticate.",
        needsReauth: true
      };
    }

    return {
      success: true,
      isConnected: true,
      integration: youTubeIntegration as Integration
    };
  } catch (error) {
    console.error('Error checking YouTube integration:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export async function isYouTubeConnected(userId: string): Promise<{ connected: boolean; channelId?: string; channelName?: string }> {
  try {
    const [integrationData] = await db.select()
      .from(integration)
      .where(
        and(
          eq(integration.userId, userId),
          eq(integration.providerIdentifier, 'youtube')
        )
      );
    if (integrationData) {
      return { connected: true, channelId: integrationData.internalId, channelName: integrationData.name };
    }
    return { connected: false };
  } catch (error) {
    console.error('Error checking YouTube connection:', error);
    return { connected: false };
  }
}

export async function uploadYouTubeVideo(formData: z.infer<typeof youtubeVideoSchema>) {
  try {
    // Debug log the received form data
    console.log('Received form data in uploadYouTubeVideo:', JSON.stringify(formData, null, 2));
    
    // Validate input
    const validatedData = youtubeVideoSchema.parse(formData);
    
    // Debug log the validated data
    console.log('Validated data:', JSON.stringify(validatedData, null, 2));

    // Get the current session
    const session = await auth.api.getSession({
        headers: await headers() 
    })
    
    if (!session?.user) {
      return { 
        success: false, 
        error: "Authentication required",
        redirectTo: "/sign-in"
      };
    }

    // Fetch user's integrations
    const result = await getUserIntegrations(session.user.id);
    
    if (!result.success) {
      return { 
        success: false, 
        error: result.error || "Failed to fetch integrations" 
      };
    }

    // Find YouTube integration
    const youtubeIntegration = result.data?.find(
      integration => integration.providerIdentifier === 'youtube'
    );

    if (!youtubeIntegration) {
      return { 
        success: false, 
        error: "YouTube account not connected",
        redirectTo: "/integrations"
      };
    }

    // Initialize YouTube Provider 
    const youtubeProvider = new YouTubeProvider(
      process.env.YOUTUBE_CLIENT_ID || '',
      process.env.YOUTUBE_CLIENT_SECRET || '',
      `${process.env.FRONTEND_URL}/api/integrations/youtube/callback`
    );

    // Ensure we have a valid token
    const accessToken = youtubeIntegration.token;
    if (!accessToken) {
      return { 
        success: false, 
        error: "No access token available",
        redirectTo: "/integrations"
      };
    }

    // Prepare video details
    const videoDetails = {
      id: '', // Will be set by YouTube API
      title: validatedData.title,
      description: validatedData.description || '',
      videoUrl: validatedData.videoUrl,
      privacyStatus: validatedData.privacyStatus || 'private',
      categoryId: validatedData.categoryId,
      tags: validatedData.tags ? validatedData.tags.split(',').map(tag => tag.trim()) : undefined,
    };

    // Upload video to YouTube
    const uploadResult = await youtubeProvider.uploadVideo(accessToken, videoDetails);

    return uploadResult;
  } catch (error) {
    console.error('Error uploading YouTube video:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => e.message).join(', ') 
      };
    }

    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}