import type { Server as SocketIOServer } from "socket.io";
import { createNotification } from "./notification-service";
import type { NotificationType } from "@/lib/types";

// Map to track connected users
const connectedUsers = new Map<string, string>(); // userId -> socketId

export function setupNotificationHandlers(io: SocketIOServer) {
  // Store the socket server in global for access from other modules
  globalThis.socketIO = io;

  // Handle new connection
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins notification channel
    socket.on("join-notification-channel", ({ userId, username }) => {
      if (!userId) return;

      console.log(`User ${username} (${userId}) joined notification channel`);

      // Store user connection
      connectedUsers.set(userId, socket.id);

      // Join user-specific room for targeted notifications
      socket.join(`user:${userId}`);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);

      // Remove user from connected users
      // Convert entries to array before iterating
      Array.from(connectedUsers.entries()).forEach(([userId, socketId]) => {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
        }
      });
    });
  });
}

// Send notification to specific user
export async function sendNotificationToUser(
  userId: string,
  title: string,
  content: string,
  type: NotificationType,
  sourceId?: string,
  sourceType?: string,
) {
  try {
    // Create notification in database
    const notificationData = {
      userId,
      title,
      content,
      type,
      sourceId,
      sourceType,
      isRead: false,
    };

    const result = await createNotification(notificationData);

    if (!result.success || !result.data) {
      console.error("Failed to create notification:", result.error);
      return false;
    }

    const notification = result.data;

    // Get socket server instance
    const io = globalThis.socketIO;
    if (!io) {
      console.error("Socket.IO server not initialized");
      return false;
    }

    // Send to user-specific room
    io.to(`user:${userId}`).emit("new-notification", notification);

    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
}

// Broadcast notification to all users
export async function broadcastNotification(
  title: string,
  content: string,
  type: NotificationType = "system",
  sourceId?: string,
  sourceType?: string,
  excludeUserId?: string,
) {
  try {
    // Get socket server instance
    const io = globalThis.socketIO;
    if (!io) {
      console.error("Socket.IO server not initialized");
      return false;
    }

    // For each connected user, create and send notification
    // Convert entries to array before iterating
    for (const [userId, socketId] of Array.from(connectedUsers.entries())) {
      // Skip excluded user
      if (excludeUserId && userId === excludeUserId) continue;

      // Create notification in database
      const notificationData = {
        userId,
        title,
        content,
        type,
        sourceId,
        sourceType,
        isRead: false,
      };

      const result = await createNotification(notificationData);

      if (result.success && result.data) {
        // Send to specific socket
        io.to(socketId).emit("new-notification", result.data);
      }
    }

    return true;
  } catch (error) {
    console.error("Error broadcasting notification:", error);
    return false;
  }
}