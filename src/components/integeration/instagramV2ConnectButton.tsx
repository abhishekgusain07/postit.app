'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Instagram, ExternalLink, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';

interface InstagramAccount {
  id: string;
  name: string;
  picture: { data: { url: string } };
  pageId: string;
}

interface InstagramV2ConnectButtonProps {
  isConnected?: boolean;
  connectedAccount?: {
    id: string;
    name: string;
    picture: string;
    username: string;
  };
  onDisconnect?: () => void;
  showAccountSelection?: boolean;
}

export default function InstagramV2ConnectButton({
  isConnected = false,
  connectedAccount,
  onDisconnect,
  showAccountSelection = false,
}: InstagramV2ConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [connectingAccountId, setConnectingAccountId] = useState<string | null>(null);
  const [showSelection, setShowSelection] = useState(showAccountSelection);

  useEffect(() => {
    if (showAccountSelection) {
      fetchAccounts();
    }
  }, [showAccountSelection]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/integrations/instagram/v2/accounts');
      const data = await response.json();
      
      if (data.success) {
        setAccounts(data.accounts);
        setShowSelection(true);
      } else {
        setError(data.error || 'Failed to fetch accounts');
      }
    } catch (err) {
      setError('Failed to fetch accounts');
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Redirect to the Instagram v2 authorization endpoint
      window.location.href = '/api/integrations/instagram/v2/authorize';
    } catch (err) {
      setError('Failed to start Instagram authorization');
      setIsConnecting(false);
    }
  };

  const connectAccount = async (accountId: string) => {
    setConnectingAccountId(accountId);
    setError(null);
    
    try {
      const response = await fetch('/api/integrations/instagram/v2/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh the page to show the connected account
        window.location.reload();
      } else {
        setError(data.error || 'Failed to connect account');
      }
    } catch (err) {
      setError('Failed to connect account');
    } finally {
      setConnectingAccountId(null);
    }
  };

  const cancelSelection = () => {
    setShowSelection(false);
    setAccounts([]);
  };

  // Show account selection if needed
  if (showSelection && accounts.length > 0) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Instagram className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-blue-800">
                  Select Instagram Account
                </CardTitle>
                <CardDescription className="text-blue-600">
                  Choose which account to connect
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={cancelSelection}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={account.picture.data.url} 
                      alt={account.name}
                    />
                    <AvatarFallback>
                      {account.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{account.name}</p>
                    <p className="text-sm text-gray-500">Instagram Business Account</p>
                  </div>
                </div>
                
                <Button
                  onClick={() => connectAccount(account.id)}
                  disabled={connectingAccountId === account.id}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {connectingAccountId === account.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isConnected && connectedAccount) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Instagram className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-green-800">
                  Instagram Business (V2)
                </CardTitle>
                <CardDescription className="text-green-600">
                  Connected - Enhanced Flow
                </CardDescription>
              </div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={connectedAccount.picture} 
                  alt={connectedAccount.name}
                />
                <AvatarFallback>
                  {connectedAccount.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-green-800">
                  {connectedAccount.name}
                </p>
                {connectedAccount.username && (
                  <p className="text-sm text-green-600">
                    @{connectedAccount.username}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={onDisconnect}
              variant="outline"
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 hover:border-gray-300 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <Instagram className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-800">
                Instagram Business (V2)
              </CardTitle>
              <CardDescription className="text-gray-600">
                Connect your Instagram Business account - Enhanced Flow
              </CardDescription>
            </div>
          </div>
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            <p className="mb-2">✨ <strong>Enhanced Features:</strong></p>
            <ul className="space-y-1 text-xs text-gray-500">
              <li>• Better account selection</li>
              <li>• Improved error handling</li>
              <li>• More stable connection</li>
              <li>• Enhanced permissions</li>
            </ul>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Requirements:</p>
                <ul className="space-y-1">
                  <li>• Facebook account with Instagram Business accounts</li>
                  <li>• Instagram accounts must be connected to your Facebook account</li>
                  <li>• Admin access to the Instagram Business accounts</li>
                </ul>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect Instagram V2
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 