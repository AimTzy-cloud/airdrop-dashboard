"use client"

import { useEffect, useState } from "react"
import io, { type Socket } from "socket.io-client"
import type { Notification, SocketMessage, SocketMessageUpdate, SocketTypingData, UserStatus } from "@/lib/types"

// Socket event types
interface ServerToClientEvents {
  "user-connected": (data: { userId: string; username: string }) => void
  "user-disconnected": (data: { userId: string; username: string }) => void
  "user-typing": (data: { userId: string; username: string; isTyping: boolean }) => void
  "user-status-change": (data: { userId: string; status: UserStatus }) => void
  "new-message": (message: SocketMessage) => void
  "message-update": (data: SocketMessageUpdate) => void
  "new-notification": (notification: Partial<Notification>) => void
}

interface ClientToServerEvents {
  "join-room": (roomId: string) => void
  "leave-room": (roomId: string) => void
  typing: (data: SocketTypingData) => void
  "new-message": (message: SocketMessage) => void
  "message-update": (data: SocketMessageUpdate) => void
  "set-status": (status: UserStatus) => void
  "join-notification-channel": (data: { userId: string }) => void
}

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>

export function useSocket(userId: string, username: string, roomId?: string) {
  const [socket, setSocket] = useState<SocketType | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!userId || !username) return

    // Initialize socket connection
    const socketInit = async () => {
      // Make sure the socket server is running
      await fetch("/api/socket")

      const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || "", {
        path: "/api/socket",
        auth: {
          userId,
          username,
          roomId,
        },
      }) as SocketType

      // Set up event listeners
      socketInstance.on("connect", () => {
        console.log("Socket connected")
        setIsConnected(true)

        // Join room if roomId is provided
        if (roomId) {
          socketInstance.emit("join-room", roomId)
        }
      })

      socketInstance.on("disconnect", () => {
        console.log("Socket disconnected")
        setIsConnected(false)
      })

      setSocket(socketInstance)
    }

    socketInit()

    // Clean up on unmount
    return () => {
      if (socket) {
        if (roomId) {
          socket.emit("leave-room", roomId)
        }
        socket.disconnect()
      }
    }
  }, [userId, username, roomId, socket])

  return { socket, isConnected }
}
