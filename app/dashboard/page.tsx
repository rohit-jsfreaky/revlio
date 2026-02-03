"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  ClipboardList,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Heart,
  Repeat2,
  Share,
  Image as ImageIcon,
  LinkIcon,
  Tag,
  Zap,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

import { SidebarTrigger } from "@/components/ui/sidebar";

interface UserData {
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

// Composer component for submitting projects
function PostComposer({ user }: { user: UserData | null }) {
  const [content, setContent] = useState("");

  return (
    <div className="p-2 sm:p-4 border-b border-border">
      <div className="rounded-xl sm:rounded-3xl border border-border bg-card/60 p-2 sm:p-4 shadow-sm">
        <div className="flex items-start sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">Build Update</p>
              <p className="text-xs text-muted-foreground hidden sm:block">Share progress, ask for feedback, or drop a link.</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-[10px] sm:text-xs shrink-0">
            Live
          </Badge>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
          <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name || ""} />
          <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="What did you ship today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-16 sm:min-h-20 border border-border/60 rounded-xl sm:rounded-2xl resize-none text-sm sm:text-base bg-background/80 placeholder:text-muted-foreground focus-visible:ring-0 px-3 sm:px-4 py-2 sm:py-3"
            />
            <div className="flex items-center justify-between mt-2 sm:mt-3 gap-2">
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                  <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                  <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                  <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
              <Button asChild size="sm" className="rounded-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-3 sm:px-5 text-xs sm:text-sm">
                <Link href="/dashboard/submit">Publish</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tabs for switching between feed views
function FeedTabs({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const tabs = [
    { id: "for-you", label: "Pulse" },
    { id: "following", label: "Circle" },
    { id: "trending", label: "Momentum" },
  ];

  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border">
      <div className="p-3 sm:p-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <SidebarTrigger className="lg:hidden h-8 w-8 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold">Build Stream</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Real-time updates</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          <Activity className="h-4 w-4" />
          <span>124 updates today</span>
        </div>
      </div>
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mock project data for the feed
const mockProjects = [
  {
    id: 1,
    author: { name: "Sarah Chen", handle: "sarahchen", avatar: null },
    title: "TaskFlow - AI-Powered Task Manager",
    description: "Built a task management app that uses AI to automatically prioritize and categorize your tasks. Features natural language input and smart scheduling.",
    url: "https://taskflow.demo",
    skills: ["Next.js", "OpenAI", "Prisma"],
    stats: { comments: 12, likes: 45, reposts: 8 },
    time: "2h",
    needsFeedback: true,
  },
  {
    id: 2,
    author: { name: "Alex Rivera", handle: "alexr", avatar: null },
    title: "CodeSnap - Beautiful Code Screenshots",
    description: "Create stunning code screenshots for social media and documentation. Supports syntax highlighting for 50+ languages and custom themes.",
    url: "https://codesnap.io",
    skills: ["React", "Canvas API", "TypeScript"],
    stats: { comments: 8, likes: 32, reposts: 5 },
    time: "5h",
    needsFeedback: false,
  },
  {
    id: 3,
    author: { name: "Jordan Lee", handle: "jordanl", avatar: null },
    title: "DevPulse - Developer Analytics Dashboard",
    description: "Track your GitHub activity, contributions, and productivity metrics. Beautiful visualizations and weekly reports to help you improve.",
    url: "https://devpulse.app",
    skills: ["Vue.js", "D3.js", "Node.js"],
    stats: { comments: 23, likes: 89, reposts: 15 },
    time: "1d",
    needsFeedback: true,
  },
];

// Project card in feed style
function ProjectFeedCard({ project }: { project: typeof mockProjects[0] }) {
  return (
    <article className="p-2 sm:p-4">
      <div className="rounded-2xl sm:rounded-3xl border border-border bg-card/70 p-3 sm:p-4 hover:shadow-sm transition-shadow">
        <div className="flex gap-2 sm:gap-3">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
          <AvatarImage src={project.author.avatar || undefined} />
          <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white text-sm">
            {project.author.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap text-sm">
              <span className="font-semibold hover:underline cursor-pointer">{project.author.name}</span>
              <span className="text-muted-foreground text-xs sm:text-sm">@{project.author.handle}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground text-xs sm:text-sm">{project.time}</span>
              {project.needsFeedback && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-[10px] sm:text-xs">
                  Feedback
                </Badge>
              )}
            </div>

            {/* Content */}
            <h3 className="font-semibold text-sm sm:text-base mt-1.5 sm:mt-2">{project.title}</h3>
            <p className="text-foreground/90 mt-1 leading-relaxed text-sm">{project.description}</p>

            {/* Link preview */}
            <Link
              href={project.url}
              target="_blank"
              className="mt-3 block border border-border rounded-2xl overflow-hidden hover:bg-muted/50 transition-colors"
            >
              <div className="p-3 flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-blue-600 dark:text-blue-400">{project.url}</span>
              </div>
            </Link>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mt-3">
              {project.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs rounded-full">
                  {skill}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 max-w-md">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <span className="text-sm">{project.stats.comments}</span>
              </button>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30">
                  <Repeat2 className="h-4 w-4" />
                </div>
                <span className="text-sm">{project.stats.reposts}</span>
              </button>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-rose-50 dark:group-hover:bg-rose-900/30">
                  <Heart className="h-4 w-4" />
                </div>
                <span className="text-sm">{project.stats.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30">
                  <Share className="h-4 w-4" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

// Empty state for new users
function EmptyState() {
  return (
    <div className="p-8 text-center">
      <div className="rounded-full bg-blue-50 dark:bg-blue-900/30 p-4 mb-4 w-fit mx-auto">
        <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Welcome to Revlio!</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        Start by reviewing other projects to earn credits. Then submit your own project to get guaranteed feedback from the community.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild>
          <Link href="/dashboard/reviews">
            <ClipboardList className="mr-2 h-4 w-4" />
            Start Reviewing
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/discover">
            <Sparkles className="mr-2 h-4 w-4" />
            Explore Projects
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("for-you");
  const [showEmptyState, setShowEmptyState] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();

        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="border-b border-border p-4">
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b border-border p-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* Feed Tabs */}
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Composer */}
      <PostComposer user={user} />

      {/* Feed */}
      <div className="flex flex-col gap-2 pb-8">
        {showEmptyState ? (
          <EmptyState />
        ) : (
          mockProjects.map((project) => (
            <ProjectFeedCard key={project.id} project={project} />
          ))
        )}
      </div>
    </div>
  );
}
