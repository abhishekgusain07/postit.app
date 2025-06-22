"use client";

//TODO: toolsarsenal twitter mockup
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { XConnectButton } from '@/components/integeration/xconnectbutton';
import { checkTwitterIntegration, postTweet } from '@/actions/tweets';

// Zod schema for tweet validation
const tweetSchema = z.object({
  text: z.string()
    .min(1, { message: "Tweet cannot be empty" })
    .max(280, { message: "Tweet must be 280 characters or less" }),
  replySettings: z.enum(['following', 'mentionedUsers', 'subscribers', 'verified', 'everyone']).optional(),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['image', 'video']),
    altText: z.string().optional()
  })).optional(),
});

export default function TwitterCreatePage() {
  const router = useRouter();
  const [isTwitterConnected, setIsTwitterConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [characterCount, setCharacterCount] = useState(0);

  // Initialize form with zod resolver
  const form = useForm<z.infer<typeof tweetSchema>>({
    resolver: zodResolver(tweetSchema),
    defaultValues: {
      text: '',
      replySettings: 'following',
      media: []
    }
  });

  // Watch form changes to update character count
  const watchText = form.watch('text');
  useEffect(() => {
    setCharacterCount(watchText?.length || 0);
  }, [watchText]);

  // Check Twitter integration on component mount
  useEffect(() => {
    const fetchTwitterIntegration = async () => {
      try {
        const result = await checkTwitterIntegration();
        
        if (!result.success) {
          if (result.redirectTo) {
            router.push(result.redirectTo);
          }
          toast.error(result.error || "Failed to check Twitter integration");
          return;
        }

        setIsTwitterConnected(result.isConnected || false);
      } catch (error) {
        console.error('Error checking Twitter integration:', error);
        toast.error('Failed to check Twitter integration');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTwitterIntegration();
  }, [router]);

  // Handle tweet submission
  const onSubmit = async (values: z.infer<typeof tweetSchema>) => {
    try {
      setIsLoading(true);
      
      const result = await postTweet(values);

      if (result.success) {
        toast.success('Tweet posted successfully!');
        form.reset(); // Clear the form
      } else {
        // Check if result has a redirectTo property
        if ('redirectTo' in result && result.redirectTo) {
          router.push(result.redirectTo);
        }
        toast.error(result.error || 'Failed to post tweet');
      }
    } catch (error) {
      console.error('Tweet posting error:', error);
      toast.error('An error occurred while posting the tweet');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <CardHeader className="bg-white/80 backdrop-blur-sm border-b border-gray-100 py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-600">
                  <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 5.25 12 7v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.686-3.735 7.959-7.521 0.585-1.731.669-3.261.67-4.996 0-.251 1.686-2.504 2.337-3.479z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">Create Twitter Post</CardTitle>
                <CardDescription className="text-gray-500">
                  Craft your tweet with precision and style
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-white p-6 space-y-6">
            {!isTwitterConnected ? (
              <div className="text-center space-y-6 py-8">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <p className="text-blue-600 text-lg mb-4">
                    Connect your Twitter account to start creating posts
                  </p>
                  <XConnectButton 
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
                          <span>Tweet Content</span>
                          <span className={`text-sm ${characterCount > 280 ? 'text-red-500' : 'text-gray-500'}`}>
                            {characterCount}/280
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What's happening?"
                            {...field}
                            className="resize-y min-h-[150px] border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-xl"
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
                        <FormLabel className="text-gray-700">Media</FormLabel>
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
                                        type: e.target.value.match(/\.(mp4|mov|avi)$/i) 
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
                              <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg text-sm">
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
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="replySettings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Who can reply?</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-xl">
                              <SelectValue placeholder="Select reply settings" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white shadow-lg rounded-xl">
                            <SelectItem value="following" className="hover:bg-blue-50 focus:bg-blue-50">Following</SelectItem>
                            <SelectItem value="mentionedUsers" className="hover:bg-blue-50 focus:bg-blue-50">Mentioned Users</SelectItem>
                            <SelectItem value="subscribers" className="hover:bg-blue-50 focus:bg-blue-50">Subscribers</SelectItem>
                            <SelectItem value="verified" className="hover:bg-blue-50 focus:bg-blue-50">Verified Users</SelectItem>
                            <SelectItem value="everyone" className="hover:bg-blue-50 focus:bg-blue-50">Everyone</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                    disabled={isLoading || characterCount > 280}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Posting...
                      </div>
                    ) : (
                      'Post Tweet'
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
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
} 