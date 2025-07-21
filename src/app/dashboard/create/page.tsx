"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

const CreatePostPage = () => {
  const platforms = [
    {
      id: 'twitter',
      name: 'Twitter',
      description: 'Share quick thoughts, updates, and engage in real-time conversations',
      icon: Twitter,
      color: 'from-sky-500 via-blue-500 to-blue-700',
      bgColor: 'bg-white dark:bg-slate-900',
      borderColor: 'border-blue-200 dark:border-blue-700',
      textColor: 'text-blue-700 dark:text-blue-300',
      features: ['Quick tweets', 'Thread creation', 'Real-time updates', 'Trending topics'],
      href: '/dashboard/create/twitter'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Share professional updates, articles, and connect with your network',
      icon: Linkedin,
      color: 'from-sky-500 via-blue-500 to-blue-700',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-600 dark:text-blue-400',
      features: ['Professional posts', 'Article sharing', 'Network engagement', 'Career updates'],
      href: '/dashboard/create/linkedin'
    },
    
  ];

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="relative inline-block">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
            Create Content
          </h1>
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-lg blur opacity-10"></div>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Choose your platform and start creating engaging content for your audience
        </p>
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {platforms.map((platform) => {
          const IconComponent = platform.icon;
          
          return (
            <Card 
              key={platform.id}
              className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${platform.borderColor} ${platform.bgColor} border-2`}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${platform.bgColor} ${platform.borderColor} border`}>
                    <IconComponent className={`h-8 w-8 ${platform.textColor}`} />
                  </div>
                  <div>
                    <CardTitle className={`text-2xl font-bold ${platform.textColor}`}>
                      {platform.name}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  {platform.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Perfect for
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {platform.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${platform.color.includes('blue') ? 'bg-blue-500' : 'bg-gray-500'}`} />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Link href={platform.href} className="block">
                  <Button 
                    className={`w-full bg-blue-600 dark:bg-blue-700 text-white shadow-lg group-hover:bg-gradient-to-r group-hover:from-sky-500 group-hover:via-blue-500 group-hover:to-blue-700 hover:opacity-90 group-hover:opacity-100 group-hover:text-white group-hover:shadow-xl transition-all duration-300`}
                    size="lg"
                  >
                    <span className="font-semibold">Create {platform.name} Post</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Coming Soon Section */}
      <div className="mt-24 text-center">
        <div className="max-w-2xl mx-auto mt-10">
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            More Platforms Coming Soon
          </h3>
          <p className="text-muted-foreground mb-6">
            We're working on adding support for Instagram, Facebook, TikTok, and YouTube. Stay tuned!
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Instagram', 'Facebook', 'TikTok', 'YouTube'].map((platform) => (
              <div 
                key={platform}
                className="px-4 py-2 rounded-full bg-secondary/50 text-secondary-foreground text-sm font-medium border border-secondary"
              >
                {platform}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;