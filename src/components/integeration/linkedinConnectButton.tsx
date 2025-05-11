"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from 'sonner';

interface LinkedInConnectButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function LinkedInConnectButton({
  className = '',
  variant = 'default',
  size = 'default'
}: LinkedInConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      // Redirect to our API route that handles LinkedIn OAuth
      window.location.href = '/api/integrations/linkedin/authorize';
    } catch (error) {
      console.error('Error connecting LinkedIn:', error);
      toast.error('Failed to connect LinkedIn. Please try again later.');
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
              src='/platforms/linkedin.png' 
              alt='LinkedIn Logo' 
              width={isVerticalLayout ? 32 : 18} 
              height={isVerticalLayout ? 32 : 18} 
            />
          </div>
          <span>{isLoading ? 'Connecting...' : 'Connect LinkedIn'}</span>
        </>
      )}
    </Button>
  );
} 