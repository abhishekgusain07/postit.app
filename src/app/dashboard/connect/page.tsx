"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { getUserIntegrations } from "@/actions/integrations";
import { IntegrationsClient } from "@/components/integeration/integeration-client";
import { Check, CheckCircle2 } from "lucide-react";

// Explicitly define integration interface to avoid type conflicts
interface IntegrationClientType {
  id: string;
  name: string;
  picture: string | null;
  providerIdentifier: string;
  profile: string | null;
  createdAt: Date;
}

function IntegrationsContent() {
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<IntegrationClientType[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successPlatform, setSuccessPlatform] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Function to get the provider display name
  const getProviderName = (provider: string) => {
    switch (provider) {
      case "twitter":
        return "Twitter";
      case "tiktok":
        return "TikTok";
      case "linkedin":
        return "LinkedIn";
      case "youtube":
        return "YouTube";
      case "instagram":
        return "Instagram";
      case "facebook":
        return "Facebook";
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
  };

  // Handle URL parameters and fetch integrations
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        setLoading(true);
        const { data: session, error } = await authClient.getSession();

        if (error) {
          toast.error("Authentication error. Please sign in again.");
          redirect("/sign-in");
        }

        if (!session?.user) {
          redirect("/sign-in");
        }

        const userId = session.user.id;
        const result = await getUserIntegrations(userId);

        if (result.success && result.data) {
          // Convert the server action type to the client type
          const clientIntegrations: IntegrationClientType[] = result.data.map((item) => ({
            id: item.id !,
            name: item.name!,
            picture: item.picture!,
            providerIdentifier: item.providerIdentifier!,
            profile: item.profile!,
            createdAt: item.createdAt!,
          }));
          setIntegrations(clientIntegrations);
        } else {
          toast.error(result.error || "Failed to load integrations");
        }
      } catch (error) {
        console.error("Error in integration page:", error);
        toast.error("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrations();

    // Check for success or error message in URL
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success) {
      setSuccessPlatform(success);
      setShowSuccess(true);
      
      // Display toast message
      toast.success(`Your ${getProviderName(success)} account has been connected successfully!`);
      
      // Clear the success parameter after a short delay
      setTimeout(() => {
        router.replace("/dashboard/connect");
      }, 5000);
    }

    if (error) {
      toast.error(error);
      // Clear the error parameter
      setTimeout(() => {
        router.replace("/dashboard/connect");
      }, 5000);
    }
  }, [searchParams, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Show success banner when a platform is successfully connected */}
      {showSuccess && successPlatform && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center text-green-800 dark:text-green-300">
          <CheckCircle2 className="mr-2 h-5 w-5" />
          <div>
            <p className="font-medium">
              Your {getProviderName(successPlatform)} account was successfully connected!
            </p>
            <p className="text-sm text-green-700 dark:text-green-400">
              You can now post and schedule content to this platform.
            </p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Social Media Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect and manage your social media accounts
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <IntegrationsClient integrations={integrations} />
      )}
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Social Media Integrations</h1>
          <p className="text-muted-foreground mt-2">
            Connect and manage your social media accounts
          </p>
        </div>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    }>
      <IntegrationsContent />
    </Suspense>
  );
} 