"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { LinkedInConnectButton } from '@/components/integeration/linkedinConnectButton';
import { checkLinkedInIntegration, postLinkedInPost } from '@/actions/linkedin';

// Zod schema for LinkedIn post validation
const linkedInPostSchema = z.object({
  text: z.string()
    .min(1, { message: "Post cannot be empty" })
    .max(3000, { message: "LinkedIn post must be 3000 characters or less" }),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['image', 'video']),
    altText: z.string().optional()
  })).max(1, { message: "LinkedIn allows only one media item per post" }).optional(),
});

export default function LinkedInCreatePage() {
  const router = useRouter();
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [characterCount, setCharacterCount] = useState(0);

  // Initialize form with zod resolver
  const form = useForm<z.infer<typeof linkedInPostSchema>>({
    resolver: zodResolver(linkedInPostSchema),
    defaultValues: {
      text: '',
      media: []
    }
  });

  // Watch form changes to update character count
  const watchText = form.watch('text');
  useEffect(() => {
    setCharacterCount(watchText?.length || 0);
  }, [watchText]);

  // Check LinkedIn integration on component mount
  useEffect(() => {
    const fetchLinkedInIntegration = async () => {
      try {
        const result = await checkLinkedInIntegration();
        
        if (!result.success) {
          if (result.redirectTo) {
            router.push(result.redirectTo);
          }
          toast.error(result.error || "Failed to check LinkedIn integration");
          return;
        }

        setIsLinkedInConnected(result.isConnected || false);
      } catch (error) {
        console.error('Error checking LinkedIn integration:', error);
        toast.error('Failed to check LinkedIn integration');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkedInIntegration();
  }, [router]);

  // Handle post submission
  const onSubmit = async (values: z.infer<typeof linkedInPostSchema>) => {
    try {
      setIsLoading(true);
      
      const result = await postLinkedInPost(values);

      if (result.success) {
        toast.success('LinkedIn post created successfully!');
        form.reset(); // Clear the form
      } else {
        // Check if result has a redirectTo property
        if ('redirectTo' in result && result.redirectTo) {
          router.push(result.redirectTo);
        }
        toast.error(result.error || 'Failed to create LinkedIn post');
      }
    } catch (error) {
      console.error('LinkedIn post creation error:', error);
      toast.error('An error occurred while creating the LinkedIn post');
    } finally {
      setIsLoading(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-800"></div>
          <CardHeader className="bg-white/80 backdrop-blur-sm border-b border-gray-100 py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-600">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">Create LinkedIn Post</CardTitle>
                <CardDescription className="text-gray-500">
                  Share your professional insights and updates
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-white p-6 space-y-6">
            {!isLinkedInConnected ? (
              <div className="text-center space-y-6 py-8">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <p className="text-blue-600 text-lg mb-4">
                    Connect your LinkedIn account to start creating posts
                  </p>
                  <LinkedInConnectButton 
                    variant="default" 
                    size="lg" 
                    className="mx-auto px-8 py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                  />
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex justify-between items-center text-gray-700">
                          <span>Post Content</span>
                          <span className={`text-sm ${characterCount > 3000 ? 'text-red-500' : 'text-gray-500'}`}>
                            {characterCount}/3000
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your professional insights, achievements, or industry thoughts..."
                            {...field}
                            className="resize-y min-h-[200px] border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-xl"
                            onChange={(e) => {
                              field.onChange(e);
                              setCharacterCount(e.target.value.length);
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="media"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Media (Optional)</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <div className="relative">
                              <Input 
                                type="text" 
                                placeholder="Paste media URL (image or video)" 
                                value={field.value?.[0]?.url || ''}
                                className="pl-10 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-xl"
                                onChange={(e) => {
                                  const newMedia = e.target.value 
                                    ? [{ 
                                        url: e.target.value, 
                                        type: e.target.value.match(/\.(mp4|mov|avi|mkv)$/i) 
                                          ? 'video' as const 
                                          : 'image' as const 
                                      }] 
                                    : [];
                                  field.onChange(newMedia);
                                }}
                              />
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                  <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                              </div>
                            </div>
                            {field.value?.[0] && (
                              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg text-sm">
                                <span className="text-blue-600">
                                  Media Type: {field.value[0].type.toUpperCase()}
                                </span>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-500 hover:bg-red-50"
                                  onClick={() => field.onChange([])}
                                >
                                  Remove
                                </Button>
                              </div>
                            )}
                            <p className="text-xs text-gray-500">
                              LinkedIn supports images (PNG, JPG, GIF) and videos (MP4, MOV) up to 25MB. Only one media item per post.
                            </p>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                    disabled={isLoading || characterCount > 3000}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Publishing...
                      </div>
                    ) : (
                      'Publish on LinkedIn'
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
        
        {/* Decorative background elements */}
        <div className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none z-[-1]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}