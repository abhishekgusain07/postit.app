"use client"
import React, { useState, useEffect } from 'react';
import { YouTubeConnect } from './youtubeconnect';
import { YouTubeUpload } from './youtubeupload';
import { AuthTokenDetails } from '../providers/youtube.provider';
import YoutubeConnectSkeleton from '../app/(socials)/youtube/componenet/YoutubeConnectSkeleton';
import { isYouTubeConnected } from '../actions/youtube';
import { authClient } from '@/lib/auth-client';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const [loading, setLoading] = useState(true);
  const [connectedInfo, setConnectedInfo] = useState<{ connected: boolean; channelId?: string; channelName?: string } | null>(null);

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

  useEffect(() => {
    // Fetch connection status here
    const checkConnection = async () => {
      // You should replace this with your real user/session logic
      const { data: session, error } = await authClient.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const connected = await isYouTubeConnected(session.user.id);
      setConnectedInfo(connected);
      setLoading(false);
    };
    checkConnection();
  }, []);

  // Get initials from name or email
  const getInitials = (name?: string): string => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="max-w-2xl mx-auto p-5">
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl mb-5 shadow-sm">
          {error}
        </div>
      )}

      {loading ? (
        <YoutubeConnectSkeleton />
      ) : connectedInfo && connectedInfo.connected ? (
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm px-8 py-5 w-full">
          <div className="flex items-center gap-4">
            {authDetails?.picture ? (
              <Image 
                src={authDetails.picture} 
                alt={authDetails?.name || ''} 
                className="w-11 h-11 rounded-lg" 
                width={44} 
                height={44} 
              />
            ) : (
              <Avatar className="h-11 w-11 rounded-lg">
                <AvatarFallback className="rounded-lg bg-red-600">
                  {getInitials(connectedInfo.channelName || authDetails?.name)}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex flex-col">
              <h3 className="font-medium text-gray-900">{connectedInfo.channelName}</h3>
              <p className="text-sm text-gray-500">Connected to YouTube</p>
            </div>
          </div>
          <div className="text-sm font-medium px-4 py-2 rounded-full bg-red-50 text-red-600">
            YouTube
          </div>
        </div>
      ) : (
        <YouTubeConnect
          clientId={clientId}
          clientSecret={clientSecret}
          redirectUri={redirectUri}
          onSuccess={handleConnectSuccess}
          onError={handleConnectError}
        />
      )}
    </div>
  );
}; 