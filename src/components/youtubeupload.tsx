"use client"
import React, { useState } from 'react';
import { YouTubeProvider, VideoDetails } from '../providers/youtube.provider';

interface YouTubeUploadProps {
  accessToken: string;
  channelId: string;
  onSuccess: (videoId: string, videoUrl: string) => void;
  onError: (error: string) => void;
}

export const YouTubeUpload: React.FC<YouTubeUploadProps> = ({
  accessToken,
  channelId,
  onSuccess,
  onError,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState<'public' | 'private' | 'unlisted'>('private');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const youtubeProvider = new YouTubeProvider('', '', ''); // Empty credentials as we already have access token

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const videoDetails: VideoDetails = {
        id: channelId,
        title,
        description,
        videoUrl,
        privacyStatus,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      const result = await youtubeProvider.uploadVideo(accessToken, videoDetails);
      
      if (result.success) {
        onSuccess(result.videoId, result.url!);
        setTitle('');
        setDescription('');
        setVideoUrl('');
        setTags('');
      } else {
        onError(result.error || 'Failed to upload video');
      }
    } catch (error) {
      onError('Failed to upload video');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="youtube-upload">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Video Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter video description"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="videoUrl">Video URL</label>
          <input
            type="url"
            id="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="privacyStatus">Privacy Status</label>
          <select
            id="privacyStatus"
            value={privacyStatus}
            onChange={(e) => setPrivacyStatus(e.target.value as 'public' | 'private' | 'unlisted')}
          >
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
            <option value="public">Public</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <button type="submit" disabled={isLoading} className="upload-button">
          {isLoading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>

      <style jsx>{`
        .youtube-upload {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
        }

        input,
        textarea,
        select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }

        textarea {
          min-height: 100px;
          resize: vertical;
        }

        .upload-button {
          background: #FF0000;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.3s;
          width: 100%;
        }

        .upload-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .upload-button:hover:not(:disabled) {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}; 