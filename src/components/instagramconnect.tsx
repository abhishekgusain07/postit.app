"use client"
import React, { useState, useEffect } from 'react';
import { InstagramProvider, AuthTokenDetails } from '../providers/instagram.provider';
import { authClient } from '@/lib/auth-client';

interface InstagramConnectProps {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  onSuccess: (authDetails: AuthTokenDetails) => void;
  onError: (error: string) => void;
}

export const InstagramConnect: React.FC<InstagramConnectProps> = ({
  clientId,
  clientSecret,
  redirectUri,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const instagramProvider = new InstagramProvider(clientId, clientSecret, redirectUri);
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: session, error } = await authClient.getSession()
        if (error) {
          onError('Failed to get session');
          return;
        }
        setUserId(session.user.id);
        const { url } = await instagramProvider.generateAuthUrl();
        setAuthUrl(url);
      } catch (error) {
        onError('Failed to initialize Instagram connection');
      }
    };

    initializeAuth();
  }, []);

  const handleConnect = () => {
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  // Handle the OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        onError(`Instagram connection failed: ${error}`);
        return;
      }

      if (code) {
        setIsLoading(true);
        try {
          const authDetails = await instagramProvider.authenticate(code, userId!);
          if (authDetails.error) {
            onError(authDetails.error);
          } else {
            onSuccess(authDetails);
          }
        } catch (error) {
          onError('Failed to authenticate with Instagram');
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="instagram-connect">
      <button
        onClick={handleConnect}
        disabled={isLoading || !authUrl}
        className="connect-button"
      >
        {isLoading ? 'Connecting...' : 'Connect Instagram Account'}
      </button>
      
      <style jsx>{`
        .instagram-connect {
          display: flex;
          justify-content: center;
          padding: 20px;
        }
        
        .connect-button {
          background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.3s;
        }
        
        .connect-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .connect-button:hover:not(:disabled) {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}; 