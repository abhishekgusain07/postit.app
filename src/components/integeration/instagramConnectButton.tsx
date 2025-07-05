"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

interface InstagramConnectButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function InstagramConnectButton({ 
  variant = "outline", 
  size = "default",
  className 
}: InstagramConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      // Use browser redirect to trigger OAuth flow
      window.location.href = '/api/integrations/instagram/authorize';
    } catch (error) {
      console.error('Instagram connection error:', error);
      toast.error('An error occurred while connecting to Instagram');
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white border-none ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          <span>Connecting...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Image
            src="/platforms/instagram.png"
            alt="Instagram"
            width={20}
            height={20}
            className="rounded"
          />
          <span>Connect Instagram</span>
        </div>
      )}
    </Button>
  );
} 