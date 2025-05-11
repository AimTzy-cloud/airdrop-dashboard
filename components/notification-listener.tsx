"use client"

import { useEffect } from "react"
import { useNotificationStore } from "@/lib/notification-store"
import { useToast } from "@/hooks/use-toast"

interface NotificationListenerProps {
  userId: string
  username: string
}

export function NotificationListener({ userId, username }: NotificationListenerProps) {
  const { addNotification } = useNotificationStore()
  const { toast } = useToast()

  useEffect(() => {
    // Socket connection and event listeners removed

    console.log(`NotificationListener active for userId: ${userId}, username: ${username} (Socket disabled)`)

    // Optional: For testing purposes, you can simulate a notification
    // Uncomment the following code if you want to test notifications without socket
    /*
    const simulateNotification = () => {
      const mockNotification: Partial<Notification> = {
        title: "Test Notification",
        content: "This is a simulated notification (socket disabled)",
        type: "system",
      };
      
      // Show toast notification
      toast({
        title: mockNotification.title || "New Notification",
        description: mockNotification.content || "",
        duration: 5000,
      });

      // Add the notification to the store
      addNotification({
        id: Math.random().toString(36).substring(2, 9),
        userId: userId,
        type: mockNotification.type || "system",
        title: mockNotification.title || "New Notification",
        content: mockNotification.content || "",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    };

    // Simulate a notification after 3 seconds
    const timer = setTimeout(simulateNotification, 3000);
    
    return () => clearTimeout(timer);
    */

    // Empty cleanup function since socket listeners were removed
    return () => {}
  }, [userId, username, addNotification, toast])

  return null
}
