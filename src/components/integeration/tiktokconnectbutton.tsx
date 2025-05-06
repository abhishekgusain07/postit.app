'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from 'sonner';

interface TikTokConnectButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function TikTokConnectButton({
  className = '',
  variant = 'default',
  size = 'default'
}: TikTokConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      // Redirect to our API route that handles TikTok OAuth
      window.location.href = '/api/integrations/tiktok/authorize';
    } catch (error) {
      console.error('Error connecting TikTok:', error);
      toast.error('Failed to connect TikTok. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if it's being used in the grid layout (has "flex-col" in className)
  const isVerticalLayout = className.includes('flex-col');

  return (
    <Button
      onClick={handleConnect}
      variant={variant}
      size={size}
      className={className}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent'></div>
      ) : (
        <>
          <div className={isVerticalLayout ? 'mb-2' : ''}>
            <Image 
              src='/platforms/tiktok.png' 
              alt='TikTok Logo' 
              width={isVerticalLayout ? 32 : 18} 
              height={isVerticalLayout ? 32 : 18} 
            />
          </div>
          <span>{isLoading ? 'Connecting...' : 'Connect TikTok'}</span>
        </>
      )}
    </Button>
  );
} 