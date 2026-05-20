"use client";

import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, MessageSquare, Package, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  type Notification,
} from "@/hooks/useNotifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function getIcon(type: string) {
  switch (type) {
    case "enquiry_assigned":
      return <MessageSquare size={14} className="text-blue-500" />;
    case "new_enquiry":
      return <MessageSquare size={14} className="text-green-500" />;
    default:
      return <Bell size={14} className="text-muted-foreground" />;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isUnread = !notification.read_at;

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 border-b border-border/40 last:border-0 transition-colors duration-150",
        isUnread ? "bg-blue-50/50 dark:bg-blue-950/20" : "bg-transparent"
      )}
    >
      <div className="mt-0.5 shrink-0">{getIcon(notification.type)}</div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-xs leading-relaxed", isUnread ? "font-medium text-foreground" : "text-muted-foreground")}>
          {notification.message}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(notification.created_at)}</p>
      </div>
      <div className="flex items-start gap-0.5 shrink-0">
        {isUnread && (
          <button
            onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
            className="p-1 rounded hover:bg-muted transition-colors"
            title="Mark as read"
          >
            <Check size={12} className="text-muted-foreground" />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
          className="p-1 rounded hover:bg-muted transition-colors"
          title="Delete"
        >
          <Trash2 size={12} className="text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: notifData, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotif = useDeleteNotification();

  const notifications: Notification[] = notifData?.data ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
          aria-label="Notifications"
        >
          <Bell size={17} strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0 shadow-xl" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[380px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw size={16} className="animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Bell size={24} strokeWidth={1.5} className="mb-2 opacity-40" />
              <p className="text-xs">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={(id) => markAsRead.mutate(id)}
                onDelete={(id) => deleteNotif.mutate(id)}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
