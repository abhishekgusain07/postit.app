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
  replySettings: z.enum(['following', 'mentionedUsers', 'subscribers', 'verified']).optional(),
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

  // Initialize form with zod resolver
  const form = useForm<z.infer<typeof tweetSchema>>({
    resolver: zodResolver(tweetSchema),
    defaultValues: {
      text: '',
      replySettings: 'following',
      media: []
    }
  });

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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Twitter Post</CardTitle>
          <CardDescription>
            Compose and share your tweet directly from PostAhead
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isTwitterConnected ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                You need to connect your Twitter account to create tweets
              </p>
              <XConnectButton 
                variant="default" 
                size="lg" 
                className="mx-auto"
              />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tweet Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What's happening?"
                          {...field}
                          className="resize-y min-h-[120px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="media"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Media</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input 
                            type="text" 
                            placeholder="Enter media URL (image or video)" 
                            value={field.value?.[0]?.url || ''}
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
                          {field.value?.[0] && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>
                                Media Type: {field.value[0].type.toUpperCase()}
                              </span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                onClick={() => field.onChange([])}
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="replySettings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Who can reply?</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reply settings" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="following">Following</SelectItem>
                          <SelectItem value="mentionedUsers">Mentioned Users</SelectItem>
                          <SelectItem value="subscribers">Subscribers</SelectItem>
                          <SelectItem value="verified">Verified Users</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Posting...' : 'Post Tweet'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 