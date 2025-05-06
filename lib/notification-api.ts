'use client';

import type { Notification } from '@/lib/notification-service';

// Base URL for API calls
const API_BASE_URL = '/api/notifications';

// Fetch all notifications for a user
export async function fetchNotifications(userId: string): Promise<Notification[]> {
  try {
    const response = await fetch(`${API_BASE_URL}?userId=${userId}`);
    if (!response.ok) {
      throw new Error(`Error fetching notifications: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
}

// Mark a notification as read
export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error marking notification as read: ${response.status}`);
    }
  } catch (error) {
    console.error(`Failed to mark notification ${id} as read:`, error);
    throw error;
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      throw new Error(`Error marking all notifications as read: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
}

// Delete a notification
export async function deleteNotification(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error deleting notification: ${response.status}`);
    }
  } catch (error) {
    console.error(`Failed to delete notification ${id}:`, error);
    throw error;
  }
}

// Delete all notifications
export async function deleteAllNotifications(userId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}?userId=${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error deleting all notifications: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to delete all notifications:', error);
    throw error;
  }
}