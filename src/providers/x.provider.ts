import dayjs from 'dayjs';
import { eq, and } from 'drizzle-orm';
import { createHash } from 'crypto';
import { db } from '@/db/drizzle';
import { integration } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';

export interface AuthTokenDetails {
  id: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  picture: string;
  username: string;
  error?: string;
}

export interface TweetDetails {
  id: string;
  text: string;
  media?: {
    url: string;
    type: 'image' | 'video';
    altText?: string;
  }[];
  pollOptions?: string[];
  pollDurationMinutes?: number;
  replySettings?: 'everyone' | 'mentionedUsers' | 'following';
}

export class XProvider {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes = [
    'tweet.read',
    'tweet.write',
    'users.read',
    'offline.access'
  ];

  constructor(
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  async generateAuthUrl() {
    // Create a random state string for CSRF protection
    const state = uuidv4();
    
    // Create a code verifier for PKCE
    const codeVerifier = uuidv4();
    
    // Create code challenge from verifier
    const codeChallenge = createHash('sha256')
      .update(codeVerifier)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return {
      url: 
        'https://twitter.com/i/oauth2/authorize' +
        `?client_id=${this.clientId}` +
        `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(this.scopes.join(' '))}` +
        `&state=${state}` +
        `&code_challenge=${codeChallenge}` +
        `&code_challenge_method=S256`,
      state,
      codeVerifier,
    };
  }

  async authenticate(code: string, userId: string, codeVerifier: string): Promise<AuthTokenDetails> {
    try {
      // Exchange code for tokens
      const tokenResponse = await this.fetch(
        'https://api.twitter.com/2/oauth2/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: this.redirectUri,
            code_verifier: codeVerifier
          }).toString()
        }
      );

      const { access_token, refresh_token, expires_in } = tokenResponse;

      // Get user information
      const userInfo = await this.fetch(
        'https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username',
        {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        }
      );

      const user = userInfo.data;

      // Generate a unique internal ID
      const internalId = `x_${user.id}`;

      // Store the integration in the database
      await db.insert(integration)
        .values({
          internalId,
          userId,
          name: user.name,
          picture: user.profile_image_url,
          providerIdentifier: 'twitter', // Using twitter as defined in your enum
          type: 'social_media',
          token: access_token,
          refreshToken: refresh_token,
          tokenExpiration: dayjs().add(expires_in, 'seconds').toDate(),
          profile: user.username || '',
          postingTimes: JSON.stringify([
            { time: 480 }, // 8:00 AM
            { time: 720 }, // 12:00 PM
            { time: 1020 } // 5:00 PM
          ]),
          additionalSettings: JSON.stringify([])
        })
        .onConflictDoUpdate({
          target: [integration.userId, integration.providerIdentifier], // Use the actual unique constraint
          set: {
            internalId, // Update internal ID in case it changed
            name: user.name,
            picture: user.profile_image_url,
            token: access_token,
            refreshToken: refresh_token,
            tokenExpiration: dayjs().add(expires_in, 'seconds').toDate(),
            profile: user.username || '',
            updatedAt: new Date(),
            disabled: false,
            deletedAt: null
          },
        });

      return {
        id: user.id,
        name: user.name,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
        picture: user.profile_image_url,
        username: user.username,
      };
    } catch (error) {
      console.error('X authentication error:', error);
      return {
        id: '',
        name: '',
        accessToken: '',
        refreshToken: '',
        expiresIn: 0,
        picture: '',
        username: '',
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  async refreshToken(userId: string, internalId: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Use the proper Drizzle query syntax
    const [integrationData] = await db.select()
      .from(integration)
      .where(
        and(
          eq(integration.userId, userId),
          eq(integration.internalId, internalId),
          eq(integration.providerIdentifier, 'twitter')
        )
      );

    if (!integrationData || !integrationData.refreshToken) {
      throw new Error('No refresh token found');
    }

    try {
      const response = await this.fetch(
        'https://api.twitter.com/2/oauth2/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: integrationData.refreshToken
          }).toString()
        }
      );

      const { access_token, refresh_token, expires_in } = response;

      // Update the integration with new tokens
      await db.update(integration)
        .set({
          token: access_token,
          refreshToken: refresh_token,
          tokenExpiration: dayjs().add(expires_in, 'seconds').toDate(),
          updatedAt: new Date(),
          refreshNeeded: false
        })
        .where(eq(integration.id, integrationData.id));

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
      };
    } catch (error) {
      // Mark that refresh is needed
      await db.update(integration)
        .set({
          refreshNeeded: true
        })
        .where(eq(integration.id, integrationData.id));
        
      throw new Error('Failed to refresh token');
    }
  }

  async post(accessToken: string, tweetDetails: TweetDetails) {
    try {
      const { text, media, replySettings } = tweetDetails;

      // First, validate that we have a user context token by testing with /users/me
      try {
        await this.fetch('https://api.twitter.com/2/users/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
      } catch (error) {
        console.error('Token validation failed:', error);
        return {
          success: false,
          error: 'Invalid or expired token. Please re-authenticate.',
          needsReauth: true
        };
      }
  
      // Upload media if provided using v1.1 API (which supports OAuth 2.0 for media upload)
      const mediaIds: string[] = [];
      
      if (media && media.length > 0) {
        for (const m of media) {
          try {
            // For a real implementation, you'd need to:
            // 1. Fetch the media from the URL
            // 2. Get the file size and type
            // 3. Upload in chunks if large
            
            // This is a simplified version - you'll need to implement actual file upload
            console.warn('Media upload not fully implemented - skipping media');
          } catch (err) {
            console.error('Error uploading media to X:', err);
          }
        }
      }
  
      // Use Twitter API v2 for posting tweets
      const payload: any = { 
        text: text
      };
      
      // Add media if we have any
      if (mediaIds.length > 0) {
        payload.media = {
          media_ids: mediaIds
        };
      }

      // Add reply settings if specified
      if (replySettings) {
        payload.reply_settings = replySettings;
      }

      console.log('Posting tweet with payload:', JSON.stringify(payload, null, 2));
      console.log('Using token (first 10 chars):', accessToken.substring(0, 10) + '...');
  
      // Post the tweet using v2 API
      const postResponse = await this.fetch(
        'https://api.twitter.com/2/tweets',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(payload)
        }
      );
  
      return {
        success: true,
        postId: postResponse.data.id,
        tweetId: postResponse.data.id,
        releaseURL: `https://twitter.com/i/web/status/${postResponse.data.id}`
      };
    } catch (error) {
      console.error('Error posting to X:', error);
      
      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          return {
            success: false,
            error: 'Token expired or invalid. Please re-authenticate.',
            needsReauth: true
          };
        }
        
        if (error.message.includes('403') && error.message.includes('Unsupported Authentication')) {
          return {
            success: false,
            error: 'Authentication error: The token does not have user context. Please check your OAuth 2.0 flow and ensure you have the correct scopes.',
            needsReauth: true
          };
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to post tweet',
      };
    }
  }

  private async fetch(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return response.json();
  }
}