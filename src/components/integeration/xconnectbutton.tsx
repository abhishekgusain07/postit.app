"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Twitter } from 'lucide-react';

interface XConnectButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function XConnectButton({ 
  className = "",
  variant = "default",
  size = "default"
}: XConnectButtonProps) {
  const handleConnect = () => {
    // Redirect to the X authorization API route
    window.location.href = '/api/integrations/x/authorize';
  };

  return (
    <Button
      onClick={handleConnect}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      <Twitter size={18} />
      <span>Connect Twitter</span>
    </Button>
  );
} 