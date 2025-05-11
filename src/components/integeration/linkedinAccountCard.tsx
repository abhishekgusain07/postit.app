"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Integration } from "@/types";

dayjs.extend(relativeTime);

interface LinkedInAccountCardProps {
  integration: Integration;
  onRefresh?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function LinkedInAccountCard({ integration, onRefresh, onDelete }: LinkedInAccountCardProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    try {
      setIsRefreshing(true);
      await onRefresh(integration.id);
      toast.success("LinkedIn account refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh LinkedIn account");
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete(integration.id);
      toast.success("LinkedIn account disconnected successfully");
    } catch (error) {
      toast.error("Failed to disconnect LinkedIn account");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const getTokenStatus = () => {
    if (integration.refreshNeeded) {
      return "Token refresh required";
    }
    
    if (!integration.tokenExpiration) {
      return "Unknown expiration";
    }
    
    const expirationDate = dayjs(integration.tokenExpiration);
    if (expirationDate.isBefore(dayjs())) {
      return "Token expired";
    }
    
    return `Token expires ${expirationDate.fromNow()}`;
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-[#0077b5] text-white pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Image
              src="/images/logos/linkedin.svg"
              alt="LinkedIn"
              width={24}
              height={24}
              className="rounded-full"
            />
            LinkedIn
          </CardTitle>
        </div>
        <CardDescription className="text-zinc-100">
          {integration.profile || "LinkedIn Profile"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Account</span>
            <span className="text-sm font-medium">{integration.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Status</span>
            <span className="text-sm font-medium">
              {integration.disabled ? "Disabled" : "Active"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Connected on</span>
            <span className="text-sm font-medium">
              {dayjs(integration.createdAt).format("MMM D, YYYY")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Token status</span>
            <span className="text-sm font-medium">{getTokenStatus()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t p-4 bg-gray-50 flex justify-between">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isDeleting}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Token
              </>
            )}
          </Button>
        )}
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isRefreshing || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disconnecting
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Disconnect
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 