"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Home,
  FolderPlus,
  FileText,
  ClipboardList,
  Coins,
  Bell,
  Settings,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  TrendingUp,
  User,
  Search,
  MoreHorizontal,
  Hash,
} from "lucide-react";

// Credits Context for sharing credit balance across components
interface CreditsContextType {
  credits: number;
  refreshCredits: () => Promise<void>;
}

const CreditsContext = createContext<CreditsContextType>({
  credits: 0,
  refreshCredits: async () => {},
});

export const useCredits = () => useContext(CreditsContext);

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  position: string | null;
  skills: string[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Navigation items - Twitter-style
const navItems = [
  { title: "Home", href: "/dashboard", icon: Home },
  { title: "Explore", href: "/dashboard/discover", icon: Hash },
  { title: "Reviews", href: "/dashboard/reviews", icon: ClipboardList, badge: "3" },
  { title: "My Projects", href: "/dashboard/projects", icon: FileText },
  { title: "Notifications", href: "/dashboard/notifications", icon: Bell, badge: "2" },
  { title: "Credits", href: "/dashboard/credits", icon: Coins },
  { title: "Profile", href: "/dashboard/profile", icon: User },
];

// Left Sidebar Navigation
function LeftSidebar({ user }: { user: UserData | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to logout");
    }
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/revlio_logo.png"
            alt="Revlio"
            width={36}
            height={36}
            className="rounded-xl"
          />
          {!isCollapsed && (
            <span className="text-xl font-bold text-sidebar-foreground">
              Revlio
            </span>
          )}
        </Link>
        {!isCollapsed && (
          <p className="mt-2 text-xs text-muted-foreground">
            Build feedback from real makers
          </p>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className="h-11 text-[15px] rounded-2xl data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 dark:data-[active=true]:bg-blue-900/30 dark:data-[active=true]:text-blue-300"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Submit Project Button */}
        {!isCollapsed && (
          <div className="px-2 mt-5">
            <Button asChild className="w-full h-11 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-[15px] shadow-sm">
              <Link href="/dashboard/submit">
                <FolderPlus className="mr-2 h-5 w-5" />
                Submit Project
              </Link>
            </Button>
          </div>
        )}
        {isCollapsed && (
          <div className="px-2 mt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild size="icon" className="w-12 h-12 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Link href="/dashboard/submit">
                      <FolderPlus className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Submit Project</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full p-3 rounded-2xl border border-border/70 hover:bg-sidebar-accent transition-colors">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name || ""} />
                <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm truncate max-w-32">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-32">@{user?.email?.split("@")[0] || "user"}</p>
                  </div>
                  <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile"><User className="mr-2 h-4 w-4" />Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </>
  );
}

// Right Sidebar - Trending & Suggestions
function RightSidebar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { credits } = useCredits();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="hidden lg:flex flex-col w-80 xl:w-96 border border-border/70 p-4 gap-4 sticky top-6 self-start bg-linear-to-b from-background via-background to-muted/30 rounded-3xl">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search projects..." className="pl-10 h-11 rounded-full bg-muted border-none" />
      </div>

      {/* Credits Card */}
      <div className="rounded-3xl bg-amber-50/70 dark:bg-amber-900/20 border border-amber-200/70 dark:border-amber-800/60 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100">Your Credits</h3>
          <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{credits}</p>
        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
          {credits === 0 ? "Review projects to earn credits" : "Use credits to submit projects"}
        </p>
        <Button asChild variant="outline" size="sm" className="mt-3 w-full border-amber-300 dark:border-amber-700">
          <Link href="/dashboard/reviews">Start Reviewing</Link>
        </Button>
      </div>

      {/* Trending Skills */}
      <div className="rounded-3xl bg-card border border-border p-4 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Trending Skills</h3>
        <div className="space-y-3">
          {["Next.js", "React", "TypeScript", "TailwindCSS", "Node.js"].map((skill, i) => (
            <div key={skill} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">#{i + 1} Trending</p>
                <p className="font-medium">{skill}</p>
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-3 text-blue-600 dark:text-blue-400">Show more</Button>
      </div>

      {/* Quick Actions */}
      <div className="rounded-3xl bg-card border border-border p-4 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
        <div className="space-y-2">
          {mounted && (
            <Button variant="ghost" className="w-full justify-start" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </Button>
          )}
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-3xl bg-muted/40 border border-border/60 p-4 text-xs text-muted-foreground">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-foreground">Spotlight</span>
          <Sparkles className="h-4 w-4 text-blue-600" />
        </div>
        <p className="text-sm text-muted-foreground">
          Weekly build challenge: “Micro SaaS landing in 48h”.
        </p>
        <Button asChild size="sm" variant="outline" className="mt-3 w-full">
          <Link href="/dashboard/discover">Join Challenge</Link>
        </Button>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="#" className="hover:underline">Terms</Link>
          <Link href="#" className="hover:underline">Privacy</Link>
          <Link href="#" className="hover:underline">About</Link>
        </div>
        <p className="mt-2">© 2026 Revlio</p>
      </div>
    </aside>
  );
}

// Main Layout Component
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  const refreshCredits = async () => {
    try {
      const res = await fetch("/api/credits?type=balance");
      const data = await res.json();
      if (data.balance !== undefined) {
        setCredits(data.balance);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();

        if (!data.authenticated) {
          router.push("/sign-in");
          return;
        }

        if (!data.user?.onboardingCompleted) {
          router.push("/onboarding");
          return;
        }

        setUser(data.user);
        // Fetch credits after auth check
        refreshCredits();
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/sign-in");
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <CreditsContext.Provider value={{ credits, refreshCredits }}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-linear-to-br from-background via-background to-muted/30">
          {/* Left Sidebar */}
          <Sidebar collapsible="icon" className="border-r border-sidebar-border">
            <LeftSidebar user={user} />
          </Sidebar>

          {/* Main Content - Feed Style */}
          <SidebarInset className="flex-1 overflow-x-hidden">
            <div className="flex w-full max-w-6xl mx-auto gap-6 px-0 sm:px-4 lg:px-6 py-0 sm:py-6">
              {/* Center Feed Column */}
              <main className="flex-1 min-h-screen w-full bg-background/80 shadow-sm lg:rounded-3xl lg:border lg:border-border/70 overflow-x-hidden">
                <div className="lg:p-3">
                  <div className="bg-background lg:rounded-3xl lg:border lg:border-border/60 overflow-hidden w-full">
                    {children}
                  </div>
                </div>
              </main>

              {/* Right Sidebar */}
              <RightSidebar />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </CreditsContext.Provider>
  );
}
