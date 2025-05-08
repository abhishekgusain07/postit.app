"use client";

import { NavbarDemo } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarDemo>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-semibold mb-6">About PostAhead</h1>
            
            <div className="prose dark:prose-invert">
              <p className="text-lg mb-6">
                PostAhead is a social media management platform that helps you manage all your social accounts in one place.
              </p>
              
              <h2 className="text-xl font-medium mt-8 mb-4">What you can do with PostAhead:</h2>
              
              <ul className="space-y-3 list-disc pl-5 mb-8">
                <li>Connect multiple social media accounts (Twitter/X, Instagram, TikTok, YouTube, and more)</li>
                <li>Schedule posts across all platforms from a single interface</li>
                <li>Save time by planning your content calendar in advance</li>
                <li>Maintain consistent posting schedules automatically</li>
                <li>Get analytics on your post performance across platforms</li>
              </ul>
              
              <p className="mb-8">
                Our goal is to simplify social media management for creators, businesses, and brands so you can focus on creating great content.
              </p>
              
              <div className="mt-8">
                <Link href="/dashboard">
                  <Button>Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </NavbarDemo>
    </div>
  );
}
