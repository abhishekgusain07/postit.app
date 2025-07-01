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
  // Instagram API with Facebook Login scopes (more stable and proven)
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
      // Step 1: Exchange authorization code for short-lived access token
      const getAccessToken = await this.fetch(
        'https://graph.facebook.com/v20.0/oauth/access_token' +
          `?client_id=${this.clientId}` +
          `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
          `&client_secret=${this.clientSecret}` +
          `&code=${code}`
      );

      // Step 2: Exchange short-lived token for long-lived token
      const { access_token, expires_in } = await this.fetch(
        'https://graph.facebook.com/v20.0/oauth/access_token' +
          '?grant_type=fb_exchange_token' +
          `&client_id=${this.clientId}` +
          `&client_secret=${this.clientSecret}` +
          `&fb_exchange_token=${getAccessToken.access_token}`
      );

      // Step 3: Verify permissions
      const { data: permissions } = await this.fetch(
        `https://graph.facebook.com/v20.0/me/permissions?access_token=${access_token}`
      );

      const grantedPermissions = permissions
        .filter((d: any) => d.status === 'granted')
        .map((p: any) => p.permission);
      
      this.checkScopes(this.scopes, grantedPermissions);

      // Step 4: Get user information
      const userInfo = await this.fetch(
        `https://graph.facebook.com/v20.0/me?fields=id,name,picture&access_token=${access_token}`
      );

      // Step 5: Get Instagram business accounts
      const pages = await this.getPages(access_token);
      
      if (!pages.length) {
        throw new Error('No Instagram Business accounts found. Please connect an Instagram Business account to your Facebook Page.');
      }

      // For now, use the first Instagram account found
      const instagramAccount = pages[0];
      const accountInfo = await this.fetchPageInformation(access_token, {
        pageId: instagramAccount.pageId,
        id: instagramAccount.id
      });

      // Store the integration using server action
      const storeResult = await storeInstagramIntegration(
        userId,
        accountInfo.id,
        accountInfo.name,
        accountInfo.picture || '',
        accountInfo.access_token,
        accountInfo.access_token,
        59 * 24 * 60 * 60, // 59 days in seconds
        accountInfo.username || ''
      );

      if (!storeResult.success) {
        throw new Error(storeResult.error);
      }

      return {
        id: accountInfo.id,
        name: accountInfo.name,
        accessToken: accountInfo.access_token,
        refreshToken: accountInfo.access_token,
        expiresIn: 59 * 24 * 60 * 60,
        picture: accountInfo.picture || '',
        username: accountInfo.username || '',
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

  private checkScopes(requiredScopes: string[], grantedPermissions: string[]) {
    const missingScopes = requiredScopes.filter(scope => !grantedPermissions.includes(scope));
    if (missingScopes.length > 0) {
      throw new Error(`Missing required permissions: ${missingScopes.join(', ')}`);
    }
  }

  async getPages(accessToken: string) {
    const { data } = await this.fetch(
      `https://graph.facebook.com/v20.0/me/accounts?fields=id,instagram_business_account,username,name,picture.type(large)&access_token=${accessToken}&limit=500`
    );

    const onlyConnectedAccounts = await Promise.all(
      data
        .filter((f: any) => f.instagram_business_account)
        .map(async (p: any) => {
          const instagramInfo = await this.fetch(
            `https://graph.facebook.com/v20.0/${p.instagram_business_account.id}?fields=name,profile_picture_url&access_token=${accessToken}&limit=500`
          );
          return {
            pageId: p.id,
            id: p.instagram_business_account.id,
            name: instagramInfo.name,
            picture: { data: { url: instagramInfo.profile_picture_url } },
          };
        })
    );

    return onlyConnectedAccounts;
  }

  async fetchPageInformation(accessToken: string, data: { pageId: string; id: string }) {
    const { access_token } = await this.fetch(
      `https://graph.facebook.com/v20.0/${data.pageId}?fields=access_token,name,picture.type(large)&access_token=${accessToken}`
    );

    const { id, name, profile_picture_url, username } = await this.fetch(
      `https://graph.facebook.com/v20.0/${data.id}?fields=username,name,profile_picture_url&access_token=${accessToken}`
    );

    return {
      id,
      name,
      picture: profile_picture_url,
      access_token,
      username,
    };
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

      // Upload media using Facebook Graph API (more stable for Instagram)
      const mediaIds = await Promise.all(
        media.map(async (m) => {
          const caption = media.length === 1 ? `&caption=${encodeURIComponent(message)}` : '';
          const isCarousel = media.length > 1 ? '&is_carousel_item=true' : '';
          const mediaType = m.url.includes('.mp4') 
            ? media.length === 1 
              ? `video_url=${m.url}&media_type=REELS`
              : `video_url=${m.url}&media_type=VIDEO`
            : `image_url=${m.url}`;

          const { id: photoId } = await this.fetch(
            `https://graph.facebook.com/v20.0/${id}/media?${mediaType}${isCarousel}&access_token=${accessToken}${caption}`,
            {
              method: 'POST',
            }
          );

          // Wait for media processing
          let status = 'IN_PROGRESS';
          while (status === 'IN_PROGRESS') {
            const { status_code } = await this.fetch(
              `https://graph.facebook.com/v20.0/${photoId}?access_token=${accessToken}&fields=status_code`
            );
            await new Promise(resolve => setTimeout(resolve, 3000));
            status = status_code;
          }

          return photoId;
        })
      );

      let publishResponse;
      if (media.length === 1) {
        // Single media post
        publishResponse = await this.fetch(
          `https://graph.facebook.com/v20.0/${id}/media_publish?creation_id=${mediaIds[0]}&access_token=${accessToken}&field=id`,
          {
            method: 'POST',
          }
        );
      } else {
        // Carousel post
        const { id: containerId } = await this.fetch(
          `https://graph.facebook.com/v20.0/${id}/media?caption=${encodeURIComponent(message)}&media_type=CAROUSEL&children=${encodeURIComponent(mediaIds.join(','))}&access_token=${accessToken}`,
          {
            method: 'POST',
          }
        );

        // Wait for carousel processing
        let status = 'IN_PROGRESS';
        while (status === 'IN_PROGRESS') {
          const { status_code } = await this.fetch(
            `https://graph.facebook.com/v20.0/${containerId}?fields=status_code&access_token=${accessToken}`
          );
          await new Promise(resolve => setTimeout(resolve, 3000));
          status = status_code;
        }

        publishResponse = await this.fetch(
          `https://graph.facebook.com/v20.0/${id}/media_publish?creation_id=${containerId}&access_token=${accessToken}&field=id`,
          {
            method: 'POST',
          }
        );
      }

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