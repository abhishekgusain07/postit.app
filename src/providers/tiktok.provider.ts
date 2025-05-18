import dayjs from 'dayjs';
import { eq, and } from 'drizzle-orm';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { storeTikTokIntegration, updateTikTokTokens, getTikTokIntegration } from '@/actions/tiktok';


export interface AuthTokenDetails {
  id: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  picture: string;
  username: string;
  openId: string;
  error?: string;
}

export interface TikTokPostDetails {
  id: string;
  text: string;
  media?: {
    url: string;
    type: 'image' | 'video';
    altText?: string;
  }[];
}

export class TikTokProvider {
  private readonly clientKey: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes = [
    'user.info.basic',
    'video.list',
    'video.upload',
    'video.publish'
  ];

  constructor(
    clientKey: string,
    clientSecret: string,
    redirectUri: string
  ) {
    this.clientKey = clientKey;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  async generateAuthUrl() {
    // Create a random state string for CSRF protection
    const state = uuidv4();
    
    // TikTok uses standard OAuth 2.0 without PKCE
    return {
      url: 
        'https://www.tiktok.com/auth/authorize/' +
        `?client_key=${this.clientKey}` +
        `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(this.scopes.join(','))}` +
        `&state=${state}`,
      state
    };
  }

  async authenticate(code: string, userId: string): Promise<AuthTokenDetails> {
    try {
      // Exchange code for tokens
      const tokenResponse = await this.fetch(
        'https://open-api.tiktok.com/oauth/access_token/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            client_key: this.clientKey,
            client_secret: this.clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: this.redirectUri
          }).toString()
        }
      );

      if (!tokenResponse.data || !tokenResponse.data.access_token) {
        throw new Error('Failed to get access token: ' + JSON.stringify(tokenResponse));
      }

      const { 
        access_token, 
        refresh_token, 
        expires_in, 
        open_id 
      } = tokenResponse.data;

      // Get user information
      const userInfo = await this.fetch(
        'https://open-api.tiktok.com/user/info/',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${access_token}`
          },
          body: JSON.stringify({
            open_id: open_id
          })
        }
      );

      if (!userInfo.data || !userInfo.data.user) {
        throw new Error('Failed to get user info: ' + JSON.stringify(userInfo));
      }

      const user = userInfo.data.user;

      // Generate a unique internal ID
      const internalId = `tiktok_${open_id}`;

      // Store the integration in the database using server action
      await storeTikTokIntegration(
        userId,
          internalId,
        user.display_name || 'TikTok User',
        user.avatar_url,
        access_token,
        refresh_token,
        expires_in,
        user.username || ''
      );

      return {
        id: open_id,
        name: user.display_name || 'TikTok User',
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
        picture: user.avatar_url,
        username: user.username || '',
        openId: open_id
      };
    } catch (error) {
      console.error('TikTok authentication error:', error);
      return {
        id: '',
        name: '',
        accessToken: '',
        refreshToken: '',
        expiresIn: 0,
        picture: '',
        username: '',
        openId: '',
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  async refreshToken(userId: string, internalId: string): Promise<{ accessToken: string; refreshToken: string }> {
    const integrationResult = await getTikTokIntegration(userId, internalId);

    if (!integrationResult.success || !integrationResult.data?.refreshToken) {
      throw new Error('No refresh token found');
    }

    const integrationData = integrationResult.data;

    try {
      const response = await this.fetch(
        'https://open-api.tiktok.com/oauth/refresh_token/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            client_key: this.clientKey,
            client_secret: this.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: integrationData.refreshToken || ''
          }).toString()
        }
      );

      if (!response.data || !response.data.access_token) {
        throw new Error('Failed to refresh token: ' + JSON.stringify(response));
      }

      const { access_token, refresh_token, expires_in } = response.data;

      // Update the integration with new tokens using server action
      const result = await updateTikTokTokens(
        userId,
        internalId,
        access_token,
        refresh_token,
        expires_in
      );

      if (!result.success) {
        throw new Error('Failed to update tokens in database');
      }

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
      };
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }

  async post(accessToken: string, openId: string, postDetails: TikTokPostDetails) {
    try {
      const { text, media } = postDetails;
      
      // TikTok's API primarily supports video uploads
      if (!media || media.length === 0 || media[0].type !== 'video') {
        throw new Error('TikTok posting requires at least one video');
      }
      
      const videoUrl = media[0].url;
      
      // Step 1: Create upload URL
      const createUploadResponse = await this.fetch(
        'https://open-api.tiktok.com/share/video/upload/',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            open_id: openId
          })
        }
      );
      
      if (!createUploadResponse.data || !createUploadResponse.data.upload_url) {
        throw new Error('Failed to get upload URL: ' + JSON.stringify(createUploadResponse));
      }
      
      const uploadUrl = createUploadResponse.data.upload_url;
      
      // Step 2: Upload video file
      // In a real implementation, you would download the video from videoUrl
      // and then upload it to the TikTok upload URL
      // This is simplified for this example
      
      // Simulate video upload
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: new FormData(), // Would contain the actual video file
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video: ' + await uploadResponse.text());
      }
      
      // Step 3: Publish the video
      const publishResponse = await this.fetch(
        'https://open-api.tiktok.com/video/publish/',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            open_id: openId,
            video_id: '', // You would get this from the upload response
            title: text,
            privacy_level: 'public'
          })
        }
      );
      
      return {
        success: true,
        postId: publishResponse.data?.video_id,
        releaseURL: `https://www.tiktok.com/@username/video/${publishResponse.data?.video_id}`
      };
    } catch (error) {
      console.error('Error posting to TikTok:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to post to TikTok',
      };
    }
  }

  private async fetch(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
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