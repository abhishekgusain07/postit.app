"use client"
import React, { useState, useEffect } from 'react';
import { YouTubeProvider, AuthTokenDetails } from '../providers/youtube.provider';
import { authClient } from '@/lib/auth-client';
// @ts-ignore
import Cookies from 'js-cookie';
import Image from 'next/image';

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
  
  // Check for callback parameters early
  const isCallback = typeof window !== 'undefined' && 
    window.location.search.includes('code=') && 
    window.location.search.includes('state=');
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Log the redirect URI to make sure it's correct
        console.log('Using redirect URI:', redirectUri);
        
        const { data: session, error } = await authClient.getSession();
        if (error) {
          console.error('Session error:', error);
          onError('Failed to get session');
          return;
        }
        
        setUserId(session.user.id);
        
        // Only generate auth URL if we're not handling a callback
        if (!isCallback) {
          const { url, state } = await youtubeProvider.generateAuthUrl();
          console.log('Generated OAuth state:', state);
          
          // Ensure secure cookie settings
          Cookies.set('google_oauth_state', state, { 
            expires: 1, // 1 day expiration
            path: '/', 
            sameSite: 'lax',
            secure: window.location.protocol === 'https:' 
          });
          
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
    <div className="youtube-connect-outer">
      <div className="youtube-connect-card">
        <div className="youtube-logo-row">
          <Image src="/youtube.svg" alt="YouTube Logo" width={48} height={48} className="youtube-logo-large" />
        </div>
        <h2 className="youtube-title">Connect your YouTube Account</h2>
        <p className="youtube-desc">Easily connect your YouTube channel to enable seamless video uploads and management.</p>
        <button
          onClick={handleConnect}
          disabled={isLoading || !authUrl}
          className="connect-button"
        >
          {isLoading ? (
            <span className="loader"></span>
          ) : (
            <Image src="/youtube.svg" alt="YouTube Logo" width={22} height={22} className="button-logo" />
          )}
          <span>{isLoading ? 'Connecting...' : 'Connect with YouTube'}</span>
        </button>
      </div>
      <style jsx>{`
        .youtube-connect-outer {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #fff 60%, #ffeaea 100%);
        }
        .youtube-connect-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 6px 32px rgba(255,0,0,0.08), 0 1.5px 6px rgba(0,0,0,0.04);
          padding: 40px 32px 32px 32px;
          max-width: 370px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: box-shadow 0.2s;
        }
        .youtube-logo-row {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }
        .youtube-logo-large {
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(255,0,0,0.07);
        }
        .youtube-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: #222;
          margin: 0 0 8px 0;
          text-align: center;
          letter-spacing: -0.5px;
        }
        .youtube-desc {
          color: #666;
          font-size: 1.02rem;
          margin-bottom: 28px;
          text-align: center;
          line-height: 1.5;
        }
        .connect-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(90deg, #ff0000 60%, #ff4d4d 100%);
          color: #fff;
          border: none;
          padding: 14px 0;
          border-radius: 8px;
          font-size: 1.08rem;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          box-shadow: 0 2px 12px rgba(255,0,0,0.10);
          margin-top: 10px;
          transition: background 0.2s, box-shadow 0.2s, opacity 0.2s;
          position: relative;
          min-height: 48px;
        }
        .connect-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .connect-button:hover:not(:disabled) {
          background: linear-gradient(90deg, #e60000 60%, #ff3333 100%);
          box-shadow: 0 4px 18px rgba(255,0,0,0.13);
        }
        .button-logo {
          margin-right: 2px;
        }
        .loader {
          border: 3px solid #fff;
          border-top: 3px solid #ff0000;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          margin-right: 8px;
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};