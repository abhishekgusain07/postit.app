"use client";

import { Plug, PlusCircle, User, LogOut, ChevronUp, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";

// Menu items
const items = [
  {
    title: "Connect",
    url: "/dashboard/connect",
    icon: Plug,
    description: "Manage social media accounts",
  },
  {
    title: "Create",
    url: "/dashboard/create", 
    icon: PlusCircle,
    description: "Create and schedule posts",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    try {
      await authClient.signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLogoutLoading(false);
    }
  };

  const handleProfileClick = async () => {
    setIsProfileLoading(true);
    setIsPopoverOpen(false);
    try {
      await router.push("/profile");
    } finally {
      setIsProfileLoading(false);
    }
  };
  return (
    <Sidebar className="border-r border-purple-100 dark:border-purple-900/30 bg-gradient-to-b from-white via-purple-50/30 to-pink-50/20 dark:from-slate-950 dark:via-purple-950/20 dark:to-pink-950/10">
      <SidebarHeader className="border-b border-purple-100 dark:border-purple-900/30 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/30 dark:to-pink-950/30">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/20" onClick={() => router.push("/")}>
            <span className="text-lg font-bold text-white">P</span>
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              PostAhead
            </h2>
            <p className="text-xs text-muted-foreground">Social Management</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold tracking-wider uppercase text-purple-600 dark:text-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 rounded-lg border border-purple-100 dark:border-purple-900/30">
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-4">
            <SidebarMenu className="space-y-2">
              {items.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url);
                const IconComponent = item.icon;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                        isActive 
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40" 
                          : "hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/50 dark:hover:to-pink-950/50 hover:shadow-md border border-transparent hover:border-purple-100 dark:hover:border-purple-900/30"
                      }`}
                      size="lg"
                    >
                      <Link href={item.url} className="flex items-center gap-4 px-4 py-3">
                        {/* Gradient background for active state */}
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-pink-600/90 rounded-xl" />
                        )}
                        
                        {/* Icon container */}
                        <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
                          isActive 
                            ? "bg-white/20 text-white" 
                            : "bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-600 dark:text-purple-400 group-hover:from-purple-200 group-hover:to-pink-200 dark:group-hover:from-purple-800/50 dark:group-hover:to-pink-800/50"
                        }`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        
                        {/* Text content */}
                        <div className="relative z-10 flex-1 min-w-0">
                          <div className={`font-semibold text-sm transition-colors duration-300 ${
                            isActive ? "text-white" : "text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-300"
                          }`}>
                            {item.title}
                          </div>
                          <div className={`text-xs transition-colors duration-300 truncate ${
                            isActive ? "text-white/80" : "text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                          }`}>
                            {item.description}
                          </div>
                        </div>
                        
                        {/* Active indicator */}
                        {isActive && (
                          <div className="relative z-10 w-2 h-2 rounded-full bg-white shadow-sm" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-purple-100 dark:border-purple-900/30 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/30 dark:to-pink-950/30">
        <div className="px-4 py-3">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/30 dark:border-purple-800/30 hover:from-purple-200/60 hover:to-pink-200/60 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 transition-all duration-300 h-auto"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-semibold shadow-sm">
                  U
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    User Dashboard
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Manage your account
                  </p>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-64 p-4 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 shadow-xl"
              align="end"
              side="top"
            >
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                  onClick={handleProfileClick}
                  disabled={isProfileLoading}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30">
                    {isProfileLoading ? (
                      <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                    ) : (
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {isProfileLoading ? "Opening profile..." : "Profile"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      View your profile
                    </p>
                  </div>
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                  onClick={handleLogout}
                  disabled={isLogoutLoading}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30">
                    {isLogoutLoading ? (
                      <Loader2 className="h-4 w-4 text-red-600 dark:text-red-400 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {isLogoutLoading ? "Logging out..." : "Logout"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Sign out of your account
                    </p>
                  </div>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}