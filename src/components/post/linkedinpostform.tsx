"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, PenLine, Upload } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MediaUploader } from "@/components/post/MediaUploader";
import { Integration } from "@/types";
interface Media {
  url: string;
  type: 'image' | 'video';
  altText?: string;
}

interface LinkedInPostFormProps {
  integration: Integration;
  onPost: (text: string, media: Media[]) => Promise<void>;
}

export function LinkedInPostForm({ integration, onPost }: LinkedInPostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const [activeTab, setActiveTab] = useState("text");
  
  const handleAddMedia = (newMedia: Media) => {
    setMedia((current) => {
      // For LinkedIn, we only allow one media item per post
      return [newMedia];
    });
  };
  
  const handleRemoveMedia = (index: number) => {
    setMedia((current) => current.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (!text.trim() && media.length === 0) {
      toast.error("Please add text or media to your post");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onPost(text, media);
      
      // Reset form
      setText("");
      setMedia([]);
      setActiveTab("text");
      
      toast.success("Post created successfully");
    } catch (error) {
      toast.error("Failed to create post");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenLine className="h-5 w-5 text-blue-600" />
          Create LinkedIn Post
        </CardTitle>
        <CardDescription>
          Create a new post for your LinkedIn profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text">
            <div className="space-y-4">
              <div>
                <Label htmlFor="post-text">Post Content</Label>
                <Textarea
                  id="post-text"
                  placeholder="What would you like to share?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  className="mt-1"
                />
              </div>
              
              {media.length > 0 && (
                <div className="space-y-2">
                  <Label>Media</Label>
                  <div className="flex flex-wrap gap-2">
                    {media.map((item, index) => (
                      <div key={index} className="relative group">
                        {item.type === 'image' ? (
                          <img
                            src={item.url}
                            alt={item.altText || "Post image"}
                            className="h-20 w-20 object-cover rounded-md"
                          />
                        ) : (
                          <video
                            src={item.url}
                            className="h-20 w-20 object-cover rounded-md"
                          />
                        )}
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveMedia(index)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="media">
            <div className="space-y-4">
              <MediaUploader 
                onFileUpload={handleAddMedia}
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                  'video/*': ['.mp4', '.mov', '.avi']
                }}
                maxSize={25 * 1024 * 1024} // 25MB max size for LinkedIn
                maxFiles={1} // LinkedIn allows only one media per post
                existingMedia={media}
              />
              
              <div className="text-sm text-gray-500">
                <ul className="list-disc list-inside space-y-1">
                  <li>Images: PNG, JPG, GIF (Max 25MB)</li>
                  <li>Videos: MP4, MOV (Max 25MB)</li>
                  <li>LinkedIn allows only one media item per post</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <Separator />
      <CardFooter className="pt-4 flex justify-end">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating post...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Post to LinkedIn
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 