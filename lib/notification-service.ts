import type { Notification, ApiResponse } from "@/lib/types"

// API functions for notifications
export async function getUserNotifications(userId: string): Promise<ApiResponse<Notification[]>> {
  try {
    const response = await fetch(`/api/notifications?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch notifications")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function markNotificationAsRead(id: string): Promise<ApiResponse<Notification>> {
  try {
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

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function deleteNotification(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`/api/notifications/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to delete notification")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error deleting notification:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<ApiResponse<void>> {
  try {
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

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getUnreadNotificationsCount(userId: string): Promise<ApiResponse<number>> {
  try {
    const response = await fetch(`/api/notifications/count?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch unread notifications count")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching unread notifications count:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function createNotification(
  notification: Omit<Notification, "id" | "createdAt">,
): Promise<ApiResponse<Notification>> {
  try {
    const response = await fetch(`/api/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notification),
    })

    if (!response.ok) {
      throw new Error("Failed to create notification")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error creating notification:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
