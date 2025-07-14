import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { YouTubeProvider } from '@/providers/youtube.provider';
import { checkYouTubeIntegration } from '@/actions/youtube';
import { unlink } from 'fs/promises';

export async function POST(request: NextRequest) {
  console.log('YouTube upload API called');
  
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body with error handling
    let body;
    try {
      const rawBody = await request.text();
      console.log('Raw request body:', rawBody);
      
      if (!rawBody.trim()) {
        return NextResponse.json({ error: 'Request body is empty' }, { status: 400 });
      }
      
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { filePath, title, description, privacyStatus, categoryId, tags } = body;

    if (!filePath || !title) {
      return NextResponse.json({ error: 'File path and title are required' }, { status: 400 });
    }

    // Check YouTube integration
    let integrationResult;
    try {
      integrationResult = await checkYouTubeIntegration();
    } catch (integrationError) {
      console.error('Error checking YouTube integration:', integrationError);
      return NextResponse.json({ error: 'Failed to check YouTube integration' }, { status: 500 });
    }
    
    if (!integrationResult.success || !integrationResult.isConnected) {
      return NextResponse.json({ error: 'YouTube integration not found or not connected' }, { status: 404 });
    }

    // Get the integration data with token
    const integration = integrationResult.integration;
    
    if (!integration || !integration.token) {
      return NextResponse.json({ error: 'YouTube access token not found' }, { status: 404 });
    }

    // Initialize YouTube provider
    const youtubeProvider = new YouTubeProvider(
      process.env.YOUTUBE_CLIENT_ID || '',
      process.env.YOUTUBE_CLIENT_SECRET || '',
      `${process.env.FRONTEND_URL}/api/integrations/youtube/callback`
    );

    // Upload video to YouTube
    const uploadResult = await youtubeProvider.uploadVideoFromFile(integration.token, {
      filePath,
      title,
      description: description || '',
      privacyStatus: privacyStatus || 'private',
      categoryId: categoryId || '22',
      tags: tags || [],
    });

    // Clean up uploaded file
    try {
      await unlink(filePath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temporary file:', cleanupError);
    }

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      videoId: uploadResult.videoId,
      url: uploadResult.url,
    });

  } catch (error) {
    console.error('YouTube upload error:', error);
    return NextResponse.json({ error: 'Failed to upload video to YouTube' }, { status: 500 });
  }
}