import { db } from '@/db/drizzle';
import { integration } from '@/db/schema';
import dayjs from 'dayjs';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface AuthTokenDetails {
  id: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  picture: string;
  error?: string;
}

export interface LinkedInPostDetails {
  id: string;
  text: string;
  media?: {
    url: string;
    type: 'image' | 'video';
    altText?: string;
  }[];
}

export class LinkedInProvider {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  // LinkedIn scopes - note: w_member_social requires "Share on LinkedIn" product approval
  private readonly scopes = [
    'openid',
    'profile', 
    'email',
    'w_member_social'  // Required for posting content
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

  // Updated generateAuthUrl method with debugging
  async generateAuthUrl() {
    // Create a random state string for CSRF protection
    const state = uuidv4();
    
    // Build the URL components separately for debugging
    const baseUrl = 'https://www.linkedin.com/oauth/v2/authorization';
    const clientIdParam = `client_id=${this.clientId}`;
    const redirectUriParam = `redirect_uri=${encodeURIComponent(this.redirectUri)}`;
    const responseTypeParam = 'response_type=code';
    const scopeParam = `scope=${encodeURIComponent(this.scopes.join(' '))}`;
    const stateParam = `state=${state}`;
    
    // Full URL with all parameters
    const url = `${baseUrl}?${clientIdParam}&${redirectUriParam}&${responseTypeParam}&${scopeParam}&${stateParam}`;
    
    // Log the URL and each parameter for debugging
    console.log('LinkedIn Auth URL Components:', {
      baseUrl,
      clientIdParam,
      redirectUriParam,
      responseTypeParam,
      scopeParam,
      stateParam
    });
    console.log('Full LinkedIn Auth URL:', url);
    
    return {
      url,
      state
    };
  }

  async authenticate(code: string, userId: string): Promise<AuthTokenDetails> {
    try {
      // Exchange code for tokens
      const tokenResponse = await this.fetch(
        'https://www.linkedin.com/oauth/v2/accessToken',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: this.redirectUri,
            client_id: this.clientId,
            client_secret: this.clientSecret
          }).toString()
        }
      );

      if (!tokenResponse.access_token) {
        throw new Error('Failed to get access token: ' + JSON.stringify(tokenResponse));
      }

      const { 
        access_token, 
        refresh_token, 
        expires_in
      } = tokenResponse;

      // Use the new OpenID Connect userinfo endpoint
      const userInfoResponse = await this.fetch(
        'https://api.linkedin.com/v2/userinfo',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        }
      );

      // Extract user data from OpenID Connect response
      const {
        sub: id,
        name,
        given_name: firstName,
        family_name: lastName,
        picture,
        email,
        email_verified
      } = userInfoResponse;

      // Use name from API, or fallback to constructed name
      const displayName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'LinkedIn User';

      // Generate a unique internal ID
      const internalId = `linkedin_${id}`;

      // Store the integration in the database
      await db.insert(integration)
        .values({
          internalId,
          userId,
          name: displayName,
          picture: picture || '',
          providerIdentifier: 'linkedin',
          type: 'social_media',
          token: access_token,
          refreshToken: refresh_token || '',
          tokenExpiration: dayjs().add(expires_in || 3600, 'seconds').toDate(),
          profile: email || '',
          postingTimes: JSON.stringify([
            { time: 480 }, // 8:00 AM
            { time: 720 }, // 12:00 PM
            { time: 1020 } // 5:00 PM
          ]),
          additionalSettings: JSON.stringify([])
        })
        .onConflictDoUpdate({
          target: integration.internalId,
          set: {
            token: access_token,
            refreshToken: refresh_token || '',
            tokenExpiration: dayjs().add(expires_in || 3600, 'seconds').toDate(),
            updatedAt: new Date(),
            disabled: false,
            deletedAt: null
          },
        });

      return {
        id,
        name: displayName,
        accessToken: access_token,
        refreshToken: refresh_token || '',
        expiresIn: expires_in || 3600,
        picture: picture || '',
      };
    } catch (error) {
      console.error('LinkedIn authentication error:', error);
      return {
        id: '',
        name: '',
        accessToken: '',
        refreshToken: '',
        expiresIn: 0,
        picture: '',
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  async refreshToken(userId: string, internalId: string): Promise<{ accessToken: string; refreshToken: string }> {
    const integrationData = await db.select().from(integration).where(and(
        eq(integration.userId, userId),
        eq(integration.internalId, internalId),
        eq(integration.providerIdentifier, 'linkedin')
      )
    );

    if (!integrationData || !integrationData[0].refreshToken) {
      throw new Error('No refresh token found');
    }

    try {
      const response = await this.fetch(
        'https://www.linkedin.com/oauth/v2/accessToken',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: integrationData[0].refreshToken,
            client_id: this.clientId,
            client_secret: this.clientSecret
          }).toString()
        }
      );

      if (!response.access_token) {
        throw new Error('Failed to refresh token: ' + JSON.stringify(response));
      }

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
        .where(eq(integration.id, integrationData[0].id));

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
        .where(eq(integration.id, integrationData[0].id));
        
      throw new Error('Failed to refresh token');
    }
  }

  async post(accessToken: string, postDetails: LinkedInPostDetails) {
    try {
      const { text, media } = postDetails;
      
      // First, get the person ID from the userinfo endpoint
      let personId: string;
      try {
        const userInfoResponse = await this.fetch(
          'https://api.linkedin.com/v2/userinfo',
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        
        personId = userInfoResponse.sub;
        if (!personId) {
          throw new Error('Failed to get person ID from LinkedIn API');
        }
      } catch (error) {
        console.error('Error fetching LinkedIn user info:', error);
        return {
          success: false,
          error: 'Failed to get user information from LinkedIn',
        };
      }
      
      // Base content for the post
      const content: any = {
        author: `urn:li:person:${personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };
      
      // If media is included, update the content accordingly
      if (media && media.length > 0) {
        const mediaItem = media[0];
        
        if (mediaItem.type === 'image') {
          // For image post, first register the image upload
          const uploadResponse = await this.fetch(
            'https://api.linkedin.com/v2/assets?action=registerUpload',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                registerUploadRequest: {
                  recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                  owner: `urn:li:person:${personId}`,
                  serviceRelationships: [{
                    relationshipType: 'OWNER',
                    identifier: 'urn:li:userGeneratedContent'
                  }]
                }
              })
            }
          );
          
          // Then update the post content to include the image
          content.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
          content.specificContent['com.linkedin.ugc.ShareContent'].media = [{
            status: 'READY',
            description: {
              text: mediaItem.altText || ''
            },
            media: uploadResponse.value.asset,
            title: {
              text: ''
            }
          }];
        } else if (mediaItem.type === 'video') {
          // For video, similar process but different endpoint and attributes
          const uploadResponse = await this.fetch(
            'https://api.linkedin.com/v2/assets?action=registerUpload',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                registerUploadRequest: {
                  recipes: ['urn:li:digitalmediaRecipe:feedshare-video'],
                  owner: `urn:li:person:${personId}`,
                  serviceRelationships: [{
                    relationshipType: 'OWNER',
                    identifier: 'urn:li:userGeneratedContent'
                  }]
                }
              })
            }
          );
          
          content.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'VIDEO';
          content.specificContent['com.linkedin.ugc.ShareContent'].media = [{
            status: 'READY',
            description: {
              text: mediaItem.altText || ''
            },
            media: uploadResponse.value.asset,
            title: {
              text: ''
            }
          }];
        }
      }
      
      // Create the post
      const postResponse = await this.fetch(
        'https://api.linkedin.com/v2/ugcPosts',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(content)
        }
      );
      
      return {
        success: true,
        postId: postResponse.id,
        releaseURL: `https://www.linkedin.com/feed/update/${postResponse.id}`
      };
    } catch (error) {
      console.error('Error posting to LinkedIn:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to post to LinkedIn',
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