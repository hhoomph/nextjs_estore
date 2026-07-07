/**
 * Message Sidebar Component
 *
 * Displays user messages and conversations in a slide-out sidebar.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import {
  Info,
  MessageCircle,
  MoreVertical,
  Phone,
  Search,
  Send,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
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
import type { MessageItem, MessageSidebarProps } from "@/types/messages";

// Mock data - in a real app, this would come from an API
const mockMessages: MessageItem[] = [
  {
    id: "1",
    sender: {
      name: "Support Team",
      avatar: "/avatars/support.png",
      online: true,
    },
    lastMessage: "Your order #1234 has been shipped!",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    unreadCount: 2,
    type: "support",
  },
  {
    id: "2",
    sender: {
      name: "Sarah Johnson",
      avatar: "/avatars/sarah.png",
      online: false,
    },
    lastMessage: "Thanks for the quick delivery! ⭐⭐⭐⭐⭐",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    unreadCount: 0,
    type: "customer",
  },
  {
    id: "3",
    sender: {
      name: "Marketing Team",
      avatar: "/avatars/marketing.png",
      online: true,
    },
    lastMessage: "New winter collection is now available!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unreadCount: 1,
    type: "marketing",
  },
];

export function MessageSidebar({
  theme,
  animations = true,
  open,
  onOpenChange,
}: MessageSidebarProps & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const { data: session } = useSession();
  const { theme: currentTheme } = useTheme();

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen;
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [newMessage, setNewMessage] = useState("");

  // Get theme-aware classes
  const bgClasses = getThemeAwareBackgroundClasses();
  const textClasses = getThemeAwareTextClasses();
  const borderClasses = getThemeAwareBorderClasses();

  useEffect(() => {
    // Simulate loading messages
    const loadMessages = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessages(mockMessages);
      setIsLoading(false);
    };

    if (isOpen) {
      loadMessages();
    }
  }, [isOpen]);

  const filteredMessages = messages.filter(
    (message) =>
      message.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const unreadCount = messages.reduce(
    (total, msg) => total + msg.unreadCount,
    0,
  );
  const selectedMessage = messages.find((msg) => msg.id === selectedMessageId);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedMessageId) return;

    // In a real app, this would send the message via API
    console.log(
      "Sending message:",
      newMessage,
      "to conversation:",
      selectedMessageId,
    );
    setNewMessage("");
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
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
              <MessageCircle className="h-5 w-5 text-primary" />
              <SheetTitle
                className={`${textClasses.light} ${textClasses.dark}`}
              >
                Messages
              </SheetTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SheetDescription className="sr-only">
            View and manage your messages and conversations
          </SheetDescription>
        </SheetHeader>

        {/* Search */}
        <div className="shrink-0 px-1 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Messages List */}
          <div
            className={`flex-1 ${selectedMessageId ? "hidden sm:block" : ""}`}
          >
            <ScrollArea className="h-full">
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
              ) : filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No messages found
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Your messages will appear here"}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredMessages.map((message) => (
                    <button
                      key={message.id}
                      onClick={() => setSelectedMessageId(message.id)}
                      className={`w-full p-4 text-left hover:bg-accent transition-colors border-b border-border/50 last:border-b-0 ${
                        selectedMessageId === message.id ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={message.sender.avatar}
                              alt={message.sender.name}
                            />
                            <AvatarFallback>
                              {message.sender.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {message.sender.online && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-success border-2 border-background rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {message.sender.name}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mb-1">
                            {message.lastMessage}
                          </p>
                          {message.unreadCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {message.unreadCount} new
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Message Detail */}
          {selectedMessageId && selectedMessage && (
            <div
              className={`flex-1 flex flex-col border-l border-border ${selectedMessageId ? "block" : "hidden sm:flex"}`}
            >
              {/* Message Header */}
              <div className="shrink-0 p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedMessageId(null)}
                    className="sm:hidden"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={selectedMessage.sender.avatar}
                        alt={selectedMessage.sender.name}
                      />
                      <AvatarFallback>
                        {selectedMessage.sender.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-sm">
                        {selectedMessage.sender.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedMessage.sender.online ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Mock conversation */}
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedMessage.sender.avatar} />
                      <AvatarFallback>
                        {selectedMessage.sender.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-accent rounded-lg p-3 max-w-xs">
                        <p className="text-sm">{selectedMessage.lastMessage}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(selectedMessage.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* User message */}
                  <div className="flex gap-3 justify-end">
                    <div className="flex-1 max-w-xs">
                      <div className="bg-primary text-primary-foreground rounded-lg p-3 ml-auto">
                        <p className="text-sm">Thank you for the update!</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 text-right">
                        Just now
                      </p>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image || ""} />
                      <AvatarFallback>
                        {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="shrink-0 p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
