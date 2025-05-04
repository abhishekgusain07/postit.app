"use client"
import React, { useState, useEffect } from 'react';
import { YouTubeProvider, AuthTokenDetails } from '../providers/youtube.provider';
import { authClient } from '@/lib/auth-client';
// @ts-ignore
import Cookies from 'js-cookie';
import Image from 'next/image';
import { isYouTubeConnected } from '../actions/youtube';
import { FaPlus, FaCheckCircle } from 'react-icons/fa';

interface YouTubeConnectProps {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  onSuccess: (authDetails: AuthTokenDetails) => void;
  onError: (error: string) => void;
}

export const YouTubeConnect: React.FC<YouTubeConnectProps> = ({
  clientId,
  clientSecret,
  redirectUri,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  // Initialize with the same redirect URI that's registered with Google
  const youtubeProvider = new YouTubeProvider(clientId, clientSecret, redirectUri);
  const [userId, setUserId] = useState<string | null>(null);
  const [connectedInfo, setConnectedInfo] = useState<{ connected: boolean; channelId?: string; channelName?: string } | null>(null);
  
  // Check for callback parameters early
  const isCallback = typeof window !== 'undefined' && 
    window.location.search.includes('code=') && 
    window.location.search.includes('state=');
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: session, error } = await authClient.getSession();
        if (error) {
          console.error('Session error:', error);
          onError('Failed to get session');
          return;
        }
        setUserId(session.user.id);
        // Check if already connected
        const connected = await isYouTubeConnected(session.user.id);
        setConnectedInfo(connected);
        if (!connected.connected) {
          const { url, state } = await youtubeProvider.generateAuthUrl();
          console.log('Generated OAuth state:', state);
          Cookies.set('google_oauth_state', state, { path: '/', sameSite: 'lax', secure: true });
          setAuthUrl(url);
        }
      } catch (error) {
        console.error('Error initializing YouTube connection:', error);
        onError('Failed to initialize YouTube connection');
      }
    };
    
    initializeAuth();
  }, []);

  const handleConnect = () => {
    if (authUrl) {
      // Double-check that the cookie is set before redirecting
      const stateCheck = Cookies.get('google_oauth_state');
      if (!stateCheck) {
        console.error('State cookie not set before redirect');
        onError('Cookie setup failed. Please try again or enable cookies in your browser.');
        return;
      }
      
      console.log('Redirecting to OAuth URL:', authUrl);
      window.location.href = authUrl;
    }
  };
  
  useEffect(() => {
    // Only handle callback when appropriate
    if (!isCallback) return;
    
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const returnedState = urlParams.get('state');
      const storedState = Cookies.get('google_oauth_state');
    
      console.log('OAuth callback params:', { code, error, returnedState });
      console.log('Stored state from cookie:', storedState);
    
      // Check if state is missing
      if (!storedState) {
        console.error('No state found in cookies');
        onError('Authentication state not found. Please try again or check your cookies settings.');
        return;
      }
      
      // State verification
      if (returnedState !== storedState) {
        console.error('State mismatch:', { returnedState, storedState });
        onError('Security verification failed. Please try again.');
        Cookies.remove('google_oauth_state');
        return;
      }
      
      // Remove the state cookie after verification
      Cookies.remove('google_oauth_state');
    
      if (error) {
        console.error('OAuth error param:', error);
        onError(`YouTube connection failed: ${error}`);
        return;
      }
    
      if (code) {
        setIsLoading(true);
        try {
          // Ensure we have userId
          if (!userId) {
            const { data: session } = await authClient.getSession();
            if (session) {
              setUserId(session.user.id);
            } else {
              throw new Error('User session not available');
            }
          }
          
          console.log('Attempting to authenticate with code and userId:', userId);
          const authDetails = await youtubeProvider.authenticate(code, userId!);
          if (authDetails.error) {
            console.error('Auth details error:', authDetails.error);
            onError(authDetails.error);
          } else {
            console.log('Auth success:', authDetails);
            onSuccess(authDetails);
          }
        } catch (error) {
          console.error('Failed to authenticate with YouTube:', error);
          onError('Failed to authenticate with YouTube');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    handleCallback();
  }, [userId, isCallback]);

  return (
    <div className="youtube-connect-row">
      <div className="youtube-connect-info">
        <Image src="/youtube.svg" alt="YouTube Logo" width={44} height={44} className="youtube-logo" />
        <div className="youtube-connect-texts">
          <div className="youtube-connect-title">Connect YouTube account</div>
          <div className="youtube-connect-subtitle">Estimated 30 seconds</div>
        </div>
      </div>
      {connectedInfo && connectedInfo.connected ? (
        <div className="youtube-connected-status">
          <FaCheckCircle color="#22c55e" size={22} style={{ marginRight: 6 }} />
          <span className="connected-label">Connected as <b>{connectedInfo.channelName || 'YouTube Channel'}</b></span>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isLoading || !authUrl}
          className="youtube-connect-btn"
        >
          <FaPlus style={{ marginRight: 8 }} />
          Connect YouTube
        </button>
      )}
      <style jsx>{`
        .youtube-connect-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 1px 4px rgba(16,30,54,0.06);
          padding: 20px 28px;
          max-width: 540px;
          margin: 40px auto;
          gap: 18px;
        }
        .youtube-connect-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .youtube-logo {
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 1px 4px rgba(255,0,0,0.07);
        }
        .youtube-connect-texts {
          display: flex;
          flex-direction: column;
        }
        .youtube-connect-title {
          font-size: 1.18rem;
          font-weight: 700;
          color: #18181b;
        }
        .youtube-connect-subtitle {
          color: #6b7280;
          font-size: 0.98rem;
          margin-top: 2px;
        }
        .youtube-connect-btn {
          display: flex;
          align-items: center;
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 12px 22px;
          border-radius: 999px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.18s;
          box-shadow: 0 1px 4px rgba(37,99,235,0.08);
        }
        .youtube-connect-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .youtube-connect-btn:hover:not(:disabled) {
          background: #1d4ed8;
        }
        .youtube-connected-status {
          display: flex;
          align-items: center;
          background: #f1fdf7;
          color: #15803d;
          border-radius: 999px;
          padding: 10px 18px;
          font-size: 1.05rem;
          font-weight: 600;
        }
        .connected-label b {
          color: #ff0000;
          font-weight: 700;
          margin-left: 4px;
        }
      `}</style>
    </div>
  );
};