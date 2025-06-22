"use server";

import { z } from 'zod';
import { authClient } from '@/lib/auth-client';
import { XProvider } from '@/providers/x.provider';
import { getTwitterIntegration, getUserIntegrations } from './integrations';
import { Integration } from '@/types';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

// Zod schema for tweet validation (match the one in the client)
const tweetSchema = z.object({
  text: z.string()
    .min(1, { message: "Tweet cannot be empty" })
    .max(280, { message: "Tweet must be 280 characters or less" }),
  replySettings: z.enum(['following', 'mentionedUsers', 'subscribers', 'verified', 'everyone']).optional(),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['image', 'video']),
    altText: z.string().optional()
  })).optional(),
});

export async function checkTwitterIntegration() {
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
    const result = await getTwitterIntegration(session.user.id);
    
    if (!result.success) {
      return { 
        success: false, 
        error: result.error || "Failed to fetch integrations" 
      };
    }
    const twitterIntegration = result.data as Integration;

    console.log('Twitter integration found:', {
      id: twitterIntegration?.id,
      name: twitterIntegration?.name,
      tokenPresent: !!twitterIntegration?.token,
      tokenType: typeof twitterIntegration?.token,
      tokenLength: twitterIntegration.token?.length || 0,
      tokenExpiration: twitterIntegration.tokenExpiration,
      refreshTokenPresent: !!twitterIntegration.refreshToken
    });
    
    // Check if token is expired
    if (twitterIntegration.tokenExpiration && new Date() > new Date(twitterIntegration.tokenExpiration)) {
      console.log('Token is expired, attempting refresh...');
      // You might want to implement automatic token refresh here
      return {
        success: false,
        error: "Token expired. Please re-authenticate.",
        needsReauth: true
      };
    }
    
    // Validate token exists
    if (!twitterIntegration.token) {
      return {
        success: false,
        error: "No access token found. Please re-authenticate.",
        needsReauth: true
      };
    }
    return {
      success: true,
      isConnected: !!twitterIntegration,
      integration: twitterIntegration
    };
  } catch (error) {
    console.error('Error checking Twitter integration:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export async function postTweet(formData: z.infer<typeof tweetSchema>) {
  try {
    // Debug log the received form data
    console.log('Received form data in postTweet:', JSON.stringify(formData, null, 2));
    
    // Validate input
    const validatedData = tweetSchema.parse(formData);
    
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

    // Find Twitter integration
    const twitterIntegration = result.data?.find(
      integration => integration.providerIdentifier === 'twitter'
    );

    if (!twitterIntegration) {
      return { 
        success: false, 
        error: "Twitter account not connected",
        redirectTo: "/integrations"
      };
    }

    // Initialize X Provider 
    const xProvider = new XProvider(
      process.env.X_CLIENT_ID || '',
      process.env.X_CLIENT_SECRET || '',
      `${process.env.FRONTEND_URL}/api/integrations/x/callback`
    );

    // Post tweet (use type assertion to handle token)
    const postResult = await xProvider.post((twitterIntegration as Integration).token, {
      id: '', // X will generate this
      text: validatedData.text,
      media: validatedData.media || [], 
      replySettings: validatedData.replySettings
    });

    return postResult;
  } catch (error) {
    console.error('Error posting tweet:', error);
    
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