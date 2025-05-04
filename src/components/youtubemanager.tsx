"use client"
import React, { useState } from 'react';
import { YouTubeConnect } from './youtubeconnect';
import { YouTubeUpload } from './youtubeupload';
import { AuthTokenDetails } from '../providers/youtube.provider';

interface YouTubeManagerProps {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export const YouTubeManager: React.FC<YouTubeManagerProps> = ({
  clientId,
  clientSecret,
  redirectUri,
}) => {
  const [authDetails, setAuthDetails] = useState<AuthTokenDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnectSuccess = (details: AuthTokenDetails) => {
    setAuthDetails(details);
    setError(null);
  };

  const handleConnectError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleUploadSuccess = (videoId: string, videoUrl: string) => {
    // Handle successful upload
    console.log('Video uploaded successfully:', videoId, videoUrl);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="youtube-manager">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!authDetails ? (
        <YouTubeConnect
          clientId={clientId}
          clientSecret={clientSecret}
          redirectUri={redirectUri}
          onSuccess={handleConnectSuccess}
          onError={handleConnectError}
        />
      ) : (
        <div className="connected-account">
          <div className="account-info">
            <img src={authDetails.picture} alt={authDetails.name} className="profile-picture" />
            <div className="account-details">
              <h3>{authDetails.name}</h3>
              <p>@{authDetails.username}</p>
            </div>
          </div>

          <YouTubeUpload
            accessToken={authDetails.accessToken}
            channelId={authDetails.id}
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
          />
        </div>
      )}

      <style jsx>{`
        .youtube-manager {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .connected-account {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 20px;
        }

        .account-info {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }

        .profile-picture {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          margin-right: 16px;
        }

        .account-details h3 {
          margin: 0;
          font-size: 18px;
        }

        .account-details p {
          margin: 4px 0 0;
          color: #666;
        }
      `}</style>
    </div>
  );
}; 