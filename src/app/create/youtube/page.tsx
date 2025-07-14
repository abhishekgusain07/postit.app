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
import { YouTubeConnectButton } from '@/components/integeration/youtubeConnectButton';
import { checkYouTubeIntegration } from '@/actions/youtube';
import { YouTubeProvider, VideoDetails } from '@/providers/youtube.provider';

// Zod schema for YouTube video validation
const youtubeVideoSchema = z.object({
  title: z.string()
    .min(1, { message: "Title cannot be empty" })
    .max(100, { message: "Title must be 100 characters or less" }),
  description: z.string()
    .max(5000, { message: "Description must be 5000 characters or less" })
    .optional(),
  videoUrl: z.string()
    .url({ message: "Please enter a valid video URL" }),
  privacyStatus: z.enum(['public', 'private', 'unlisted']).optional().default('private'),
  tags: z.string().optional(),
  categoryId: z.string().optional(),
});

const YOUTUBE_CATEGORIES = [
  { id: '1', name: 'Film & Animation' },
  { id: '2', name: 'Autos & Vehicles' },
  { id: '10', name: 'Music' },
  { id: '15', name: 'Pets & Animals' },
  { id: '17', name: 'Sports' },
  { id: '19', name: 'Travel & Events' },
  { id: '20', name: 'Gaming' },
  { id: '22', name: 'People & Blogs' },
  { id: '23', name: 'Comedy' },
  { id: '24', name: 'Entertainment' },
  { id: '25', name: 'News & Politics' },
  { id: '26', name: 'Howto & Style' },
  { id: '27', name: 'Education' },
  { id: '28', name: 'Science & Technology' },
];

type YouTubeVideoFormData = z.infer<typeof youtubeVideoSchema>;

export default function YouTubeCreatePage() {
  const router = useRouter();
  const [isYouTubeConnected, setIsYouTubeConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [titleCount, setTitleCount] = useState(0);
  const [descriptionCount, setDescriptionCount] = useState(0);

  // Initialize form with zod resolver
  const form = useForm<YouTubeVideoFormData>({
    resolver: zodResolver(youtubeVideoSchema),
    defaultValues: {
      title: '',
      description: '',
      videoUrl: '',
      privacyStatus: 'private' as const,
      tags: '',
      categoryId: '22' // Default to "People & Blogs"
    }
  });

  // Watch form changes to update character counts
  const watchTitle = form.watch('title');
  const watchDescription = form.watch('description');
  
  useEffect(() => {
    setTitleCount(watchTitle?.length || 0);
    setDescriptionCount(watchDescription?.length || 0);
  }, [watchTitle, watchDescription]);

  // Check YouTube integration on component mount
  useEffect(() => {
    const fetchYouTubeIntegration = async () => {
      try {
        const result = await checkYouTubeIntegration();
        
        if (!result.success) {
          if (result.redirectTo) {
            router.push(result.redirectTo);
          }
          toast.error(result.error || "Failed to check YouTube integration");
          return;
        }

        setIsYouTubeConnected(result.isConnected || false);
      } catch (error) {
        console.error('Error checking YouTube integration:', error);
        toast.error('Failed to check YouTube integration');
      } finally {
        setIsLoading(false);
      }
    };

    fetchYouTubeIntegration();
  }, [router]);

  // Handle video upload submission
  const onSubmit = async (values: YouTubeVideoFormData) => {
    try {
      setIsLoading(true);
      
      // Check YouTube integration again
      const result = await checkYouTubeIntegration();

      if (!result.success) {
        if (result.redirectTo) {
          router.push(result.redirectTo);
        }
        toast.error(result.error || 'Failed to upload video');
        return;
      }

      if (!result.isConnected) {
        toast.error('YouTube account not connected');
        return;
      }

      // Note: This is a simplified implementation
      // In a real application, you would call an upload action here
      // For now, we'll just show a success message
      
      toast.success('Video upload initiated! (This is a test implementation)');
      form.reset(); // Clear the form
      
    } catch (error) {
      console.error('Video upload error:', error);
      toast.error('An error occurred while uploading the video');
    } finally {
      setIsLoading(false);
    }
  };


  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
          <CardHeader className="bg-white/80 backdrop-blur-sm border-b border-gray-100 py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-red-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-600">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">Create YouTube Video</CardTitle>
                <CardDescription className="text-gray-500">
                  Upload and share your videos with the world
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-white p-6 space-y-6">
            {!isYouTubeConnected ? (
              <div className="text-center space-y-6 py-8">
                <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                  <p className="text-red-600 text-lg mb-4">
                    Connect your YouTube account to start uploading videos
                  </p>
                  <YouTubeConnectButton 
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
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex justify-between items-center text-gray-700">
                          <span>Video Title</span>
                          <span className={`text-sm ${titleCount > 100 ? 'text-red-500' : 'text-gray-500'}`}>
                            {titleCount}/100
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your video title"
                            {...field}
                            className="border-2 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 rounded-xl"
                            onChange={(e) => {
                              field.onChange(e);
                              setTitleCount(e.target.value.length);
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex justify-between items-center text-gray-700">
                          <span>Description (Optional)</span>
                          <span className={`text-sm ${descriptionCount > 5000 ? 'text-red-500' : 'text-gray-500'}`}>
                            {descriptionCount}/5000
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your video..."
                            {...field}
                            className="resize-y min-h-[120px] border-2 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 rounded-xl"
                            onChange={(e) => {
                              field.onChange(e);
                              setDescriptionCount(e.target.value.length);
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Video URL</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="url"
                              placeholder="https://example.com/video.mp4"
                              {...field}
                              className="pl-10 border-2 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 rounded-xl"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
                                <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z"></path>
                              </svg>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="privacyStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Privacy Setting</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-2 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 rounded-xl">
                              <SelectValue placeholder="Select privacy setting" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white shadow-lg rounded-xl">
                            <SelectItem value="private" className="hover:bg-red-50 focus:bg-red-50">Private</SelectItem>
                            <SelectItem value="unlisted" className="hover:bg-red-50 focus:bg-red-50">Unlisted</SelectItem>
                            <SelectItem value="public" className="hover:bg-red-50 focus:bg-red-50">Public</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-2 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 rounded-xl">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white shadow-lg rounded-xl max-h-60">
                            {YOUTUBE_CATEGORIES.map((category) => (
                              <SelectItem key={category.id} value={category.id} className="hover:bg-red-50 focus:bg-red-50">
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Tags (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="gaming, tutorial, review (comma separated)"
                            {...field}
                            className="border-2 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                        <p className="text-xs text-gray-500">
                          Separate tags with commas. Good tags help people find your video.
                        </p>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                    disabled={isLoading || titleCount > 100 || descriptionCount > 5000}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </div>
                    ) : (
                      'Upload Video'
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
        
        {/* Decorative background elements */}
        <div className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none z-[-1]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}