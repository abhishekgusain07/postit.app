"use client"
import React, { useState } from 'react';
import { InstagramProvider, PostDetails } from '../providers/instagram.provider';

interface InstagramPostProps {
  accessToken: string;
  accountId: string;
  onSuccess: (postId: string) => void;
  onError: (error: string) => void;
}

export const InstagramPost: React.FC<InstagramPostProps> = ({
  accessToken,
  accountId,
  onSuccess,
  onError,
}) => {
  const [message, setMessage] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const instagramProvider = new InstagramProvider('', '', ''); // Empty credentials as we already have access token

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const postDetails: PostDetails = {
        id: accountId,
        message,
        media: [
          {
            url: mediaUrl,
            type: 'image',
          },
        ],
      };

      const result = await instagramProvider.post(accessToken, postDetails);
      
      if (result.success) {
        onSuccess(result.postId);
        setMessage('');
        setMediaUrl('');
      } else {
        onError(result.error || 'Failed to post to Instagram');
      }
    } catch (error) {
      onError('Failed to post to Instagram');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="instagram-post">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="message">Caption</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your caption here..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="mediaUrl">Image URL</label>
          <input
            type="url"
            id="mediaUrl"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            required
          />
        </div>

        <button type="submit" disabled={isLoading} className="post-button">
          {isLoading ? 'Posting...' : 'Post to Instagram'}
        </button>
      </form>

      <style jsx>{`
        .instagram-post {
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

        textarea,
        input {
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

        .post-button {
          background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D);
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

        .post-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .post-button:hover:not(:disabled) {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}; 