"use client";

import { useEffect } from "react";
import { useNotificationStore } from "@/lib/notification-store";
import { useSocket } from "@/hooks/use-socket";
import { useToast } from "@/hooks/use-toast";
import type { Notification } from "@/lib/types";

interface NotificationListenerProps {
  userId: string;
  username: string;
}

export function NotificationListener({ userId, username }: NotificationListenerProps) {
  const { addNotification } = useNotificationStore();
  const { socket, isConnected } = useSocket(userId, username);
  const { toast } = useToast();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for new notifications
    const handleNewNotification = (notification: Partial<Notification>) => {
      console.log("New notification received:", notification);

      // Show toast notification
      toast({
        title: notification.title || "New Notification",
        description: notification.content || "",
        duration: 5000,
      });

      // Play notification sound
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch((err) => console.error("Failed to play notification sound:", err));

      // Add the notification to the store
      addNotification({
        id: notification.id || Math.random().toString(36).substring(2, 9),
        userId: notification.userId || userId,
        type: notification.type || "system",
        title: notification.title || "New Notification",
        content: notification.content || "",
        sourceId: notification.sourceId,
        sourceType: notification.sourceType,
        isRead: false,
        createdAt: notification.createdAt || new Date().toISOString(),
      });
    };

    // Register socket event listeners
    socket.on("new-notification", handleNewNotification);

    // Join user-specific notification channel
    socket.emit("join-notification-channel", { userId });

    console.log(`NotificationListener active for userId: ${userId}, username: ${username}`);

    // Cleanup function
    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [socket, isConnected, userId, username, addNotification, toast]);

  return null;
}