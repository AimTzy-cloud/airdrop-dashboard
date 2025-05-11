"use client"

import { useEffect, useState } from "react"
// import io, { type Socket } from "socket.io-client" // Nonaktifkan socket.io
// import type { Notification, SocketMessage, SocketMessageUpdate, SocketTypingData, UserStatus } from "@/lib/types"

// Socket event types
{/*interface ServerToClientEvents {
  "user-connected": (data: { userId: string; username: string }) => void
  "user-disconnected": (data: { userId: string; username: string }) => void
  "user-typing": (data: { userId: string; username: string; isTyping: boolean }) => void
  "user-status-change": (data: { userId: string; status: UserStatus }) => void
  "new-message": (message: SocketMessage) => void
  "message-update": (data: SocketMessageUpdate) => void
  "new-notification": (notification: Partial<Notification>) => void
}*/}

{/*interface ClientToServerEvents {
  "join-room": (roomId: string) => void
  "leave-room": (roomId: string) => void
  typing: (data: SocketTypingData) => void
  "new-message": (message: SocketMessage) => void
  "message-update": (data: SocketMessageUpdate) => void
  "set-status": (status: UserStatus) => void
  "join-notification-channel": (data: { userId: string }) => void
}*/}

type SocketType = null; // Ubah tipe socket menjadi null karena kita nonaktifkan

export function useSocket(userId: string, username: string, roomId?: string) {
  const [socket, setSocket] = useState<SocketType | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!userId || !username) return

    // Nonaktifkan inisialisasi socket
    console.log("Socket.io is disabled to reduce network load");
    setIsConnected(false);
    setSocket(null);

    // Clean up (kosong karena socket dinonaktifkan)
    return () => {};
  }, [userId, username, roomId])

  return { socket, isConnected }
}