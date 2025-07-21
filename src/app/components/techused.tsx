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
            <h2 className="text-2xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">Connect All Your Social Platforms</h2>
            <p className="text-muted-foreground mt-2">Manage your entire social media presence from one dashboard</p>
          </div>
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:gap-x-12">
            {logos.map((logo, index) => (
              logo.tooltip ? (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <div className="hover:brightness-110 transition-all duration-300">
                      <img
                        className={`${logo.height} w-fit max-w-28 transition-transform duration-300 hover:scale-110 ${logo.additionalClasses || ''} cursor-help`}
                        alt={logo.alt}
                        width="auto"
                        src={logo.src}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{logo.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div key={index} className="hover:brightness-110 transition-all duration-300">
                  <img
                    className={`${logo.height} w-fit max-w-28 transition-transform duration-300 hover:scale-110 ${logo.additionalClasses || ''}`}
                    alt={logo.alt}
                    width="auto"
                    src={logo.src}
                  />
                </div>
              )
            ))}
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
};

export default TechnologyUsed;