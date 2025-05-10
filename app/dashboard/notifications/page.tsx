"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, Filter, MessageSquare, Trophy, UserPlus, Info, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface Notification {
  _id: string;
  type: "message" | "quest" | "connection" | "system";
  title: string;
  content: string;
  sourceId?: string;
  sourceType?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("type") || "all";

  useEffect(() => {
    setActiveTab(initialTab);
    fetchNotifications(initialTab);
  }, [initialTab]);

  const fetchNotifications = async (type: string) => {
    try {
      setIsLoading(true);
      const queryParam = type !== "all" ? `?type=${type}` : "";
      const response = await fetch(`/api/notifications${queryParam}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        } else {
          setNotifications([]); // Default ke array kosong jika data tidak valid
        }
      } else {
        setNotifications([]); // Default ke array kosong jika respons gagal
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]); // Default ke array kosong pada error
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) => (notification._id === id ? { ...notification, isRead: true } : notification)),
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((notification) => notification._id !== id));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const type = activeTab !== "all" ? activeTab : undefined;
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification._id);

    // Navigate based on notification type
    if (notification.type === "message" && notification.sourceId) {
      router.push(`/dashboard/community/chat/${notification.sourceId}`);
    } else if (notification.type === "quest" && notification.sourceId) {
      router.push(`/dashboard/galxe-admin?quest=${notification.sourceId}`);
    } else if (notification.type === "connection" && notification.sourceId) {
      router.push(`/dashboard/community/users?user=${notification.sourceId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return (
          <div className="bg-gradient-to-br from-blue-600/30 to-blue-500/10 p-3 rounded-full">
            <MessageSquare className="h-5 w-5 text-blue-400" />
          </div>
        );
      case "quest":
        return (
          <div className="bg-gradient-to-br from-emerald-600/30 to-emerald-500/10 p-3 rounded-full">
            <Trophy className="h-5 w-5 text-emerald-400" />
          </div>
        );
      case "connection":
        return (
          <div className="bg-gradient-to-br from-purple-600/30 to-purple-500/10 p-3 rounded-full">
            <UserPlus className="h-5 w-5 text-purple-400" />
          </div>
        );
      default:
        return (
          <div className="bg-gradient-to-br from-slate-600/30 to-slate-500/10 p-3 rounded-full">
            <Info className="h-5 w-5 text-slate-400" />
          </div>
        );
    }
  };

  const getUnreadCount = (type: string) => {
    if (!Array.isArray(notifications)) {
      return 0; // Kembalikan 0 jika notifications bukan array
    }
    if (type === "all") {
      return notifications.filter((n) => !n.isRead).length;
    }
    return notifications.filter((n) => n.type === type && !n.isRead).length;
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="container mx-auto py-8 max-w-4xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-2 rounded-lg">
              <Bell className="h-6 w-6 text-slate-200" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Notifications
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900 hover:bg-slate-800">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/notifications?type=all")}
                  className="hover:bg-slate-800"
                >
                  All
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/notifications?type=message")}
                  className="hover:bg-slate-800"
                >
                  Messages
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/notifications?type=quest")}
                  className="hover:bg-slate-800"
                >
                  Quests
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/notifications?type=connection")}
                  className="hover:bg-slate-800"
                >
                  Connections
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/notifications?type=system")}
                  className="hover:bg-slate-800"
                >
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="border-slate-700 bg-slate-900 hover:bg-slate-800"
            >
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          </div>
        </div>

        <Card className="bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 overflow-hidden">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="grid grid-cols-5 bg-slate-800/50 p-1">
                <TabsTrigger
                  value="all"
                  onClick={() => router.push("/dashboard/notifications?type=all")}
                  className="data-[state=active]:bg-slate-700 relative"
                >
                  All
                  {getUnreadCount("all") > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-blue-500 hover:bg-blue-500 text-[10px] h-5 min-w-5 flex items-center justify-center">
                      {getUnreadCount("all")}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="message"
                  onClick={() => router.push("/dashboard/notifications?type=message")}
                  className="data-[state=active]:bg-slate-700 relative"
                >
                  Messages
                  {getUnreadCount("message") > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-blue-500 hover:bg-blue-500 text-[10px] h-5 min-w-5 flex items-center justify-center">
                      {getUnreadCount("message")}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="quest"
                  onClick={() => router.push("/dashboard/notifications?type=quest")}
                  className="data-[state=active]:bg-slate-700 relative"
                >
                  Quests
                  {getUnreadCount("quest") > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-emerald-500 hover:bg-emerald-500 text-[10px] h-5 min-w-5 flex items-center justify-center">
                      {getUnreadCount("quest")}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="connection"
                  onClick={() => router.push("/dashboard/notifications?type=connection")}
                  className="data-[state=active]:bg-slate-700 relative"
                >
                  Connections
                  {getUnreadCount("connection") > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-purple-500 hover:bg-purple-500 text-[10px] h-5 min-w-5 flex items-center justify-center">
                      {getUnreadCount("connection")}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="system"
                  onClick={() => router.push("/dashboard/notifications?type=system")}
                  className="data-[state=active]:bg-slate-700 relative"
                >
                  System
                  {getUnreadCount("system") > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-slate-500 hover:bg-slate-500 text-[10px] h-5 min-w-5 flex items-center justify-center">
                      {getUnreadCount("system")}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-4 mt-4">
              <ScrollArea className="h-[calc(100vh-250px)] pr-4">
                <TabsContent value={activeTab} className="space-y-4 mt-0">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 border border-slate-800 rounded-lg bg-slate-900/50 backdrop-blur-sm"
                      >
                        <Skeleton className="h-12 w-12 rounded-full bg-slate-800" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4 bg-slate-800" />
                          <Skeleton className="h-3 w-1/2 bg-slate-800" />
                        </div>
                      </div>
                    ))
                  ) : notifications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center p-12 border border-slate-800 rounded-lg bg-slate-900/50 backdrop-blur-sm"
                    >
                      <div className="bg-slate-800/50 p-4 rounded-full inline-block mb-4">
                        <Bell className="h-12 w-12 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-medium mb-2 text-slate-200">No notifications</h3>
                      <p className="text-slate-400">
                        You don&apos;t have any {activeTab !== "all" ? activeTab : ""} notifications yet
                      </p>
                    </motion.div>
                  ) : (
                    notifications.map((notification, index) => (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className={`flex gap-4 p-4 border rounded-lg transition-all cursor-pointer hover:shadow-lg ${
                          !notification.isRead
                            ? "bg-slate-800/80 border-l-4 border-slate-700 border-l-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                            : "bg-slate-900/50 border-slate-800"
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h3
                              className={`text-sm ${!notification.isRead ? "font-medium text-white" : "text-slate-300"}`}
                            >
                              {notification.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full hover:bg-slate-800"
                                  >
                                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                                  {!notification.isRead && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification._id);
                                      }}
                                      className="hover:bg-slate-800"
                                    >
                                      <Check className="h-4 w-4 mr-2 text-blue-400" />
                                      Mark as read
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator className="bg-slate-800" />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification._id);
                                    }}
                                    className="text-red-400 hover:bg-slate-800 hover:text-red-300"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{notification.content}</p>
                          {!notification.isRead && (
                            <div className="mt-2">
                              <Badge
                                variant="outline"
                                className="text-xs border-blue-500/30 text-blue-400 bg-blue-500/10"
                              >
                                New
                              </Badge>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </TabsContent>
              </ScrollArea>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}