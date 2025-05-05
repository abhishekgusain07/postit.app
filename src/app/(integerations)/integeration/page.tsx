"use client";
import { redirect } from "next/navigation";
import { IntegrationsClient } from "@/components/integeration/integeration-client";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Integration, getUserIntegrations } from "@/actions/integrations";
import { toast } from "sonner";

// Explicitly define integration interface here to avoid type conflicts
interface IntegrationClientType {
  id: string;
  name: string;
  picture: string | null;
  providerIdentifier: string;
  profile: string | null;
  createdAt: Date;
}

export default function IntegrationsPage() {
    const [loading, setLoading] = useState(true);
    const [integrations, setIntegrations] = useState<IntegrationClientType[]>([]);
    
    useEffect(() => {
        const fetchIntegrations = async () => {
            try {
                setLoading(true);
                const {data:session, error} = await authClient.getSession();
                
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
                    const clientIntegrations: IntegrationClientType[] = result.data.map(item => ({
                        id: item.id,
                        name: item.name,
                        picture: item.picture,
                        providerIdentifier: item.providerIdentifier,
                        profile: item.profile,
                        createdAt: item.createdAt
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
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Social Media Integrations</h1>
                <p className="text-muted-foreground mt-2">
                    Connect and manage your social media accounts
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            ) : (
                <IntegrationsClient integrations={integrations} />
            )}
        </div>
    );
} 