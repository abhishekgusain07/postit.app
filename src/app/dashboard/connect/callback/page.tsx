"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { completeTwitterAuth } from '@/actions/integrations';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [status, setStatus] = useState('Verifying credentials...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          toast.error(`Authentication error: ${error}`);
          router.push('/integrations?error=auth_denied');
          return;
        }

        if (!code || !state) {
          toast.error('Missing required parameters');
          router.push('/integrations?error=invalid_request');
          return;
        }

        // Retrieve stored state and code verifier from sessionStorage
        const storedState = sessionStorage.getItem('x_auth_state');
        const codeVerifier = sessionStorage.getItem('x_code_verifier');

        // Verify state parameter for security
        if (!storedState || state !== storedState) {
          toast.error('State verification failed');
          router.push('/integrations?error=invalid_state');
          return;
        }

        if (!codeVerifier) {
          toast.error('Code verifier not found');
          router.push('/integrations?error=missing_verifier');
          return;
        }

        // Get current user
        setStatus('Checking authentication...');
        const { data: session, error: sessionError } = await authClient.getSession();

        if (sessionError || !session?.user?.id) {
          toast.error('Authentication required');
          router.push('/sign-in');
          return;
        }

        // Complete the OAuth flow using server action
        setStatus('Connecting to Twitter...');
        const result = await completeTwitterAuth(session.user.id, code, codeVerifier);

        if (!result.success || result.error) {
          toast.error(result.error || 'Failed to connect Twitter');
          router.push(`/integrations?error=${encodeURIComponent(result.error || 'unknown_error')}`);
          return;
        }

        // Clean up sessionStorage
        sessionStorage.removeItem('x_auth_state');
        sessionStorage.removeItem('x_code_verifier');

        // Success
        toast.success('Twitter account connected successfully');
        router.push('/integrations?success=twitter');
      } catch (error) {
        console.error('Error processing callback:', error);
        toast.error('An unexpected error occurred');
        router.push('/integrations?error=server_error');
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      {isProcessing ? (
        <>
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <h1 className="text-xl font-semibold mb-2">Processing Twitter Authorization</h1>
          <p className="text-muted-foreground">{status}</p>
        </>
      ) : (
        <p>Redirecting...</p>
      )}
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <h1 className="text-xl font-semibold mb-2">Processing Authorization</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
} 