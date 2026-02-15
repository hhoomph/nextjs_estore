/**
 * Message Types
 *
 * Type definitions for messaging functionality.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

export interface MessageSender {
  name: string;
  avatar?: string;
  online?: boolean;
}

export interface MessageItem {
  id: string;
  sender: MessageSender;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  type: "support" | "customer" | "marketing" | "system";
}

export interface MessageSidebarProps {
  theme?: "light" | "dark" | "system";
  animations?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "order" | "promotion" | "system" | "security" | "shipping";
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority?: "low" | "medium" | "high";
}

export interface NotificationSidebarProps {
  theme?: "light" | "dark" | "system";
  animations?: boolean;
}
