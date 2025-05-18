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
    <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm px-8 py-5 w-full max-w-2xl mx-auto gap-5">
      <div className="flex items-center gap-4">
        <Image src="/youtube.svg" alt="YouTube Logo" width={44} height={44} className="rounded-lg bg-white shadow-sm" />
        <div className="flex flex-col">
          <div className="text-lg font-bold text-zinc-900">Connect YouTube account</div>
          <div className="text-sm text-gray-500 mt-0.5">Estimated 30 seconds</div>
        </div>
      </div>
      {connectedInfo && connectedInfo.connected ? (
        <div className="flex items-center bg-green-50 text-green-700 rounded-full px-4 py-2 font-semibold text-base">
          <FaCheckCircle className="mr-1.5" color="#22c55e" size={22} />
          <span className="ml-1">Connected as <b className="text-red-600 font-bold ml-1">{connectedInfo.channelName || 'YouTube Channel'}</b></span>
        </div>
      ) : (
      <button
        onClick={handleConnect}
        disabled={isLoading || !authUrl}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold text-base shadow-sm transition disabled:opacity-70 disabled:cursor-not-allowed"
      >
          <FaPlus className="mr-2" />
          Connect YouTube
      </button>
      )}
    </div>
  );
}; 