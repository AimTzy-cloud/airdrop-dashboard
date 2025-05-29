export interface Airdrop {
  _id: string
  userId: string
  name: string
  type: "testnet" | "daily" | "quest" | "node" | "retro"
  twitterLink: string
  discordLink: string
  airdropLink?: string
  description?: string
  airdropImageUrl?: string
  guideImageUrl?: string
  createdAt: string
}

export interface User {
  _id: string
  username: string
  password: string
  profilePicture?: string
  bio?: string
  role?: string
  status?: "online" | "offline" | "away"
  lastActive?: Date
  connections?: string[]
  joinedDate?: Date
  createdAt?: string | Date // Tambahkan
  updatedAt?: string | Date
  settings?: {
    theme: string
    notifications: boolean
    language: string
  }
  hasLinkedGoogle?: boolean
  googleId?: string
}

export interface Session {
  userId: string
  username: string
  role?: "admin" | "moderator" | "member"
  profilePicture?: string
}

export interface ChatRoomData {
  _id: string
  name: string
  description: string
  topic: string
  createdAt: Date
  updatedAt: Date
  avatar?: string
  memberCount?: number
  lastMessage?: MessageData
}

export interface MessageData {
  _id: string
  roomId: string
  senderId: string
  senderUsername: string
  content: string
  createdAt: Date
  updatedAt: Date
  attachments?: MessageAttachment[]
  reactions?: MessageReaction[]
  replyTo?: string
  isEdited?: boolean
  isDeleted?: boolean
  deliveryStatus?: "sent" | "delivered" | "read"
}

export interface MessageAttachment {
  type: "image" | "video" | "document" | "audio" | "sticker"
  url: string
  name: string
  filename?: string
  size?: number
  mimeType?: string
  duration?: number
  dimensions?: { width: number; height: number }
}

export interface MessageReaction {
  userId: string
  username: string
  type: string // emoji
  timestamp: Date
}

export interface UserSearchResult {
  _id: string
  username: string
  profilePicture?: string
  status?: "online" | "offline" | "away"
  bio?: string
}

export interface TypingIndicator {
  roomId: string
  userId: string
  username: string
  timestamp: Date
}

export interface VoiceMessage {
  duration: number
  url: string
  waveform?: number[] // Array of amplitude values for waveform visualization
}

// Socket related types
export type UserStatus = "online" | "offline" | "away"

export interface SocketMessage extends MessageData {
  status?: "sending" | "sent" | "delivered" | "read"
}

export interface SocketMessageUpdate {
  messageId: string
  update: {
    content?: string
    isDeleted?: boolean
    reactions?: MessageReaction[]
    deliveryStatus?: "sent" | "delivered" | "read"
  }
}

export interface SocketTypingData {
  userId: string
  username: string
  roomId: string
  isTyping: boolean
}

// New Quest related interfaces
export interface Quest {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: "active" | "inactive"
  reward: string
  rewardAmount: number
  rewardType: "XP" | "TOKEN" | "NFT" | "BADGE"
  link: string
  createdAt: string
  updatedAt: string
  createdBy: string
  participants?: number
  completionRate?: number
}

export interface QuestCompletion {
  id: string
  questId: string
  userId: string
  username: string
  completed: boolean
  completedAt?: string
  updatedAt: string
}

export interface QuestCreateInput {
  name: string
  description: string
  startDate: string
  endDate: string
  status: "active" | "inactive"
  reward: string
  rewardAmount: number
  rewardType: "XP" | "TOKEN" | "NFT" | "BADGE"
  link: string
}

export interface QuestUpdateInput {
  id: string
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  status?: "active" | "inactive"
  reward?: string
  rewardAmount?: number
  rewardType?: "XP" | "TOKEN" | "NFT" | "BADGE"
  link?: string
}

export interface QuestCompletionInput {
  questId: string
  completed: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface MongooseLeanDocument {
  _id: string
  __v: number
  [key: string]: unknown
}

export interface SocketMessage extends MessageData {
  deliveryStatus?: "sent" | "delivered" | "read"
  voiceDuration?: number
  isVoiceMessage?: boolean
  replyToMessage?: MessageData | null
  cryptoTransaction?: {
    type: string
    amount: number
    status: string
    timestamp: Date
  }
}

export interface UserData {
  _id: string
  username: string
  bio?: string
  profilePicture?: string
  role: "admin" | "moderator" | "member"
  status: "online" | "away" | "offline"
  lastActive: Date
  joinedDate: Date
  createdAt: Date
  updatedAt: Date
  settings?: {
    theme?: string
    notifications?: boolean
    language?: string
  }
  connections: string[]
  hasLinkedGoogle?: boolean
  googleId?: string
}

// Notification types
export type NotificationType = "message" | "quest" | "connection" | "system"

export interface Notification {
  id: string
  userId: string
  title: string
  message?: string // For backward compatibility
  content: string
  type: NotificationType
  isRead: boolean
  createdAt: string
  link?: string
  sourceId?: string
  sourceType?: string
}
