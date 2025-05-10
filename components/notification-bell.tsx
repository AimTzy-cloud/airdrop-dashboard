"use client"

import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotificationStore } from "@/lib/notification-store" // Impor Notification dari store
import { Notification } from "@/lib/types"
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/notification-service"

interface NotificationBellProps {
  userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotificationStore(); // Hapus userId dari sini
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch notifications when component mounts
  useEffect(() => {
    const loadNotifications = async () => {
      if (!userId) return

      setLoading(true)
      try {
        await fetchNotifications(userId); // Gunakan fetchNotifications dari store
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications();
  }, [userId, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await markNotificationAsRead(notificationId)
      if (response.success) {
        await markAsRead(notificationId) // Panggil markAsRead dari store
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllNotificationsAsRead(userId)
      if (response.success) {
        await markAllAsRead(userId) // Panggil markAllAsRead dari store dengan userId
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const formatDate = (date: Date | string) => {
    if (!date) return ""

    const d = typeof date === "string" ? new Date(date) : date

    // Check if date is valid
    if (isNaN(d.getTime())) return ""

    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 60) return "just now"
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHour < 24) return `${diffHour}h ago`
    if (diffDay < 7) return `${diffDay}d ago`

    return d.toLocaleDateString()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={handleToggleDropdown}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Notifikasi</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Tandai semua sebagai dibaca
                </Button>
              )}
            </div>

            <div className="mt-2 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                </div>
              ) : notifications.length > 0 ? (
                <ul className="space-y-2">
                  {notifications.map((notification: Notification) => (
                    <li
                      key={notification.id}
                      className={`rounded-md p-3 ${
                        !notification.isRead ? "bg-blue-50 dark:bg-blue-900/20" : "bg-gray-50 dark:bg-gray-700/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{notification.content}</p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="ml-2 h-6 w-6 rounded-full p-0"
                          >
                            <span className="sr-only">Tandai sebagai dibaca</span>
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-4 text-center text-gray-500 dark:text-gray-400">Tidak ada notifikasi</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}