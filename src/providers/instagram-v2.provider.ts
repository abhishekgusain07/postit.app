import { makeId } from '../utils/makeId';
import dayjs from 'dayjs';
import { storeInstagramV2Integration, updateInstagramV2Tokens, getInstagramV2Integration } from '../actions/instagram-v2';

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

export class InstagramV2Provider {
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
      codeVerifier: makeId(10),
      state,
    };
  }

  async authenticate(params: {
    code: string;
    codeVerifier: string;
    refresh?: string;
  }): Promise<AuthTokenDetails> {
    try {
      // Step 1: Exchange authorization code for short-lived access token
      const getAccessToken = await (
        await this.fetch(
          'https://graph.facebook.com/v20.0/oauth/access_token' +
            `?client_id=${this.clientId}` +
            `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
            `&client_secret=${this.clientSecret}` +
            `&code=${params.code}`
        )
      ).json();

      // Step 2: Exchange short-lived token for long-lived token
      const { access_token, expires_in } = await (
        await this.fetch(
          'https://graph.facebook.com/v20.0/oauth/access_token' +
            '?grant_type=fb_exchange_token' +
            `&client_id=${this.clientId}` +
            `&client_secret=${this.clientSecret}` +
            `&fb_exchange_token=${getAccessToken.access_token}`
        )
      ).json();

      // Step 3: Verify permissions
      const { data } = await (
        await this.fetch(
          `https://graph.facebook.com/v20.0/me/permissions?access_token=${access_token}`
        )
      ).json();

      const permissions = data
        .filter((d: any) => d.status === 'granted')
        .map((p: any) => p.permission);
      
      this.checkScopes(this.scopes, permissions);

      // Step 4: Get user information
      const {
        id,
        name,
        picture: {
          data: { url },
        },
      } = await (
        await this.fetch(
          `https://graph.facebook.com/v20.0/me?fields=id,name,picture&access_token=${access_token}`
        )
      ).json();

      return {
        id,
        name,
        accessToken: access_token,
        refreshToken: access_token,
        expiresIn: dayjs().add(59, 'days').unix() - dayjs().unix(),
        picture: url,
        username: '',
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

  async reConnect(
    id: string,
    requiredId: string,
    accessToken: string
  ): Promise<AuthTokenDetails> {
    const findPage = (await this.pages(accessToken)).find(
      (p) => p.id === requiredId
    );

    const information = await this.fetchPageInformation(accessToken, {
      id: requiredId,
      pageId: findPage?.pageId!,
    });

    return {
      id: information.id,
      name: information.name,
      accessToken: information.access_token,
      refreshToken: information.access_token,
      expiresIn: dayjs().add(59, 'days').unix() - dayjs().unix(),
      picture: information.picture,
      username: information.username,
    };
  }

  async pages(accessToken: string) {
    const { data } = await (
      await this.fetch(
        `https://graph.facebook.com/v20.0/me/accounts?fields=id,instagram_business_account,username,name,picture.type(large)&access_token=${accessToken}&limit=500`
      )
    ).json();

    const onlyConnectedAccounts = await Promise.all(
      data
        .filter((f: any) => f.instagram_business_account)
        .map(async (p: any) => {
          return {
            pageId: p.id,
            ...(await (
              await this.fetch(
                `https://graph.facebook.com/v20.0/${p.instagram_business_account.id}?fields=name,profile_picture_url&access_token=${accessToken}&limit=500`
              )
            ).json()),
            id: p.instagram_business_account.id,
          };
        })
    );

    return onlyConnectedAccounts.map((p: any) => ({
      pageId: p.pageId,
      id: p.id,
      name: p.name,
      picture: { data: { url: p.profile_picture_url } },
    }));
  }

  async fetchPageInformation(
    accessToken: string,
    data: { pageId: string; id: string }
  ) {
    const { access_token } = await (
      await this.fetch(
        `https://graph.facebook.com/v20.0/${data.pageId}?fields=access_token,name,picture.type(large)&access_token=${accessToken}`
      )
    ).json();

    const { id, name, profile_picture_url, username } = await (
      await this.fetch(
        `https://graph.facebook.com/v20.0/${data.id}?fields=username,name,profile_picture_url&access_token=${accessToken}`
      )
    ).json();

    return {
      id,
      name,
      picture: profile_picture_url,
      access_token,
      username,
    };
  }

  async connectInstagramAccount(
    userId: string,
    accessToken: string,
    accountId: string
  ) {
    try {
      const pages = await this.pages(accessToken);
      const selectedPage = pages.find(p => p.id === accountId);
      
      if (!selectedPage) {
        throw new Error('Instagram account not found');
      }

      const accountInfo = await this.fetchPageInformation(accessToken, {
        pageId: selectedPage.pageId,
        id: selectedPage.id
      });

      // Store the integration using server action
      const storeResult = await storeInstagramV2Integration(
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
        success: true,
        account: {
          id: accountInfo.id,
          name: accountInfo.name,
          picture: accountInfo.picture,
          username: accountInfo.username,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect Instagram account',
      };
    }
  }

  private checkScopes(requiredScopes: string[], grantedPermissions: string[]) {
    const missingScopes = requiredScopes.filter(scope => !grantedPermissions.includes(scope));
    if (missingScopes.length > 0) {
      throw new Error(`Missing required permissions: ${missingScopes.join(', ')}`);
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

    return response;
  }
} 