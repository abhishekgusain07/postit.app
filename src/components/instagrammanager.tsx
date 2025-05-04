"use client"
import React, { useState } from 'react';
import { AuthTokenDetails } from '../providers/instagram.provider';
import { InstagramConnect } from './instagramconnect';
import { InstagramPost } from './instagrampost';

interface InstagramManagerProps {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export const InstagramManager: React.FC<InstagramManagerProps> = ({
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

  const handlePostSuccess = (postId: string) => {
    // Handle successful post
    console.log('Post created successfully:', postId);
  };

  const handlePostError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="instagram-manager">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!authDetails ? (
        <InstagramConnect
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

          <InstagramPost
            accessToken={authDetails.accessToken}
            accountId={authDetails.id}
            onSuccess={handlePostSuccess}
            onError={handlePostError}
          />
        </div>
      )}

      <style jsx>{`
        .instagram-manager {
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