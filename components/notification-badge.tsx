"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useNotificationStore } from "@/lib/notification-store"
import { getUnreadNotificationsCount } from "@/lib/notification-service"
import type { Notification } from "@/lib/types"

interface NotificationBadgeProps {
  onClick?: () => void
  userId: string
}

export function NotificationBadge({ onClick, userId }: NotificationBadgeProps) {
  const { notifications } = useNotificationStore()
  const [isLoading, setIsLoading] = useState(false)
  const [localUnreadCount, setLocalUnreadCount] = useState(0)

  // Filter notifications for this user and count unread
  const userUnreadCount = notifications.filter((n: Notification) => n.userId === userId && !n.isRead).length

  // Fetch unread count from API
  const fetchUnreadCount = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const response = await getUnreadNotificationsCount(userId)
      if (response.success && typeof response.data === "number") {
        setLocalUnreadCount(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch unread count on mount and when userId changes
  useEffect(() => {
    fetchUnreadCount()

    // Set up polling for unread count (every 30 seconds)
    const intervalId = setInterval(fetchUnreadCount, 30000)

    return () => clearInterval(intervalId)
  }, [userId])

  // Use the greater of local count or store count
  const displayCount = Math.max(userUnreadCount, localUnreadCount)

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("relative text-gray-400 hover:text-white", displayCount > 0 && "text-blue-400 hover:text-blue-300")}
      onClick={onClick}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <Bell className="h-5 w-5" />
        </motion.div>
      ) : (
        <Bell className="h-5 w-5" />
      )}

      <AnimatePresence>
        {displayCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-[10px] font-medium text-white"
          >
            {displayCount > 99 ? "99+" : displayCount}
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
}
