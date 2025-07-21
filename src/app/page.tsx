"use client";
import { useState, useEffect } from "react";
import { NavbarDemo } from "@/components/navbar";
import Pricing from "@/components/pricing";
import Image from "next/image";
import Link from "next/link";
import ProblemSection from "./components/problem";
import SolutionSection from "./components/solution";
import Footer from "./components/footer";
import TechnologyUsed from "./components/techused";
import Announcement from "./components/announcement";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import type { LucideIcon } from "lucide-react";
import { useFeedbackModal } from "@/hooks/useFeedbackModal";
import { useUser } from "@/hooks/useUser";

export default function Home() {
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const { user } = useUser();
  const { openFeedbackModal, FeedbackModalComponent } = useFeedbackModal(user?.id);
  
  useEffect(() => {
    // Check if the announcement has been dismissed before
    const announcementDismissed = localStorage.getItem('announcement_dismissed');
    if (!announcementDismissed) {
      setShowAnnouncement(true);
    }
  }, []);
  
  const handleAnnouncementDismiss = () => {
    // Store the dismissal in localStorage so it stays dismissed on refresh
    localStorage.setItem('announcement_dismissed', 'true');
    setShowAnnouncement(false);
  };
  
  const announcement = {
    message: "🎉 New: Instagram Reels & Stories scheduling now live! ",
    link: {
      text: "Try it now",
      url: "#feedback"
    },
    emoji: "📱"
  };

  // Handler for the announcement link click
  const handleFeedbackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openFeedbackModal();
  };

  const features: Array<{
    title: string;
    description: string;
    link: string;
    icon?: LucideIcon;
  }> = [
    {
      title: "Multi-Platform Scheduling",
      description:
        "Schedule posts across Instagram, Facebook, Twitter, LinkedIn, YouTube, and TikTok from one unified dashboard.",
      link: "#scheduling",
    },
    {
      title: "Content Calendar",
      description:
        "Visual calendar view to plan your content strategy, see upcoming posts, and maintain consistent posting schedules.",
      link: "#calendar",
    },
    {
      title: "AI-Powered Analytics",
      description:
        "Track engagement metrics, audience growth, and optimal posting times with AI insights to maximize your reach.",
      link: "#analytics",
    },
    {
      title: "Auto-Posting",
      description:
        "Set it and forget it. Our reliable automation ensures your content goes live exactly when you want it to.",
      link: "#automation",
    },
    {
      title: "Content Library",
      description:
        "Organize your media assets, templates, and captions in one place. Reuse successful content with smart suggestions.",
      link: "#library",
    },
    {
      title: "Team Collaboration",
      description:
        "Work together with approval workflows, role-based permissions, and real-time collaboration features.",
      link: "#collaboration",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* <Announcement 
        show={showAnnouncement} 
        message={announcement.message}
        link={announcement.link}
        emoji={announcement.emoji}
        onDismiss={handleAnnouncementDismiss}
        onLinkClick={handleFeedbackClick}
      /> */}
      <NavbarDemo>
        {/* Hero Section */}
        <section className="pt-16 pb-16 px-4 md:px-8 lg:px-16 flex flex-col items-center text-center">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              🚀 Launch Ready Social Media Management
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 leading-tight">
            Schedule, Manage & <br />
            <span className="inline-block mt-1 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400">Grow Your Socials</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
            Streamline your social media presence across all platforms. Schedule posts, track engagement, and grow your audience with our powerful automation tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/dashboard" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
              Start Scheduling Free
            </Link>
            <Link href="#features" className="border-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300">
              See Features
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Instagram • Facebook • Twitter</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>LinkedIn • YouTube • TikTok</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Analytics & Automation</span>
            </div>
          </div>
        </section>
        
        <TechnologyUsed />
        {/* Features Section */}
        <section id="features" className="py-16 px-4 md:px-8 lg:px-16 bg-secondary/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">Powerful Social Media Management</h2>
            <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">Everything you need to manage, schedule, and grow your social media presence across all platforms</p>
            <HoverEffect items={features} />
          </div>
        </section>


        <ProblemSection />

        <SolutionSection />
        {/* Pricing Section */}
        <section className="py-16 px-4 md:px-8 lg:px-16">
          <Pricing />
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">Ready to Transform Your Social Media?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of creators and businesses who've automated their social media success. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/sign-up" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
                Start Free Trial
              </Link>
              <Link href="/demo" className="border-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300">
                Book a Demo
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </section>
        <Footer />
      </NavbarDemo>
      
      {/* Render the feedback modal */}
      <FeedbackModalComponent />
    </div>
  );
}
