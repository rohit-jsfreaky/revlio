"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, MessageCircle, Heart, Repeat2, UserPlus, Star, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock notifications
const mockNotifications = [
  {
    id: 1,
    type: "feedback",
    user: { name: "Sarah Chen", avatar: null },
    action: "left feedback on",
    target: "TaskFlow - AI Task Manager",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "like",
    user: { name: "Alex Rivera", avatar: null },
    action: "liked your project",
    target: "DevPulse Analytics",
    time: "5 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "follow",
    user: { name: "Jordan Lee", avatar: null },
    action: "started following you",
    target: null,
    time: "1 day ago",
    read: true,
  },
  {
    id: 4,
    type: "review",
    user: { name: "Morgan Taylor", avatar: null },
    action: "is requesting your review on",
    target: "CodeSnap - Code Screenshots",
    time: "2 days ago",
    read: true,
  },
];

function getNotificationIcon(type: string) {
  switch (type) {
    case "feedback":
      return <MessageCircle className="h-5 w-5 text-blue-600" />;
    case "like":
      return <Heart className="h-5 w-5 text-red-500" />;
    case "follow":
      return <UserPlus className="h-5 w-5 text-green-600" />;
    case "review":
      return <Star className="h-5 w-5 text-amber-500" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
}

function NotificationItem({ notification }: { notification: typeof mockNotifications[0] }) {
  return (
    <div
      className={`flex gap-3 p-4 border-b border-border hover:bg-muted/30 transition-colors ${
        !notification.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
      }`}
    >
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={notification.user.avatar || undefined} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
          {notification.user.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-semibold">{notification.user.name}</span>{" "}
          <span className="text-muted-foreground">{notification.action}</span>
          {notification.target && (
            <span className="font-medium"> {notification.target}</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
      </div>
      <div className="flex items-center">
        {getNotificationIcon(notification.type)}
        {!notification.read && (
          <div className="ml-2 h-2 w-2 rounded-full bg-blue-600" />
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications =
    filter === "unread"
      ? mockNotifications.filter((n) => !n.read)
      : mockNotifications;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">Notifications</h1>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative hover:bg-muted/50 ${
              filter === "all" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            All
            {filter === "all" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative hover:bg-muted/50 ${
              filter === "unread" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Unread
            <Badge className="ml-2 bg-blue-600 text-white text-xs">2</Badge>
            {filter === "unread" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-1">No notifications</h3>
            <p className="text-sm text-muted-foreground">
              {filter === "unread"
                ? "You're all caught up!"
                : "When you get notifications, they'll show up here."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>
    </div>
  );
}
