import { makeId } from '../utils/makeId';
import dayjs from 'dayjs';
import { integration } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db/drizzle';
import { v4 as uuidv4 } from 'uuid';
import { storeInstagramIntegration, updateInstagramTokens, getInstagramIntegration } from '../actions/instagram';

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

export interface PostDetails {
  id: string;
  message: string;
  media?: {
    url: string;
    type: 'image' | 'video';
  }[];
}

export class InstagramProvider {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes = [
    'instagram_basic',
    'pages_show_list',
    'pages_read_engagement',
    'business_management',
    'instagram_content_publish',
    'instagram_manage_comments',
    'instagram_manage_insights',
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
    const state = makeId(6);
    return {
      url:
        'https://www.facebook.com/v20.0/dialog/oauth' +
        `?client_id=${this.clientId}` +
        `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
        `&state=${state}` +
        `&scope=${encodeURIComponent(this.scopes.join(','))}`,
      state,
    };
  }

  async authenticate(code: string, userId: string): Promise<AuthTokenDetails> {
    try {
      // First exchange: Authorization code → Short-lived access token
      const getAccessToken = await this.fetch(
        'https://graph.facebook.com/v20.0/oauth/access_token' +
          `?client_id=${this.clientId}` +
          `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
          `&client_secret=${this.clientSecret}` +
          `&code=${code}`
      );

      // Second exchange: Short-lived token → Long-lived token
      const { access_token, expires_in } = await this.fetch(
        'https://graph.facebook.com/v20.0/oauth/access_token' +
          '?grant_type=fb_exchange_token' +
          `&client_id=${this.clientId}` +
          `&client_secret=${this.clientSecret}` +
          `&fb_exchange_token=${getAccessToken.access_token}`
      );

      // Get user information
      const userInfo = await this.fetch(
        `https://graph.facebook.com/v20.0/me?fields=id,name,picture&access_token=${access_token}`
      );

      // Get Instagram business account
      const pages = await this.fetch(
        `https://graph.facebook.com/v20.0/me/accounts?fields=id,instagram_business_account,username,name,picture.type(large)&access_token=${access_token}&limit=500`
      );

      const instagramAccount = pages.data.find(
        (page: any) => page.instagram_business_account
      );

      if (!instagramAccount) {
        throw new Error('No Instagram Business account found');
      }

      // Store the integration using server action
      const storeResult = await storeInstagramIntegration(
        userId,
        instagramAccount.instagram_business_account.id,
        instagramAccount.name,
        instagramAccount.picture?.data?.url || '',
        access_token,
        access_token,
        59 * 24 * 60 * 60, // 59 days in seconds
        instagramAccount.username || ''
      );

      if (!storeResult.success) {
        throw new Error(storeResult.error);
      }

      return {
        id: instagramAccount.instagram_business_account.id,
        name: instagramAccount.name,
        accessToken: access_token,
        refreshToken: access_token,
        expiresIn: 59 * 24 * 60 * 60,
        picture: instagramAccount.picture?.data?.url || '',
        username: instagramAccount.username || '',
      };
    } catch (error) {
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
    try {
      const { success, data: integrationData } = await getInstagramIntegration(userId, internalId);

      if (!success || !integrationData || !integrationData.refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await this.fetch(
        'https://graph.facebook.com/v20.0/oauth/access_token' +
          '?grant_type=fb_exchange_token' +
          `&client_id=${this.clientId}` +
          `&client_secret=${this.clientSecret}` +
          `&fb_exchange_token=${integrationData.refreshToken}`
      );

      const { access_token, expires_in } = response;

      // Update tokens using server action
      const updateResult = await updateInstagramTokens(
        userId,
        internalId,
        access_token,
        access_token,
        expires_in
      );

      if (!updateResult.success) {
        throw new Error(updateResult.error);
      }

      return {
        accessToken: access_token,
        refreshToken: access_token,
      };
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }

  async post(accessToken: string, postDetails: PostDetails) {
    try {
      const { id, message, media } = postDetails;

      if (!media || media.length === 0) {
        throw new Error('No media provided');
      }

      // Upload media
      const mediaIds = await Promise.all(
        media.map(async (m) => {
          const response = await this.fetch(
            `https://graph.facebook.com/v20.0/${id}/media`,
            {
              method: 'POST',
              body: JSON.stringify({
                image_url: m.url,
                caption: message,
                access_token: accessToken,
              }),
            }
          );
          return response.id;
        })
      );

      // Publish media
      const publishResponse = await this.fetch(
        `https://graph.facebook.com/v20.0/${id}/media_publish`,
        {
          method: 'POST',
          body: JSON.stringify({
            creation_id: mediaIds[0],
            access_token: accessToken,
          }),
        }
      );

      return {
        success: true,
        postId: publishResponse.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to post',
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
} 