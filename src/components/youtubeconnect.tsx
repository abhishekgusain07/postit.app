"use client"
import React, { useState, useEffect } from 'react';
import { YouTubeProvider, AuthTokenDetails } from '../providers/youtube.provider';
import { authClient } from '@/lib/auth-client';
// @ts-ignore
import Cookies from 'js-cookie';

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
    <div className="youtube-connect">
      <button
        onClick={handleConnect}
        disabled={isLoading || !authUrl || isCallback}
        className="connect-button"
      >
        {isLoading ? 'Connecting...' : 'Connect YouTube Account'}
      </button>
      
      <style jsx>{`
        .youtube-connect {
          display: flex;
          justify-content: center;
          padding: 20px;
        }
        
        .connect-button {
          background: #FF0000;
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