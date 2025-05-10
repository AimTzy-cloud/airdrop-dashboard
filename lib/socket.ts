import type { Server as HTTPServer } from "http"
import { Server as SocketIOServer, type Socket } from "socket.io"
import type { DefaultEventsMap } from "socket.io"
import { getSessionAppRouter } from "./auth-utils-app"
import { connectToDatabase } from "./db"
import { User } from "./models/user"
import type { SocketMessage } from "./types"
import { setupNotificationHandlers } from "@/lib/socket-notification"

// Define socket types
interface ServerToClientEvents {
  "user-typing": (data: { userId: string; username: string; isTyping: boolean }) => void
  "new-message": (message: SocketMessage) => void
  "message-update": (data: { messageId: string; update: Partial<SocketMessage> }) => void
  "user-status-change": (data: { userId: string; status: "online" | "away" | "offline" }) => void
  "user-connected": (data: { userId: string; username: string }) => void
  "user-disconnected": (data: { userId: string; username: string }) => void
}

interface ClientToServerEvents {
  "join-room": (roomId: string) => void
  "leave-room": (roomId: string) => void
  typing: (data: { roomId: string; isTyping: boolean }) => void
  "set-status": (status: "online" | "away" | "offline") => void
}

interface SocketData {
  user: {
    userId: string
    username: string
  }
}

type SocketWithAuth = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>

export const initSocket = (server: HTTPServer) => {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>(server, {
    path: "/api/socket",
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  // Authentication middleware
  io.use(async (socket: SocketWithAuth, next) => {
    try {
      const session = await getSessionAppRouter() // Hapus parameter { req }

      if (!session || !session.userId) {
        return next(new Error("Unauthorized"))
      }

      socket.data.user = {
        userId: session.userId,
        username: session.username || "Anonymous",
      }

      next()
    } catch (error: unknown) {
      console.error("Socket authentication error:", error)
      next(new Error("Authentication error"))
    }
  })

  io.on("connection", async (socket: SocketWithAuth) => {
    const userId = socket.data.user.userId
    const username = socket.data.user.username

    console.log(`User connected: ${username} (${userId})`)

    try {
      // Update user status to online
      await connectToDatabase()
      await User.findByIdAndUpdate(userId, {
        status: "online",
        lastActive: new Date(),
      })

      // Broadcast to all clients that user is online
      io.emit("user-status-change", {
        userId,
        status: "online",
      })

      // Join user's personal room for direct messages
      socket.join(`user:${userId}`)

      // Handle joining chat rooms
      socket.on("join-room", (roomId: string) => {
        socket.join(`room:${roomId}`)
        console.log(`${username} joined room: ${roomId}`)
      })

      // Handle leaving chat rooms
      socket.on("leave-room", (roomId: string) => {
        socket.leave(`room:${roomId}`)
        console.log(`${username} left room: ${roomId}`)
      })

      // Handle typing indicators
      socket.on("typing", ({ roomId, isTyping }: { roomId: string; isTyping: boolean }) => {
        socket.to(`room:${roomId}`).emit("user-typing", {
          userId,
          username,
          isTyping,
        })
      })

      // Handle status changes
      socket.on("set-status", async (status: "online" | "away" | "offline") => {
        await User.findByIdAndUpdate(userId, {
          status,
          lastActive: new Date(),
        })

        io.emit("user-status-change", {
          userId,
          status,
        })
      })

      // Handle disconnection
      socket.on("disconnect", async () => {
        console.log(`User disconnected: ${username} (${userId})`)

        // Update user status to offline
        await User.findByIdAndUpdate(userId, {
          status: "offline",
          lastActive: new Date(),
        })

        // Broadcast to all clients that user is offline
        io.emit("user-status-change", {
          userId,
          status: "offline",
        })
      })
    } catch (error: unknown) {
      console.error("Socket error:", error)
    }
  })

  // Setup notification handlers
  setupNotificationHandlers(io)

  return io
}

// Helper function to emit new message event
export const emitNewMessage = (
  io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap>,
  roomId: string,
  message: SocketMessage,
) => {
  io.to(`room:${roomId}`).emit("new-message", message)
}

// Helper function to emit message update event
export const emitMessageUpdate = (
  io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap>,
  roomId: string,
  messageId: string,
  update: Partial<SocketMessage>,
) => {
  io.to(`room:${roomId}`).emit("message-update", { messageId, update })
}
