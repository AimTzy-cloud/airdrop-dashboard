"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Notification, NotificationType } from "@/lib/types"

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: (userId: string) => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  deleteAllNotifications: (userId: string) => Promise<void>
  fetchNotifications: (userId: string) => Promise<void>
  clearAll: () => void
  setNotifications: (notifications: Notification[]) => void
  getNotificationsByType: (type: NotificationType) => Notification[]
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        set((state) => {
          // Check if notification with same ID already exists
          const exists = state.notifications.some((n) => n.id === notification.id)
          if (exists) return state

          const newNotifications = [notification, ...state.notifications]
          const newUnreadCount = state.unreadCount + (notification.isRead ? 0 : 1)

          return {
            notifications: newNotifications,
            unreadCount: newUnreadCount,
          }
        })
      },

      markAsRead: async (id) => {
        try {
          // API call to mark notification as read
          const response = await fetch(`/api/notifications/${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ isRead: true }),
          })

          if (!response.ok) {
            throw new Error("Failed to mark notification as read")
          }

          set((state) => {
            const updatedNotifications = state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))

            const newUnreadCount = updatedNotifications.filter((n) => !n.isRead).length

            return {
              notifications: updatedNotifications,
              unreadCount: newUnreadCount,
            }
          })
        } catch (error) {
          console.error("Error marking notification as read:", error)
          throw error
        }
      },

      markAllAsRead: async (userId) => {
        try {
          // API call to mark all notifications as read
          const response = await fetch(`/api/notifications/mark-all-read`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          })

          if (!response.ok) {
            throw new Error("Failed to mark all notifications as read")
          }

          set((state) => ({
            notifications: state.notifications.map((n) => (n.userId === userId ? { ...n, isRead: true } : n)),
            unreadCount: 0,
          }))
        } catch (error) {
          console.error("Error marking all notifications as read:", error)
          throw error
        }
      },

      deleteNotification: async (id) => {
        try {
          // API call to delete notification
          const response = await fetch(`/api/notifications/${id}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            throw new Error("Failed to delete notification")
          }

          set((state) => {
            const notification = state.notifications.find((n) => n.id === id)
            const wasUnread = notification && !notification.isRead

            return {
              notifications: state.notifications.filter((n) => n.id !== id),
              unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
            }
          })
        } catch (error) {
          console.error("Error deleting notification:", error)
          throw error
        }
      },

      deleteAllNotifications: async (userId) => {
        try {
          // API call to delete all notifications
          const response = await fetch(`/api/notifications`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          })

          if (!response.ok) {
            throw new Error("Failed to delete all notifications")
          }

          set((state) => ({
            notifications: state.notifications.filter((n) => n.userId !== userId),
            unreadCount: 0,
          }))
        } catch (error) {
          console.error("Error deleting all notifications:", error)
          throw error
        }
      },

      fetchNotifications: async (userId) => {
        try {
          // API call to fetch notifications
          const response = await fetch(`/api/notifications?userId=${userId}`)

          if (!response.ok) {
            throw new Error("Failed to fetch notifications")
          }

          const data = await response.json()

          set({
            notifications: data.data || [],
            unreadCount: (data.data || []).filter((n: Notification) => !n.isRead).length,
          })
        } catch (error) {
          console.error("Error fetching notifications:", error)
          throw error
        }
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 })
      },

      setNotifications: (notifications) => {
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        })
      },

      getNotificationsByType: (type) => {
        return get().notifications.filter((n) => n.type === type)
      },
    }),
    {
      name: "notification-storage",
    },
  ),
)
