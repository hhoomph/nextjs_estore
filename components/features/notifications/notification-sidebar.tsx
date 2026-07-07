/**
 * Notification Sidebar Component
 *
 * Displays user notifications in a slide-out sidebar.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import {
  Bell,
  Check,
  ExternalLink,
  Gift,
  MoreVertical,
  Package,
  Search,
  Settings,
  Shield,
  Truck,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import {
  getThemeAwareBackgroundClasses,
  getThemeAwareBorderClasses,
  getThemeAwareTextClasses,
} from "@/lib/utils/theme-utils";
import type {
  NotificationItem,
  NotificationSidebarProps,
} from "@/types/messages";

// Mock data - in a real app, this would come from an API
const mockNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Order Shipped",
    message: "Your order #1234 has been shipped and is on its way!",
    type: "shipping",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    read: false,
    actionUrl: "/orders/1234",
    priority: "high",
  },
  {
    id: "2",
    title: "New Promotion",
    message: "Get 20% off on winter collection! Limited time offer.",
    type: "promotion",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    read: false,
    actionUrl: "/deals",
    priority: "medium",
  },
  {
    id: "3",
    title: "Security Alert",
    message: "New login detected from Chrome on Windows.",
    type: "security",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
    actionUrl: "/settings/security",
    priority: "high",
  },
  {
    id: "4",
    title: "Order Delivered",
    message: "Your order #1220 has been successfully delivered.",
    type: "order",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    actionUrl: "/orders/1220",
    priority: "medium",
  },
  {
    id: "5",
    title: "Welcome Bonus",
    message: "You've earned 500 points for your first purchase!",
    type: "system",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
    priority: "low",
  },
];

const getNotificationIcon = (type: NotificationItem["type"]) => {
  switch (type) {
    case "order":
    case "shipping":
      return <Package className="h-4 w-4" />;
    case "promotion":
      return <Gift className="h-4 w-4" />;
    case "security":
      return <Shield className="h-4 w-4" />;
    case "system":
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationColor = (
  type: NotificationItem["type"],
  priority: NotificationItem["priority"] = "medium",
) => {
  if (priority === "high") return "text-destructive";
  if (priority === "low") return "text-primary";

  switch (type) {
    case "shipping":
      return "text-success";
    case "promotion":
      return "text-secondary-foreground";
    case "security":
      return "text-warning";
    case "order":
      return "text-primary";
    default:
      return "text-muted-foreground";
  }
};

export function NotificationSidebar({
  theme,
  animations = true,
  open,
  onOpenChange,
}: NotificationSidebarProps & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const { data: session } = useSession();
  const { theme: currentTheme } = useTheme();

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  // Get theme-aware classes
  const bgClasses = getThemeAwareBackgroundClasses();
  const textClasses = getThemeAwareTextClasses();
  const borderClasses = getThemeAwareBorderClasses();

  useEffect(() => {
    // Simulate loading notifications
    const loadNotifications = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setNotifications(mockNotifications);
      setIsLoading(false);
    };

    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (filter) {
      case "unread":
        return !notification.read;
      case "read":
        return notification.read;
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}d ago`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className={`w-full sm:max-w-lg flex flex-col ${bgClasses.light} ${bgClasses.dark} ${borderClasses.light} ${borderClasses.dark}`}
      >
        <SheetHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <SheetTitle
                className={`${textClasses.light} ${textClasses.dark}`}
              >
                Notifications
              </SheetTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <SheetDescription className="sr-only">
            View and manage your notifications
          </SheetDescription>
        </SheetHeader>

        {/* Search and Filter */}
        <div className="shrink-0 space-y-3 px-1 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {[
              { value: "all", label: "All" },
              { value: "unread", label: "Unread" },
              { value: "read", label: "Read" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value as any)}
                className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === tab.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No notifications found
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery || filter !== "all"
                  ? "Try adjusting your search or filter"
                  : "Your notifications will appear here"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-border/50 last:border-b-0 ${
                    !notification.read ? "bg-accent/30" : ""
                  } hover:bg-accent/50 transition-colors`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`p-2 rounded-full bg-muted ${getNotificationColor(notification.type, notification.priority)}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <div className="h-2 w-2 bg-primary rounded-full" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {notification.actionUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() =>
                                window.open(notification.actionUrl, "_blank")
                              }
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          )}
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Mark read
                            </Button>
                          )}
                        </div>
                        {notification.priority === "high" && (
                          <Badge variant="destructive" className="text-xs">
                            High Priority
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
