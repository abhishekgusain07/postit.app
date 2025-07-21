"use client";
import { redirect } from "next/navigation";
import { IntegrationsClient } from "@/components/integeration/integeration-client";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { getUserIntegrations } from "@/actions/integrations";
import { toast } from "sonner";
import { XConnectButton } from "@/components/integeration/xconnectbutton";
import { TikTokConnectButton } from "@/components/integeration/tiktokconnectbutton";
import { YouTubeConnect } from "@/components/youtubeconnect";

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
                        id: item.id ?? "",
                        name: item.name ?? "",
                        picture: item.picture ?? null,
                        providerIdentifier: item.providerIdentifier ?? "",
                        profile: item.profile ?? null,
                        createdAt: item.createdAt ?? new Date(),
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
                    <div className="px-6 py-8 sm:px-10 bg-gradient-to-r from-blue-500 to-purple-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                                    Social Media Integrations
                                </h1>
                                <p className="mt-2 text-lg text-blue-100 opacity-90">
                                    Seamlessly connect and manage your social media ecosystem
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <svg className="w-24 h-24 text-white opacity-20" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                                </svg>
                            </div>
                        </div>
            </div>

                    <div className="p-6 sm:p-10">
            {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <IntegrationsClient 
                                    integrations={integrations} 
                                    className="transition-all duration-300 ease-in-out" 
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>Securely manage your social media connections with advanced privacy controls</p>
                </div>
            </div>
        </div>
    );
} 