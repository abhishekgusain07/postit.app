import { makeId } from '../utils/makeId';
import dayjs from 'dayjs';
import { integration } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db/drizzle';
import { storeYouTubeIntegration, updateYouTubeTokens, getYouTubeIntegration } from '../actions/youtube';

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

export interface VideoDetails {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  privacyStatus?: 'public' | 'private' | 'unlisted';
  categoryId?: string;
  tags?: string[];
}

export interface VideoUploadDetails {
  filePath: string;
  title: string;
  description: string;
  privacyStatus: 'public' | 'private' | 'unlisted';
  categoryId: string;
  tags: string[];
}

export class YouTubeProvider {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes = [
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
  ];

  constructor(
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ) {
    if (!clientId || !clientSecret) {
      throw new Error('YouTube OAuth credentials are required. Please check YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET environment variables.');
    }
    
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  async generateAuthUrl() {
    const state = makeId(12);
    return {
      url:
        'https://accounts.google.com/o/oauth2/v2/auth' +
        `?client_id=${this.clientId}` +
        `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(this.scopes.join(' '))}` +
        `&state=${state}` +
        '&access_type=offline' +
        '&prompt=consent',
      state,
    };
  }

  async authenticate(code: string, userId: string): Promise<AuthTokenDetails> {
    try {
      console.log('Starting authentication with code and userId:', userId);
      console.log('Using redirect URI:', this.redirectUri);
      
      // Exchange authorization code for tokens
      const tokenResponse = await this.exchangeCodeForTokens(code);
      console.log('Token exchange successful');
      
      const { access_token, refresh_token, expires_in } = tokenResponse;
      
      if (!access_token) {
        throw new Error('Access token not received');
      }

      // Get channel information
      console.log('Fetching channel information with access token');
      const channelResponse = await this.fetchWithRetry(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (!channelResponse.items || channelResponse.items.length === 0) {
        throw new Error('No YouTube channel found for this account');
      }

      const channel = channelResponse.items[0];
      const { id, snippet } = channel;

      // Store the integration using server action
      console.log('Storing YouTube integration for channel:', id);
      const storeResult = await storeYouTubeIntegration(
        userId,
        id,
        snippet.title,
        snippet.thumbnails?.default?.url || '',
        access_token,
        refresh_token || '',
        expires_in,
        snippet.customUrl || ''
      );

      if (!storeResult.success) {
        throw new Error(storeResult.error);
      }

      return {
        id: id,
        name: snippet.title,
        accessToken: access_token,
        refreshToken: refresh_token || '',
        expiresIn: expires_in,
        picture: snippet.thumbnails?.default?.url || '',
        username: snippet.customUrl || '',
      };
    } catch (error) {
      console.error('YouTube authentication error:', error);
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

  private async exchangeCodeForTokens(code: string) {
    console.log('Exchanging code for tokens');
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
    });
    
    console.log('Token exchange parameters:', {
      client_id_length: this.clientId.length,
      client_secret_length: this.clientSecret.length,
      code_length: code.length,
      redirect_uri: this.redirectUri,
      client_id_present: !!this.clientId,
      client_secret_present: !!this.clientSecret,
    });
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange error:', response.status, errorText);
      throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  }

  async refreshToken(userId: string, internalId: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const { success, data: integrationData } = await getYouTubeIntegration(userId, internalId);

      if (!success || !integrationData || !integrationData.refreshToken) {
        throw new Error('No refresh token found');
      }

      const params = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: integrationData.refreshToken,
        grant_type: 'refresh_token',
      });

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const { access_token, refresh_token, expires_in } = data;

      // Update tokens using server action
      const updateResult = await updateYouTubeTokens(
        userId,
        internalId,
        access_token,
        refresh_token || integrationData.refreshToken,
        expires_in
      );

      if (!updateResult.success) {
        throw new Error(updateResult.error);
      }

      return {
        accessToken: access_token,
        refreshToken: refresh_token || integrationData.refreshToken,
      };
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }

  private async fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<any> {
    let lastError;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.warn(`Fetch attempt ${attempt + 1} failed:`, error);
        lastError = error;
        
        // Only wait and retry if we have attempts left
        if (attempt < retries - 1) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }
    }
    
    throw lastError;
  }

  async uploadVideo(accessToken: string, videoDetails: VideoDetails) {
    try {
      // First, upload the video file
      const uploadResponse = await this.fetchWithRetry(
        'https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/octet-stream',
          },
          body: await this.getVideoFile(videoDetails.videoUrl),
        }
      );

      // Then, update the video details
      const updateResponse = await this.fetchWithRetry(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,status`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: uploadResponse.id,
            snippet: {
              title: videoDetails.title,
              description: videoDetails.description,
              categoryId: videoDetails.categoryId || '22', // Default to "People & Blogs"
              tags: videoDetails.tags || [],
            },
            status: {
              privacyStatus: videoDetails.privacyStatus || 'private',
            },
          }),
        }
      );

      return {
        success: true,
        videoId: updateResponse.id,
        url: `https://www.youtube.com/watch?v=${updateResponse.id}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload video',
      };
    }
  }

  private async getVideoFile(videoUrl: string): Promise<Blob> {
    const response = await fetch(videoUrl);
    return await response.blob();
  }

  async uploadVideoFromFile(accessToken: string, videoDetails: VideoUploadDetails) {
    try {
      // Read the file from disk (only in server environment)
      const fs = await import('fs');
      const fileBuffer = fs.readFileSync(videoDetails.filePath);
      
      // Create the multipart form data
      const boundary = '----formdata-' + Math.random().toString(36).substr(2, 16);
      
      // Create the metadata part
      const metadata = {
        snippet: {
          title: videoDetails.title,
          description: videoDetails.description,
          categoryId: videoDetails.categoryId,
          tags: videoDetails.tags,
        },
        status: {
          privacyStatus: videoDetails.privacyStatus,
        },
      };

      // Create the multipart body
      const metadataBody = `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\n` +
        `Content-Type: application/octet-stream\r\n\r\n`;

      const endBoundary = `\r\n--${boundary}--\r\n`;

      // Combine all parts
      const metadataBuffer = Buffer.from(metadataBody);
      const endBuffer = Buffer.from(endBoundary);
      const fullBody = Buffer.concat([metadataBuffer, fileBuffer, endBuffer]);

      // Upload to YouTube
      const uploadResponse = await fetch(
        'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
            'Content-Length': fullBody.length.toString(),
          },
          body: fullBody,
        }
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('YouTube upload error:', uploadResponse.status, errorText);
        throw new Error(`YouTube upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      const result = await uploadResponse.json();

      return {
        success: true,
        videoId: result.id,
        url: `https://www.youtube.com/watch?v=${result.id}`,
      };
    } catch (error) {
      console.error('YouTube file upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload video',
      };
    }
  }
}