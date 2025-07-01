"use server";

import { z } from 'zod';
import { LinkedInProvider } from '@/providers/linkedin.provider';
import { getUserIntegrations } from './integrations';
import { Integration } from '@/types';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

// Zod schema for LinkedIn post validation
const linkedInPostSchema = z.object({
  text: z.string()
    .min(1, { message: "Post cannot be empty" })
    .max(3000, { message: "LinkedIn post must be 3000 characters or less" }),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['image', 'video']),
    altText: z.string().optional()
  })).max(1, { message: "LinkedIn allows only one media item per post" }).optional(),
});

export async function checkLinkedInIntegration() {
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

    // Find LinkedIn integration
    const linkedInIntegration = result.data?.find(
      integration => integration.providerIdentifier === 'linkedin'
    );

    if (!linkedInIntegration) {
      return {
        success: true,
        isConnected: false
      };
    }

    console.log('LinkedIn integration found:', {
      id: linkedInIntegration?.id,
      name: linkedInIntegration?.name,
      tokenPresent: !!linkedInIntegration?.token,
      tokenType: typeof linkedInIntegration?.token,
      tokenLength: linkedInIntegration.token?.length || 0,
      tokenExpiration: linkedInIntegration.tokenExpiration,
      refreshTokenPresent: !!linkedInIntegration.refreshToken
    });
    
    // Check if token is expired
    if (linkedInIntegration.tokenExpiration && new Date() > new Date(linkedInIntegration.tokenExpiration)) {
      console.log('Token is expired, attempting refresh...');
      return {
        success: false,
        error: "Token expired. Please re-authenticate.",
        needsReauth: true
      };
    }
    
    // Validate token exists
    if (!linkedInIntegration.token) {
      return {
        success: false,
        error: "No access token found. Please re-authenticate.",
        needsReauth: true
      };
    }

    return {
      success: true,
      isConnected: true,
      integration: linkedInIntegration as Integration
    };
  } catch (error) {
    console.error('Error checking LinkedIn integration:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export async function postLinkedInPost(formData: z.infer<typeof linkedInPostSchema>) {
  try {
    // Debug log the received form data
    console.log('Received form data in postLinkedInPost:', JSON.stringify(formData, null, 2));
    
    // Validate input
    const validatedData = linkedInPostSchema.parse(formData);
    
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

    // Find LinkedIn integration
    const linkedInIntegration = result.data?.find(
      integration => integration.providerIdentifier === 'linkedin'
    );

    if (!linkedInIntegration) {
      return { 
        success: false, 
        error: "LinkedIn account not connected",
        redirectTo: "/integrations"
      };
    }

    // Initialize LinkedIn Provider 
    const linkedInProvider = new LinkedInProvider(
      process.env.LINKEDIN_CLIENT_ID || '',
      process.env.LINKEDIN_CLIENT_SECRET || '',
      `${process.env.FRONTEND_URL}/api/integrations/linkedin/callback`
    );

    // Ensure we have a valid token
    const accessToken = linkedInIntegration.token;
    if (!accessToken) {
      return { 
        success: false, 
        error: "No access token available",
        redirectTo: "/integrations"
      };
    }

    // Post to LinkedIn
    const postResult = await linkedInProvider.post(accessToken, {
      id: linkedInIntegration.id || '',
      text: validatedData.text,
      media: validatedData.media || []
    });

    return postResult;
  } catch (error) {
    console.error('Error posting to LinkedIn:', error);
    
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
