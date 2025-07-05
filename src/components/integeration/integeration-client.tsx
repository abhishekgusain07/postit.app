"use client";

import React, { useState } from "react";
import { XConnectButton } from "./xconnectbutton";
import { TikTokConnectButton } from "./tiktokconnectbutton";
import { LinkedInConnectButton } from "./linkedinConnectButton";
import { InstagramConnectButton } from "./instagramConnectButton";
import InstagramV2ConnectButton from "./instagramV2ConnectButton";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Check, RefreshCw } from "lucide-react";
import Image from "next/image";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { deleteIntegration, refreshIntegrationToken } from "@/actions/integrations";

// Define a type for the integrations
type Integration = {
  id: string;
  name: string;
  picture: string | null;
  providerIdentifier: string;
  profile: string | null;
  createdAt: Date;
  additionalSettings?: any;
};

interface IntegrationsClientProps {
  integrations: Integration[];
  className?: string;
}

export function IntegrationsClient({ 
  integrations: initialIntegrations, 
  className 
}: IntegrationsClientProps) {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [refreshingTokens, setRefreshingTokens] = useState<string | null>(null);
  const searchParams = useSearchParams();
  
  // Check for Instagram V2 account selection
  const showInstagramV2Selection = searchParams.get("instagram_v2_selection") === "true";
  
  // Check for success or error messages in the URL
  React.useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    
    if (success) {
      toast.success(`Your ${success} account has been connected.`);
    }
    
    if (error) {
      // Handle specific error cases with better messages
      switch (error) {
        case 'no_instagram_accounts':
          toast.error('No Instagram accounts found. Please ensure your Facebook account has Instagram accounts connected to it.');
          break;
        case 'invalid_request':
          toast.error('Invalid request. Please try connecting again.');
          break;
        case 'invalid_state':
          toast.error('Security validation failed. Please try connecting again.');
          break;
        case 'server_error':
          toast.error('Server error occurred. Please try again later.');
          break;
        default:
          toast.error(error);
      }
    }
  }, [searchParams]);
  
  // Check if provider is already connected
  const isProviderConnected = (provider: string) => {
    return integrations.some(
      (integration) => integration.providerIdentifier === provider
    );
  };
  
  // Check if Instagram V2 is connected (by checking additionalSettings)
  const isInstagramV2Connected = () => {
    return integrations.some(
      (integration) => 
        integration.providerIdentifier === 'instagram' &&
        integration.additionalSettings &&
        typeof integration.additionalSettings === 'object' &&
        (integration.additionalSettings as any).version === 'v2'
    );
  };
  
  // Handle integration deletion
  const handleDelete = async (integrationId: string) => {
    try {
      setIsDeleting(integrationId);
      
      const result = await deleteIntegration(integrationId);
      
      if (result.success) {
      // Update the UI
      setIntegrations(integrations.filter((i) => i.id !== integrationId));
        toast.success("Integration removed successfully");
      } else {
        throw new Error(result.error || "Failed to delete integration");
      }
    } catch (error) {
      console.error("Error deleting integration:", error);
      toast.error("Failed to remove integration. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };
  
  // Handle token refresh
  const handleTokenRefresh = async (integrationId: string) => {
    try {
      setRefreshingTokens(integrationId);
      
      const result = await refreshIntegrationToken(integrationId);
      
      if (result.success) {
        toast.success(result.message || 'Token refreshed successfully');
      } else {
        toast.error(result.error || 'Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setRefreshingTokens(null);
    }
  };
  
  // Get the provider name for display
  const getProviderName = (provider: string) => {
    switch (provider) {
      case "twitter":
        return "Twitter";
      case "instagram":
        return "Instagram";
      case "facebook":
        return "Facebook";
      case "linkedin":
        return "LinkedIn";
      case "youtube":
        return "YouTube";
      case "tiktok":
        return "TikTok";
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
  };
  
  // Get the provider logo for display
  const getProviderLogo = (provider: string) => {
    switch (provider) {
      case "twitter":
        return "/platforms/x.png";
      case "instagram":
        return "/platforms/instagram.png";
      case "facebook":
        return "/platforms/facebook.png";
      case "linkedin":
        return "/platforms/linkedin.png";
      case "youtube":
        return "/platforms/youtube.png";
      case "tiktok":
        return "/platforms/tiktok.png";
      default:
        return "/platforms/default.png";
    }
  };
  
  // Get the provider background color
  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "twitter":
        return "from-blue-400 to-blue-600";
      case "instagram":
        return "from-purple-400 via-pink-500 to-orange-500";
      case "facebook":
        return "from-blue-600 to-blue-800";
      case "linkedin":
        return "from-blue-500 to-blue-700";
      case "youtube":
        return "from-red-500 to-red-700";
      case "tiktok":
        return "from-black to-gray-800";
      default:
        return "from-gray-500 to-gray-700";
    }
  };
  
  return (
    <div className={`space-y-8 ${className || ''}`}>
      {/* Connect Accounts Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span className="bg-primary/10 text-primary p-2 rounded-full mr-3">
            <Plus size={20} />
          </span>
          Connect Accounts
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {!isProviderConnected("twitter") && (
            <div className="flex flex-col items-center justify-center">
              <XConnectButton 
              />
            </div>
          )}
          
          {!isProviderConnected("tiktok") && (
            <div className="flex flex-col items-center justify-center">
              <TikTokConnectButton 
              />
            </div>
          )}
          
          {!isProviderConnected("linkedin") && (
            <div className="flex flex-col items-center justify-center">
              <LinkedInConnectButton 
              />
            </div>
          )}
          
          {!isProviderConnected("instagram") && (
            <div className="flex flex-col items-center justify-center">
              <InstagramConnectButton 
              />
            </div>
          )}
          
          {/* Instagram V2 Connect Button - Show if not connected or if account selection is needed */}
          {(!isInstagramV2Connected() || showInstagramV2Selection) && (
            <div className="col-span-full">
              <InstagramV2ConnectButton 
                showAccountSelection={showInstagramV2Selection}
              />
            </div>
          )}
          
          {/* More connect buttons would go here */}
          
          {/* Empty state when all platforms are connected */}
          {Object.keys({twitter: true, tiktok: true, youtube: true, linkedin: true, instagram: true}).every(provider => isProviderConnected(provider)) && (
            <div className="col-span-full bg-muted rounded-lg p-6 text-center">
              <p className="text-muted-foreground">All available platforms have been connected.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Connected Accounts Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 p-2 rounded-full mr-3">
            <Check size={20} />
          </span>
          Connected Accounts
        </h2>
        
        {integrations.length === 0 ? (
          <div className="bg-muted rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No accounts connected yet. Connect your social media accounts to get started.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <div 
                key={integration.id}
                className="bg-card rounded-xl shadow-sm overflow-hidden border"
              >
                {/* Colored banner based on the provider */}
                <div className={`h-3 bg-gradient-to-r ${getProviderColor(integration.providerIdentifier)}`}></div>
                
                <div className="p-5">
                  <div className="flex items-center">
                    {/* Provider Icon */}
                    <div className="relative mr-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 p-2">
                        <Image
                          src={getProviderLogo(integration.providerIdentifier)}
                          alt={getProviderName(integration.providerIdentifier)}
                          width={32}
                          height={32}
                        />
                      </div>
                  </div>
                  
                    {/* User Info */}
                  <div className="flex-grow">
                      <div className="flex items-center mb-1">
                        <h3 className="font-semibold text-lg">{integration.name}</h3>
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                          {getProviderName(integration.providerIdentifier)}
                        </span>
                      </div>
                      
                    {integration.profile && (
                      <p className="text-sm text-muted-foreground">
                        @{integration.profile}
                      </p>
                    )}
                  </div>
                    
                    {/* Refresh and Delete Buttons */}
                    <div className="flex items-center space-x-2">
                      {/* Refresh Token Button */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-primary hover:bg-primary/10"
                        disabled={refreshingTokens === integration.id}
                        onClick={() => handleTokenRefresh(integration.id)}
                      >
                        {refreshingTokens === integration.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        ) : (
                          <RefreshCw size={16} />
                        )}
                        <span className="sr-only">Refresh token</span>
                      </Button>
                  
                    {/* Delete Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10"
                          disabled={isDeleting === integration.id}
                        >
                          {isDeleting === integration.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent"></div>
                          ) : (
                        <Trash2 size={16} />
                          )}
                        <span className="sr-only">Delete integration</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will disconnect your {getProviderName(integration.providerIdentifier)} account.
                          You can reconnect it later if needed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(integration.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Disconnect
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                    </div>
                </div>
                
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                  Connected {formatDate(integration.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
} 