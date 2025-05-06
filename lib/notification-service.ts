'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'message' | 'quest' | 'system';
  read: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationStore {
  notifications: Notification[];
  isFetching: boolean;
  fetchNotifications: (userId: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotifications: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    persist(
      (set, get) => ({
        notifications: [],
        isFetching: false,

        fetchNotifications: async (userId: string) => {
          if (get().isFetching) return; // Cegah fetch ganda
          set({ isFetching: true });
          try {
            console.log(`Zustand fetchNotifications for userId: ${userId}`);
            const response = await fetch(`/api/notifications?userId=${userId}`);
            if (!response.ok) throw new Error('Failed to fetch notifications');
            const data = await response.json();
            set({ notifications: data });
          } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
          } finally {
            set({ isFetching: false });
          }
        },

        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
          };
          set((state) => ({
            notifications: [newNotification, ...state.notifications],
          }));
        },

        markAsRead: async (id: string) => {
          try {
            const response = await fetch(`/api/notifications/${id}`, {
              method: 'PUT',
            });
            if (!response.ok) throw new Error('Failed to mark notification as read');
            set((state) => ({
              notifications: state.notifications.map((notification) =>
                notification.id === id ? { ...notification, read: true } : notification,
              ),
            }));
          } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
          }
        },

        markAllAsRead: async (userId: string) => {
          try {
            const response = await fetch(`/api/notifications`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId }),
            });
            if (!response.ok) throw new Error('Failed to mark all notifications as read');
            set((state) => ({
              notifications: state.notifications.map((notification) =>
                notification.userId === userId ? { ...notification, read: true } : notification,
              ),
            }));
          } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
          }
        },

        deleteNotification: async (id: string) => {
          try {
            const response = await fetch(`/api/notifications/${id}`, {
              method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete notification');
            set((state) => ({
              notifications: state.notifications.filter((notification) => notification.id !== id),
            }));
          } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
          }
        },

        deleteAllNotifications: async (userId: string) => {
          try {
            const response = await fetch(`/api/notifications?userId=${userId}`, {
              method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete all notifications');
            set((state) => ({
              notifications: state.notifications.filter((notification) => notification.userId !== userId),
            }));
          } catch (error) {
            console.error('Error deleting all notifications:', error);
            throw error;
          }
        },
      }),
      {
        name: 'notification-store',
      },
    ),
  ),
);