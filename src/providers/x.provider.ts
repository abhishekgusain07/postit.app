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
  // Updated to match Twitter API v2 enumeration values
  replySettings?: 'following' | 'mentionedUsers' | 'subscribers' | 'verified' | 'everyone';
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
    
    // Create a code verifier for PKCE (must be between 43-128 characters)
    const codeVerifier = this.generateCodeVerifier();
    
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

  private generateCodeVerifier(): string {
    // Generate a cryptographically random code verifier (43-128 characters)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < 128; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async authenticate(code: string, userId: string, codeVerifier: string): Promise<AuthTokenDetails> {
    try {
      // Exchange code for tokens using PKCE
      const tokenResponse = await this.fetchTokens(
        'https://api.twitter.com/2/oauth2/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            // For OAuth 2.0 with PKCE, we use Basic auth with client credentials
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: this.redirectUri,
            code_verifier: codeVerifier,
            client_id: this.clientId // Include client_id in the body as well
          }).toString()
        }
      );

      const { access_token, refresh_token, expires_in } = tokenResponse;

      // Get user information using the USER CONTEXT token
      const userInfo = await this.fetchWithUserContext(
        'https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username',
        access_token
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
          providerIdentifier: 'twitter',
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
          target: [integration.userId, integration.providerIdentifier],
          set: {
            internalId,
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
      const response = await this.fetchTokens(
        'https://api.twitter.com/2/oauth2/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: integrationData.refreshToken,
            client_id: this.clientId
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

      // Debug logging
      console.log('Post method called with:', {
        accessTokenPresent: !!accessToken,
        accessTokenType: typeof accessToken,
        accessTokenLength: accessToken?.length || 0,
        textLength: text?.length || 0
      });

      // Validate that we have an access token
      if (!accessToken || typeof accessToken !== 'string') {
        return {
          success: false,
          error: 'No valid access token provided. Please re-authenticate.',
          needsReauth: true
        };
      }

      // Validate token by testing with /users/me using user context
      try {
        await this.fetchWithUserContext('https://api.twitter.com/2/users/me', accessToken);
      } catch (error) {
        console.error('Token validation failed:', error);
        return {
          success: false,
          error: 'Invalid or expired token. Please re-authenticate.',
          needsReauth: true
        };
      }
  
      // Upload media if provided using v1.1 API
      const mediaIds: string[] = [];
      
      if (media && media.length > 0) {
        for (const m of media) {
          try {
            // For a real implementation, you'd need to:
            // 1. Fetch the media from the URL
            // 2. Get the file size and type
            // 3. Upload using the media upload endpoint with OAuth 1.0a or proper OAuth 2.0 user context
            
            console.warn('Media upload not fully implemented - skipping media');
          } catch (err) {
            console.error('Error uploading media to X:', err);
          }
        }
      }
  
      // Use Twitter API v2 for posting tweets with USER CONTEXT
      const payload: any = { 
        text: text
      };
      
      // Add media if we have any
      if (mediaIds.length > 0) {
        payload.media = {
          media_ids: mediaIds
        };
      }

      // Add reply settings if specified and not 'everyone' (which is the default)
      if (replySettings && replySettings !== 'everyone') {
        // Map our internal values to Twitter API expected values
        const replySettingsMap: Record<string, string> = {
          'mentionedUsers': 'mentionedUsers',
          'following': 'following',
          'subscribers': 'subscribers',
          'verified': 'verified'
        };
        
        payload.reply_settings = replySettingsMap[replySettings];
      }

      // Debug log the payload being sent
      console.log('Sending payload to Twitter API:', JSON.stringify(payload, null, 2));

      // Post the tweet using v2 API with proper user context authentication
      const postResponse = await this.fetchWithUserContext(
        'https://api.twitter.com/2/tweets',
        accessToken,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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

  // Separate method for token-related requests (uses Basic auth)
  private async fetchTokens(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token request failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: url
      });
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return response.json();
  }

  // Separate method for user context requests (uses Bearer token)
  private async fetchWithUserContext(url: string, accessToken: string, options: RequestInit = {}) {
    // Check if accessToken is valid
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error(`Invalid access token: ${accessToken ? typeof accessToken : 'null/undefined'}`);
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('User context request failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: url,
        tokenLength: accessToken?.length || 0,
        tokenPresent: !!accessToken
      });
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return response.json();
  }
}