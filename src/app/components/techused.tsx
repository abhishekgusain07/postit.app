import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TechnologyUsed = () => {
  const logos = [
    {
      name: "Facebook",
      height: "h-12",
      src: "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png",
      alt: "Facebook",
      tooltip: "Facebook"
    },
    {
      name: "Instagram",
      height: "h-12",
      src: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
      alt: "Instagram",
      tooltip: "Instagram"
    },
    {
      name: "LinkedIn",
      height: "h-12",
      src: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
      alt: "LinkedIn",
      tooltip: "LinkedIn"
    },
    {
      name: "Twitter",
      height: "h-12",
      src: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg",
      alt: "Twitter",
      tooltip: "Twitter"
    },
    {
      name: "TikTok",
      height: "h-12",
      src: "https://upload.wikimedia.org/wikipedia/commons/3/34/Ionicons_logo-tiktok.svg",
      alt: "TikTok",
      tooltip: "TikTok"
    },
    {
      name: "Threads",
      height: "h-12",
      src: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Threads_%28app%29_logo.svg",
      alt: "Threads",
      tooltip: "Threads"
    },
    {
      name: "YouTube",
      height: "h-10",
      src: "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
      alt: "YouTube",
      tooltip: "YouTube"
    }
  ];

  return (
    <TooltipProvider>
      <section className="bg-background/50 backdrop-blur-sm py-10 border-t border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
              Connect All Your Social Platforms
            </h2>
            <p className="text-muted-foreground mt-2">
              Manage your entire social media presence from one dashboard
            </p>
          </div>
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-12">
            {logos.map((logo, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div className="group cursor-pointer">
                    <div className="w-16 h-16 flex items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                      <img
                        className="w-full h-full object-contain filter group-hover:brightness-110"
                        alt={logo.alt}
                        src={logo.src}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const sibling = img.nextSibling as HTMLDivElement | null;
                          if (sibling) sibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-full items-center justify-center text-xs font-medium text-slate-500 dark:text-slate-400">
                        {logo.name}
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{logo.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
};

export default TechnologyUsed;