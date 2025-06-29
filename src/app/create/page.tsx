"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, Clock, ImageIcon, VideoIcon, Upload, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";

const CreatePostPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [scheduleType, setScheduleType] = useState<string>("now");

  // Updated social accounts with correct platform logos
  const socialAccounts = [
    { 
      id: 'youtube', 
      name: 'YouTube', 
      image: '/platforms/youtube.png', 
      initial: 'Y',
      color: 'bg-red-500'
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      image: '/platforms/instagram.png', 
      initial: 'I',
      color: 'bg-pink-500'
    },
    { 
      id: 'x', 
      name: 'X (Twitter)', 
      image: '/platforms/x.png', 
      initial: 'X',
      color: 'bg-black'
    },
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      image: '/platforms/linkedin.png', 
      initial: 'L',
      color: 'bg-blue-600'
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      image: '/platforms/facebook.png', 
      initial: 'F',
      color: 'bg-blue-500'
    },
    { 
      id: 'tiktok', 
      name: 'TikTok', 
      image: '/platforms/tiktok.png', 
      initial: 'T',
      color: 'bg-black'
    }
  ];

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedMedia(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-7xl">
      {/* Beautiful Twitter Post Tool Heading */}
      <div className="text-center mb-12">
        <div className="relative inline-block">
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Twitter Post Tool
          </h1>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-lg blur opacity-20"></div>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create, schedule, and share your thoughts with the world. Craft the perfect tweet with our powerful posting tool.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-muted-foreground">Create New Post</h2>
        <div className="flex gap-4">
          <Button variant="outline">Save Draft</Button>
          <Button>Create Post</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Post Content and Media */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
              <CardDescription>Write your post content here. You can include text, links, and hashtags.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Write your post here... Use #hashtags to increase visibility" 
                rows={6}
                className="min-h-[200px] resize-none"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>Upload an image or video to accompany your post</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedMedia ? (
                <div 
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => document.getElementById('media-upload')?.click()}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">Drag and drop your media here</p>
                      <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
                    </div>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        <span>Image</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <VideoIcon className="h-4 w-4" />
                        <span>Video</span>
                      </div>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    className="sr-only" 
                    id="media-upload" 
                    accept="image/*,video/*"
                    onChange={handleMediaChange}
                  />
                </div>
              ) : (
                <div className="relative">
                  {mediaPreview && (
                    <div className="relative rounded-lg overflow-hidden">
                      {selectedMedia?.type.startsWith('image/') ? (
                        <img 
                          src={mediaPreview} 
                          alt="Preview" 
                          className="w-full h-auto max-h-[400px] object-contain"
                        />
                      ) : (
                        <video 
                          src={mediaPreview} 
                          controls 
                          className="w-full h-auto max-h-[400px]"
                        />
                      )}
                      <button
                        onClick={removeMedia}
                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Scheduling and Accounts */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Post</CardTitle>
              <CardDescription>Choose when you want to publish your post</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={scheduleType} onValueChange={setScheduleType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select scheduling option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Post Now</SelectItem>
                  <SelectItem value="later">Schedule for Later</SelectItem>
                </SelectContent>
              </Select>

              {scheduleType === "later" && (
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <div className="relative">
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date | null) => setSelectedDate(date)}
                        dateFormat="MMMM d, yyyy"
                        minDate={new Date()}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholderText="Select date"
                      />
                      <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <div className="relative">
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date | null) => setSelectedDate(date)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholderText="Select time"
                      />
                      <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Post to Accounts</CardTitle>
              <CardDescription>Select the accounts where you want to publish this post</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialAccounts.map(account => (
                <div key={account.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors">
                  <Checkbox id={`account-${account.id}`} />
                  <Label htmlFor={`account-${account.id}`} className="flex items-center space-x-3 cursor-pointer flex-1">
                    <div className={`relative size-8 rounded-full overflow-hidden ${account.color}`}>
                      <Image
                        src={account.image}
                        alt={account.name}
                        fill
                        className="object-contain p-1.5"
                      />
                    </div>
                    <span className="font-medium">{account.name}</span>
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;