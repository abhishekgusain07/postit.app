"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Instagram, CheckCircle, X } from 'lucide-react';

export default function TestInstagramV2() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Instagram V2 Integration Test</h1>
            <p className="text-gray-600">Test and verify your Instagram V2 integration setup</p>
          </div>

          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Instagram className="h-5 w-5 text-purple-600" />
                <span>Current Status</span>
              </CardTitle>
              <CardDescription>
                Check the current state of your Instagram V2 integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">No Instagram Accounts Found</p>
                      <p className="text-sm text-yellow-700">Your Facebook account doesn't have Instagram accounts connected</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements Checklist</CardTitle>
              <CardDescription>
                Ensure all requirements are met before testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Facebook Developer Account</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Facebook App with Instagram Basic Display permissions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <X className="h-5 w-5 text-red-600" />
                  <span className="text-gray-700">Facebook account with Instagram Business accounts connected</span>
                </div>
                <div className="flex items-center space-x-3">
                  <X className="h-5 w-5 text-red-600" />
                  <span className="text-gray-700">Admin access to Instagram Business accounts</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Fix */}
          <Card>
            <CardHeader>
              <CardTitle>How to Fix "No Instagram Accounts"</CardTitle>
              <CardDescription>
                Steps to resolve the missing Instagram accounts issue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Option 1: Connect Instagram to Facebook</h3>
                  <ol className="list-decimal pl-6 text-blue-800 space-y-1 text-sm">
                    <li>Go to Facebook.com and log into your account</li>
                    <li>Navigate to Settings → Instagram</li>
                    <li>Click "Connect Account" and follow the prompts</li>
                    <li>Make sure your Instagram account is a Business account</li>
                    <li>Grant necessary permissions</li>
                  </ol>
                </div>

                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <h3 className="font-medium text-green-900 mb-2">Option 2: Use a Different Facebook Account</h3>
                  <ol className="list-decimal pl-6 text-green-800 space-y-1 text-sm">
                    <li>Use a Facebook account that already has Instagram Business accounts</li>
                    <li>Ensure you have admin access to those Instagram accounts</li>
                    <li>Make sure the Instagram accounts are connected to the Facebook account</li>
                  </ol>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
                  <h3 className="font-medium text-purple-900 mb-2">Option 3: Create Instagram Business Account</h3>
                  <ol className="list-decimal pl-6 text-purple-800 space-y-1 text-sm">
                    <li>Convert your personal Instagram account to a Business account</li>
                    <li>Connect it to your Facebook page</li>
                    <li>Ensure the Facebook page is connected to your Facebook account</li>
                    <li>Grant necessary permissions in Facebook Business Manager</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Test Actions</CardTitle>
              <CardDescription>
                Actions you can take to test the integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => window.location.href = '/integrations'}
                    variant="outline"
                    className="flex-1"
                  >
                    Go to Integrations Page
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/api/integrations/instagram/v2/authorize'}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Test Instagram V2 Auth
                  </Button>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>Note:</strong> The Instagram V2 auth will redirect you to Facebook for authorization. 
                  If you don't have Instagram accounts connected to your Facebook account, you'll get the "no_instagram_accounts" error.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables Check</CardTitle>
              <CardDescription>
                Verify your environment variables are set correctly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">FACEBOOK_CLIENT_ID:</span>
                  <span className="font-mono text-gray-800">
                    {process.env.FACEBOOK_CLIENT_ID ? '✅ Set' : '❌ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">FACEBOOK_CLIENT_SECRET:</span>
                  <span className="font-mono text-gray-800">
                    {process.env.FACEBOOK_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">FRONTEND_URL:</span>
                  <span className="font-mono text-gray-800">
                    {process.env.FRONTEND_URL ? '✅ Set' : '❌ Missing'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 