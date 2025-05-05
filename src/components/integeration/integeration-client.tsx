"use client";

import React, { useState } from "react";
import { XConnectButton } from "./xconnectbutton";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
import { deleteIntegration } from "@/actions/integrations";

// Define a type for the integrations
type Integration = {
  id: string;
  name: string;
  picture: string | null;
  providerIdentifier: string;
  profile: string | null;
  createdAt: Date;
};

interface IntegrationsClientProps {
  integrations: Integration[];
}

export function IntegrationsClient({ integrations: initialIntegrations }: IntegrationsClientProps) {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const searchParams = useSearchParams();
  
  // Check for success or error messages in the URL
  React.useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    
    if (success) {
      toast.success(`Your ${success} account has been connected.`);
    }
    
    if (error) {
      toast.error(error);
    }
  }, [searchParams]);
  
  // Check if provider is already connected
  const isProviderConnected = (provider: string) => {
    return integrations.some(
      (integration) => integration.providerIdentifier === provider
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
  
  // Get the correct logo for each provider
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
      default:
        return "/platforms/default.png";
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Connect Accounts Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Connect Accounts</h2>
        
        <div className="flex flex-wrap gap-4">
          {!isProviderConnected("twitter") && <XConnectButton />}
          
          {/* Add more provider connect buttons here */}
        </div>
      </section>
      
      {/* Connected Accounts Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
        
        {integrations.length === 0 ? (
          <div className="bg-muted rounded-lg p-6 text-center">
            <p>No accounts connected yet. Connect your social media accounts to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <div 
                key={integration.id}
                className="bg-card border rounded-lg shadow-sm p-4 relative"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10 shrink-0">
                    {integration.picture ? (
                      <Image
                        src={integration.picture}
                        alt={integration.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted">
                        <Image
                          src={getProviderLogo(integration.providerIdentifier)}
                          alt={integration.providerIdentifier}
                          width={20}
                          height={20}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">{integration.name}</h3>
                    {integration.profile && (
                      <p className="text-sm text-muted-foreground">
                        @{integration.profile}
                      </p>
                    )}
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
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
                          This will disconnect your {integration.providerIdentifier} account.
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
                
                <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                  Connected {formatDate(integration.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
} 