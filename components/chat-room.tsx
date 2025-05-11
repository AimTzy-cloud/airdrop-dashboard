"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { sendMessage } from "@/lib/community-actions"

import type { MessageData, MessageReaction, MessageAttachment } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import {
  ImageIcon,
  Paperclip,
  Send,
  Smile,
  X,
  Film,
  FileText,
  Sticker,
  Mic,
  MoreVertical,
  Check,
  CheckCheck,
  Reply,
  Trash2,
  Forward,
  Copy,
  Star,
  Phone,
  Video,
  Search,
  ChevronLeft,
  Info,
  PauseCircle,
  PlayCircle,
  Download,
  MessageSquare,
  Bitcoin,
  Wallet,
  DollarSign,
  ArrowRightLeft,
  Coins,
  Shield,
  Clock,
  Lock,
  AlertCircle,
  Sparkles,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import EmojiPicker from "./emoji-picker"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { OnlineUsersList } from "./online-users-list"
// Socket import removed

interface ChatRoomProps {
  roomId: string
  userId: string
  username: string
  initialMessages: MessageData[]
}

type MessageStatus = "sending" | "sent" | "delivered" | "read"
type ReactionType = "❤️" | "👍" | "👎" | "😂" | "😮" | "😢" | "🔥" | "🎉"

type CryptoType = "BTC" | "ETH" | "SOL" | "USDT" | "BNB"

interface EnhancedMessageData extends MessageData {
  status?: MessageStatus
  reactions?: MessageReaction[]
  replyTo?: string
  replyToMessage?: EnhancedMessageData | null
  isVoiceMessage?: boolean
  voiceDuration?: number
  isDeleted?: boolean
  cryptoTransaction?: {
    type: CryptoType
    amount: number
    status: "pending" | "completed" | "failed"
    timestamp: Date
  }
}

export default function ChatRoom({ roomId, userId, username, initialMessages }: ChatRoomProps) {
  const [messages, setMessages] = useState<EnhancedMessageData[]>(
    initialMessages.map((msg) => ({
      ...msg,
      status: "read" as MessageStatus,
      reactions: msg.reactions || [],
    })),
  )
  const [messageInput, setMessageInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showMediaOptions, setShowMediaOptions] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<"image" | "video" | "document" | "sticker" | null>(null)
  const [chatBackground, setChatBackground] = useState<string>("pattern2")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<EnhancedMessageData | null>(null)
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [showCryptoOptions, setShowCryptoOptions] = useState(false)
  const [showCryptoDialog, setShowCryptoDialog] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType>("BTC")
  const [cryptoAmount, setCryptoAmount] = useState<number>(0.001)
  const [showEncryptionBanner, setShowEncryptionBanner] = useState(true)
  // const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Socket connection status (mocked)
  const isConnected = true

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Crypto options
  const cryptoOptions = [
    { type: "BTC", name: "Bitcoin", icon: Bitcoin, color: "text-orange-500", bgColor: "bg-orange-500/20" },
    { type: "ETH", name: "Ethereum", icon: Wallet, color: "text-blue-500", bgColor: "bg-blue-500/20" },
    { type: "SOL", name: "Solana", icon: Zap, color: "text-purple-500", bgColor: "bg-purple-500/20" },
    { type: "USDT", name: "Tether", icon: DollarSign, color: "text-green-500", bgColor: "bg-green-500/20" },
    { type: "BNB", name: "Binance Coin", icon: Coins, color: "text-yellow-500", bgColor: "bg-yellow-500/20" },
  ]

  // Backgrounds options
  const backgrounds = {
    default: "bg-[#0a0e17]",
    pattern1: "bg-[url('/chat-bg-pattern1.png')] bg-repeat bg-opacity-10",
    pattern2: "bg-gradient-to-b from-[#0a0e17] to-[#1a1f2e]",
    pattern3: "bg-[#0a0e17] bg-[radial-gradient(#1a2035_1px,transparent_1px)] bg-[length:20px_20px]",
    crypto: "bg-[url('/crypto-chat-bg.jpg')] bg-cover bg-center bg-fixed bg-opacity-20",
    modern: "bg-gradient-to-br from-[#0f172a] via-[#131c2e] to-[#1a1f2e]",
  }

  // Simulated room info
  const roomInfo = {
    name: "Crypto Enthusiasts",
    members: 42,
    description: "A place to discuss crypto trends, airdrops, and investment strategies",
    created: "2023-05-15T10:30:00Z",
    avatar: "/crypto-group.jpg",
  }

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Handle initial scroll and message updates
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Handle file preview
  useEffect(() => {
    if (selectedFile) {
      const fileReader = new FileReader()
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string)
      }
      fileReader.readAsDataURL(selectedFile)
    } else {
      setPreviewUrl(null)
    }
  }, [selectedFile])

  // Handle audio recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording])

  // Handle search highlighting
  useEffect(() => {
    if (searchQuery && messages.length > 0) {
      const results = messages
        .map((msg, index) => (msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ? index : -1))
        .filter((index) => index !== -1)
      setSearchResults(results)
      setCurrentSearchIndex(0)

      if (results.length > 0 && messageContainerRef.current) {
        const messageElement = messageContainerRef.current.children[results[0]] as HTMLElement
        if (messageElement) {
          messageElement.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    } else {
      setSearchResults([])
    }
  }, [searchQuery, messages])

  // Socket event handlers removed

  // Format time for voice messages
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioBlob(audioBlob)
        setAudioUrl(audioUrl)

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Cancel voice recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setAudioBlob(null)
      setAudioUrl(null)
    }
  }

  // Upload file to server (simulated)
  const uploadFile = async (file: File): Promise<string> => {
    // In a real app, you would upload the file to a server or cloud storage
    // For this demo, we'll just create an object URL
    return URL.createObjectURL(file)
  }

  // Send voice message
  const sendVoiceMessage = async () => {
    if (!audioBlob) return

    setIsLoading(true)

    try {
      const content = `[VOICE] (${formatTime(recordingTime)})`
      const result = await sendMessage(roomId, userId, username, content)

      if (result.success && result.message) {
        if (typeof result.message === "object" && result.message !== null) {
          const messageId = result.message._id
          const enhancedMessage: EnhancedMessageData = {
            ...result.message,
            status: "sending",
            reactions: [],
            isVoiceMessage: true,
            voiceDuration: recordingTime,
          }

          setMessages((prev) => [...prev, enhancedMessage])

          // Socket emit removed

          setTimeout(() => {
            setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, status: "sent" } : msg)))

            setTimeout(() => {
              setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, status: "delivered" } : msg)))

              setTimeout(() => {
                setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, status: "read" } : msg)))
              }, 2000)
            }, 1500)
          }, 1000)
        }

        setAudioBlob(null)
        setAudioUrl(null)
      } else {
        toast({
          title: "Error",
          description: "Failed to send voice message. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending voice message:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Play/pause audio
  const toggleAudio = (messageId: string) => {
    const audioElement = audioRefs.current[messageId]

    if (!audioElement) return

    if (isPlaying === messageId) {
      audioElement.pause()
      setIsPlaying(null)
    } else {
      if (isPlaying && audioRefs.current[isPlaying]) {
        audioRefs.current[isPlaying].pause()
      }

      audioElement.play()
      setIsPlaying(messageId)

      audioElement.onended = () => {
        setIsPlaying(null)
      }
    }
  }

  // Handle sending crypto transaction
  const handleSendCryptoTransaction = async () => {
    setShowCryptoDialog(false)

    const content = `[CRYPTO] Sent ${cryptoAmount} ${selectedCrypto}`
    setIsLoading(true)

    try {
      const result = await sendMessage(roomId, userId, username, content)

      if (result.success && result.message) {
        if (typeof result.message === "object" && result.message !== null) {
          const messageId = result.message._id
          const enhancedMessage: EnhancedMessageData = {
            ...result.message,
            status: "sending",
            reactions: [],
            cryptoTransaction: {
              type: selectedCrypto,
              amount: cryptoAmount,
              status: "pending",
              timestamp: new Date(),
            },
          }

          setMessages((prev) => [...prev, enhancedMessage])

          // Socket emit removed

          toast({
            title: "Transaction Initiated",
            description: `Sending ${cryptoAmount} ${selectedCrypto}...`,
          })

          setTimeout(() => {
            setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, status: "sent" } : msg)))

            setTimeout(() => {
              setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, status: "delivered" } : msg)))

              setTimeout(() => {
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg._id === messageId) {
                      return {
                        ...msg,
                        status: "read",
                        cryptoTransaction: {
                          ...msg.cryptoTransaction!,
                          status: "completed",
                        },
                      }
                    }
                    return msg
                  }),
                )

                toast({
                  title: "Transaction Completed",
                  description: `Successfully sent ${cryptoAmount} ${selectedCrypto}`,
                })
              }, 3000)
            }, 1500)
          }, 1000)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to send transaction. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending transaction:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowCryptoOptions(false)
    }
  }

  // Handle sending messages
  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedFile && !audioBlob) || isLoading) return

    setIsLoading(true)

    try {
      let content = messageInput.trim()
      const attachments: MessageAttachment[] = []

      if (replyingTo && typeof replyingTo === "object" && replyingTo._id) {
        content = `[REPLY:${replyingTo._id}] ${content}`
      }

      // Handle file attachment
      if (selectedFile) {
        try {
          const fileUrl = await uploadFile(selectedFile)

          // Create attachment object
          const attachment: MessageAttachment = {
            type: mediaType || "document",
            url: fileUrl,
            name: selectedFile.name,
            size: selectedFile.size,
            mimeType: selectedFile.type,
          }

          // Add dimensions for images and videos
          if (mediaType === "image" || mediaType === "video") {
            // For demo purposes, we'll use placeholder dimensions
            attachment.dimensions = { width: 800, height: 600 }
          }

          // Add duration for videos
          if (mediaType === "video") {
            // For demo purposes, we'll use a placeholder duration
            attachment.duration = 30
          }

          attachments.push(attachment)

          // Add file type to message content
          const fileTypeMessage = `[${mediaType?.toUpperCase()}] ${selectedFile.name}`
          content = content ? `${content}\n${fileTypeMessage}` : fileTypeMessage
        } catch (error) {
          console.error("Error uploading file:", error)
          toast({
            title: "Upload Error",
            description: "Failed to upload file. Please try again.",
            variant: "destructive",
          })
        }
      }

      const result = await sendMessage(roomId, userId, username, content)

      if (result.success && result.message) {
        if (typeof result.message === "object" && result.message !== null) {
          const messageId = result.message._id
          const enhancedMessage: EnhancedMessageData = {
            ...result.message,
            status: "sending",
            reactions: [],
            replyTo: replyingTo && typeof replyingTo === "object" ? replyingTo._id : undefined,
            replyToMessage: replyingTo && typeof replyingTo === "object" ? replyingTo : null,
            attachments: attachments.length > 0 ? attachments : undefined,
          }

          setMessages((prev) => [...prev, enhancedMessage])

          // Socket emit removed

          setTimeout(() => {
            setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, status: "sent" } : msg)))

            setTimeout(() => {
              setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, status: "delivered" } : msg)))

              setTimeout(() => {
                setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, status: "read" } : msg)))
              }, 2000)
            }, 1500)
          }, 1000)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setMessageInput("")
      setSelectedFile(null)
      setPreviewUrl(null)
      setMediaType(null)
      setReplyingTo(null)
      setIsLoading(false)
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }

    // Typing indicator simulation (socket removed)
    if (e.key !== "Enter") {
      // Simulate typing indicator for demo purposes
      const randomUser = ["Alice", "Bob", "Charlie"][Math.floor(Math.random() * 3)]
      if (Math.random() > 0.7 && !typingUsers.includes(randomUser)) {
        setTypingUsers((prev) => [...prev, randomUser])
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((user) => user !== randomUser))
        }, 3000)
      }
    }
  }

  // Handle file selection
  const handleFileSelect = (type: "image" | "video" | "document" | "sticker") => {
    setMediaType(type)

    let acceptedTypes = ""
    switch (type) {
      case "image":
        acceptedTypes = "image/*"
        break
      case "video":
        acceptedTypes = "video/*"
        break
      case "document":
        acceptedTypes = ".pdf,.doc,.docx,.txt"
        break
      case "sticker":
        acceptedTypes = "image/png,image/webp"
        break
    }

    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptedTypes
      fileInputRef.current.click()
    }
  }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    const file = files?.[0]
    if (file) {
      setSelectedFile(file)
      setShowMediaOptions(false)
    }
  }

  // Handle emoji selection
  const handleEmojiSelect = (emoji: { native: string }) => {
    setMessageInput((prev) => prev + emoji.native)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Add reaction to message
  const addReaction = (messageId: string, reaction: ReactionType) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg._id === messageId) {
          const existingReactionIndex = msg.reactions?.findIndex((r) => r.userId === userId && r.type === reaction)

          if (existingReactionIndex !== undefined && existingReactionIndex >= 0) {
            const updatedReactions = [...(msg.reactions || [])]
            updatedReactions.splice(existingReactionIndex, 1)
            return { ...msg, reactions: updatedReactions }
          } else {
            const updatedReactions = [
              ...(msg.reactions || []),
              { userId, username, type: reaction, timestamp: new Date() },
            ]
            // Socket emit removed
            return { ...msg, reactions: updatedReactions }
          }
        }
        return msg
      }),
    )
  }

  // Delete message
  const deleteMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg._id === messageId) {
          // Socket emit removed
          return { ...msg, content: "This message was deleted", isDeleted: true } as EnhancedMessageData
        }
        return msg
      }),
    )

    toast({
      title: "Message deleted",
      description: "Message was deleted successfully",
    })
  }

  // Navigate search results
  const navigateSearch = (direction: "next" | "prev") => {
    if (searchResults.length === 0) return

    const newIndex =
      direction === "next"
        ? (currentSearchIndex + 1) % searchResults.length
        : (currentSearchIndex - 1 + searchResults.length) % searchResults.length

    setCurrentSearchIndex(newIndex)

    if (messageContainerRef.current) {
      const messageElement = messageContainerRef.current.children[searchResults[newIndex]] as HTMLElement
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  // Get message status icon
  const getStatusIcon = (status?: MessageStatus) => {
    switch (status) {
      case "sending":
        return <div className="h-3 w-3 rounded-full border-2 border-t-transparent border-gray-400 animate-spin" />
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-400" />
      default:
        return null
    }
  }

  // Parse message content for special formats
  const parseMessageContent = (message: EnhancedMessageData) => {
    if (message.isDeleted) {
      return <span className="italic text-gray-400">This message was deleted</span>
    }

    let content = message.content

    // Handle attachments
    if (message.attachments && message.attachments.length > 0) {
      const attachment = message.attachments[0]

      if (attachment.type === "image") {
        return (
          <div className="space-y-2">
            <div className="rounded-lg overflow-hidden border border-gray-700 max-w-xs">
              <Image
                src={attachment.url || "/placeholder.svg"}
                alt={attachment.name || "Image"}
                width={attachment.dimensions?.width || 400}
                height={attachment.dimensions?.height || 300}
                className="w-full h-auto object-cover"
              />
            </div>
            {content.replace(/\[IMAGE\].*$/m, "").trim() && (
              <div className="text-sm">{content.replace(/\[IMAGE\].*$/m, "").trim()}</div>
            )}
          </div>
        )
      } else if (attachment.type === "video") {
        return (
          <div className="space-y-2">
            <div className="rounded-lg overflow-hidden border border-gray-700 max-w-xs">
              <video src={attachment.url} controls className="w-full h-auto max-h-60" poster="/video-thumbnail.jpg" />
            </div>
            {content.replace(/\[VIDEO\].*$/m, "").trim() && (
              <div className="text-sm">{content.replace(/\[VIDEO\].*$/m, "").trim()}</div>
            )}
          </div>
        )
      } else if (attachment.type === "document") {
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-700 bg-gray-800/50 max-w-xs">
              <FileText className="h-8 w-8 text-orange-400" />
              <div className="overflow-hidden">
                <div className="text-sm font-medium truncate">{attachment.name}</div>
                <div className="text-xs text-gray-400">
                  {(attachment.size && Math.round(attachment.size / 1024)) || 0} KB
                </div>
              </div>
              <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="ml-auto">
                <Download className="h-4 w-4 text-gray-400 hover:text-white" />
              </a>
            </div>
            {content.replace(/\[DOCUMENT\].*$/m, "").trim() && (
              <div className="text-sm">{content.replace(/\[DOCUMENT\].*$/m, "").trim()}</div>
            )}
          </div>
        )
      } else if (attachment.type === "sticker") {
        return (
          <div className="space-y-2">
            <div className="max-w-[120px] max-h-[120px]">
              <Image
                src={attachment.url || "/placeholder.svg"}
                alt="Sticker"
                width={120}
                height={120}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        )
      }
    }

    if (content.startsWith("[REPLY:")) {
      const endIndex = content.indexOf("]")
      if (endIndex > 0) {
        content = content.substring(endIndex + 1).trim()
      }
    }

    if (content.includes("[CRYPTO]")) {
      const transactionInfo = message.cryptoTransaction
      const cryptoType = transactionInfo?.type || "BTC"
      const cryptoAmount = transactionInfo?.amount || 0
      const status = transactionInfo?.status || "pending"

      const CryptoIcon = cryptoOptions.find((c) => c.type === cryptoType)?.icon || Bitcoin
      const cryptoColor = cryptoOptions.find((c) => c.type === cryptoType)?.color || "text-orange-500"
      const cryptoBgColor = cryptoOptions.find((c) => c.type === cryptoType)?.bgColor || "bg-orange-500/20"

      return (
        <div className="space-y-3">
          <div className={`p-3 rounded-lg ${cryptoBgColor} border border-${cryptoColor.replace("text-", "")}/30`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-full ${cryptoBgColor}`}>
                <CryptoIcon className={`h-5 w-5 ${cryptoColor}`} />
              </div>
              <div>
                <div className="font-medium text-white">Crypto Transaction</div>
                <div className="text-xs text-gray-300">{cryptoType} Transfer</div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-300">Amount</div>
              <div className={`font-medium ${cryptoColor}`}>
                {cryptoAmount} {cryptoType}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-300">Status</div>
              <div className="flex items-center gap-1">
                {status === "pending" ? (
                  <>
                    <Clock className="h-3.5 w-3.5 text-yellow-400" />
                    <span className="text-yellow-400 text-sm">Pending</span>
                  </>
                ) : status === "completed" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-green-400 text-sm">Completed</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                    <span className="text-red-400 text-sm">Failed</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-sm">{content.replace(/\[CRYPTO\].*$/m, "").trim()}</div>
        </div>
      )
    }

    if (content.includes("[IMAGE]")) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-300">
            <ImageIcon className="h-4 w-4" />
            <span className="text-sm">Image attachment</span>
          </div>
          <div className="text-sm">{content.replace(/\[IMAGE\].*$/m, "").trim()}</div>
        </div>
      )
    } else if (content.includes("[VIDEO]")) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-purple-300">
            <Film className="h-4 w-4" />
            <span className="text-sm">Video attachment</span>
          </div>
          <div className="text-sm">{content.replace(/\[VIDEO\].*$/m, "").trim()}</div>
        </div>
      )
    } else if (content.includes("[DOCUMENT]")) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-orange-300">
            <FileText className="h-4 w-4" />
            <span className="text-sm">Document attachment</span>
          </div>
          <div className="text-sm">{content.replace(/\[DOCUMENT\].*$/m, "").trim()}</div>
        </div>
      )
    } else if (content.includes("[STICKER]")) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-green-300">
            <Sticker className="h-4 w-4" />
            <span className="text-sm">Sticker</span>
          </div>
          <div className="text-sm">{content.replace(/\[STICKER\].*$/m, "").trim()}</div>
        </div>
      )
    } else if (content.includes("[VOICE]")) {
      const durationMatch = content.match(/$$([0-9]+:[0-9]+)$$/)
      const duration = durationMatch ? durationMatch[1] : "0:00"

      return (
        <div className="flex items-center gap-3 min-w-[180px]">
          <button onClick={() => toggleAudio(message._id)} className="flex-shrink-0">
            {isPlaying === message._id ? (
              <PauseCircle className="h-8 w-8 text-blue-400" />
            ) : (
              <PlayCircle className="h-8 w-8 text-blue-400" />
            )}
          </button>

          <div className="flex-1">
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all",
                  isPlaying === message._id ? "animate-progress" : "",
                )}
                style={{ width: isPlaying === message._id ? "100%" : "0%" }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>{duration}</span>
              <audio
                ref={(el) => {
                  if (el) audioRefs.current[message._id] = el
                }}
                src="/demo-voice-message.mp3"
                preload="metadata"
                className="hidden"
              />
            </div>
          </div>

          <button className="text-gray-400 hover:text-white">
            <Download className="h-4 w-4" />
          </button>
        </div>
      )
    }

    return content
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] rounded-lg border border-gray-700 overflow-hidden shadow-xl">
      {/* Chat header */}
      <div className="bg-gradient-to-r from-[#1a1f2e] to-[#1a2035] border-b border-gray-700/50 p-3 flex justify-between items-center backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-gray-700 ring-2 ring-blue-500/20">
            <AvatarImage src={roomInfo.avatar || "/placeholder.svg"} alt={roomInfo.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              {roomInfo.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white">{roomInfo.name}</h3>
              <Badge variant="outline" className="text-xs bg-blue-900/30 text-blue-300 border-blue-800">
                {roomInfo.members} members
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {typingUsers.length > 0 ? (
                <p className="text-xs text-blue-400 flex items-center">
                  <span className="flex gap-0.5 mr-1">
                    <span className="animate-bounce delay-0">.</span>
                    <span className="animate-bounce delay-150">.</span>
                    <span className="animate-bounce delay-300">.</span>
                  </span>
                  {typingUsers.join(", ")} typing
                </p>
              ) : (
                <p className="text-xs text-gray-400">{isConnected ? "Online" : "Connecting..."}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-800/50"
            onClick={() => setIsSearching(!isSearching)}
          >
            <Search className="h-5 w-5" />
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800/50">
                  <Phone className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Voice call</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800/50">
                  <Video className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Video call</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            size="icon"
            className={cn("text-gray-400 hover:text-white hover:bg-gray-800/50", showInfo && "bg-gray-800 text-white")}
            onClick={() => setShowInfo(!showInfo)}
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Encryption banner */}
      <AnimatePresence>
        {showEncryptionBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-blue-800/50"
          >
            <div className="p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-blue-900/50 p-1 rounded-full">
                  <Lock className="h-4 w-4 text-blue-300" />
                </div>
                <p className="text-xs text-blue-300">
                  Messages and crypto transactions in this chat are secured with end-to-end encryption
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-blue-300 hover:text-white hover:bg-blue-800/50"
                onClick={() => setShowEncryptionBanner(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search bar */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#1a1f2e] border-b border-gray-700 overflow-hidden"
          >
            <div className="p-2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400"
                onClick={() => {
                  setIsSearching(false)
                  setSearchQuery("")
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in conversation..."
                  className="w-full bg-gray-800 text-white rounded-lg pl-3 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-400">
                {searchResults.length > 0 && (
                  <>
                    <span>
                      {currentSearchIndex + 1}/{searchResults.length}
                    </span>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-white"
                        onClick={() => navigateSearch("prev")}
                        disabled={searchResults.length <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-white"
                        onClick={() => navigateSearch("next")}
                        disabled={searchResults.length <= 1}
                      >
                        <ChevronLeft className="h-4 w-4 rotate-180" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat info sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages container */}
        <div
          ref={messageContainerRef}
          className={cn(
            "flex-1 overflow-y-auto p-4 space-y-4",
            chatBackground === "default"
              ? backgrounds.default
              : chatBackground === "pattern1"
                ? "bg-[#0a0e17] bg-opacity-80 bg-[radial-gradient(#1a2035_1px,transparent_1px)] bg-[length:20px_20px]"
                : chatBackground === "pattern2"
                  ? backgrounds.pattern2
                  : chatBackground === "pattern3"
                    ? "bg-[#0a0e17] bg-[linear-gradient(to_right,#1a2035_1px,transparent_1px),linear-gradient(to_bottom,#1a2035_1px,transparent_1px)] bg-[size:20px_20px]"
                    : chatBackground === "crypto"
                      ? "bg-[url('/crypto-chat-bg.jpg')] bg-cover bg-center bg-fixed bg-opacity-20"
                      : backgrounds.modern,
          )}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3 bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg">
                <div className="mx-auto bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-full p-3 w-16 h-16 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-white">No messages yet</h3>
                <p className="text-gray-400 max-w-xs">
                  Be the first to start the conversation in this crypto community!
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const isCurrentUser = message.senderId === userId
              const showAvatar =
                !isCurrentUser && (!messages[index - 1] || messages[index - 1].senderId !== message.senderId)
              const isHighlighted = searchResults.includes(index) && searchQuery !== ""
              const hasCryptoTransaction = message.content.includes("[CRYPTO]") || message.cryptoTransaction

              return (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex",
                    isCurrentUser ? "justify-end" : "justify-start",
                    isHighlighted && "bg-blue-500/20 rounded-lg px-2 py-1 -mx-2",
                  )}
                >
                  <div className={cn("flex items-end gap-2", isCurrentUser && "flex-row-reverse")}>
                    {showAvatar ? (
                      <Avatar className="h-8 w-8 flex-shrink-0 border border-gray-700">
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs">
                          {message.senderUsername.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 flex-shrink-0" />
                    )}

                    <div
                      className={cn(
                        "group relative max-w-[80%] md:max-w-[70%] rounded-lg p-3 shadow-md",
                        isCurrentUser
                          ? hasCryptoTransaction
                            ? "bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 text-white rounded-tr-none"
                            : "bg-gradient-to-r from-blue-600/30 to-blue-500/30 border border-blue-500/30 text-white rounded-tr-none"
                          : hasCryptoTransaction
                            ? "bg-gradient-to-r from-gray-800/90 to-gray-800/80 border border-gray-700 text-gray-100 rounded-tl-none"
                            : "bg-gray-800/80 border border-gray-700 text-gray-100 rounded-tl-none",
                        message.isDeleted && "bg-opacity-50",
                      )}
                    >
                      {message.replyToMessage && (
                        <div
                          className={cn(
                            "mb-2 p-2 rounded border-l-2 text-xs",
                            isCurrentUser ? "bg-blue-700/30 border-blue-400" : "bg-gray-700/50 border-gray-500",
                          )}
                        >
                          <div className="font-medium text-blue-300 mb-1">{message.replyToMessage.senderUsername}</div>
                          <div className="line-clamp-2 opacity-80">
                            {message.replyToMessage.content.replace(/\[REPLY:[^\]]+\]\s*/, "")}
                          </div>
                        </div>
                      )}

                      {!isCurrentUser && !message.isDeleted && (
                        <div className="text-xs font-medium text-blue-400 mb-1">{message.senderUsername}</div>
                      )}

                      <div className="whitespace-pre-wrap break-words font-chat">{parseMessageContent(message)}</div>

                      <div className="flex items-center justify-end gap-1 mt-1 text-xs text-gray-400">
                        <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
                        {isCurrentUser && getStatusIcon(message.status)}
                      </div>

                      {message.reactions && message.reactions.length > 0 && (
                        <div
                          className={cn(
                            "absolute -bottom-3 flex items-center gap-1 px-2 py-1 rounded-full bg-gray-800 border border-gray-700 shadow-lg",
                            isCurrentUser ? "right-2" : "left-2",
                          )}
                        >
                          {Array.from(new Set(message.reactions.map((r) => r.type))).map((type) => {
                            const count = message.reactions?.filter((r) => r.type === type).length || 0
                            return (
                              <div key={type} className="flex items-center">
                                <span>{type}</span>
                                {count > 1 && <span className="text-xs ml-1">{count}</span>}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      <div
                        className={cn(
                          "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity",
                          isCurrentUser ? "-left-10" : "-right-10",
                        )}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-800/50"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align={isCurrentUser ? "start" : "end"}
                            className="w-48 bg-[#1a1f2e] border-gray-700"
                          >
                            <DropdownMenuItem
                              className="flex items-center cursor-pointer"
                              onClick={() => setReplyingTo(message)}
                            >
                              <Reply className="mr-2 h-4 w-4" />
                              <span>Reply</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="flex items-center cursor-pointer">
                              <Forward className="mr-2 h-4 w-4" />
                              <span>Forward</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="flex items-center cursor-pointer">
                              <Copy className="mr-2 h-4 w-4" />
                              <span>Copy</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="flex items-center cursor-pointer">
                              <Star className="mr-2 h-4 w-4" />
                              <span>Star message</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-gray-700" />

                            {isCurrentUser && (
                              <DropdownMenuItem
                                className="flex items-center text-red-400 hover:text-red-300 cursor-pointer"
                                onClick={() => deleteMessage(message._id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div
                        className={cn(
                          "absolute -top-3 opacity-0 group-hover:opacity-100 transition-opacity",
                          isCurrentUser ? "right-2" : "left-2",
                        )}
                      >
                        <div className="flex items-center gap-1 bg-gray-800 rounded-full border border-gray-700 p-1 shadow-lg">
                          {["👍", "❤️", "😂", "😮", "🔥"].map((emoji) => (
                            <button
                              key={emoji}
                              className="hover:bg-gray-700 rounded-full p-1 transition-colors"
                              onClick={() => addReaction(message._id, emoji as ReactionType)}
                            >
                              <span className="text-sm">{emoji}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat info panel */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-gray-700 bg-[#1a1f2e] overflow-hidden"
            >
              <div className="p-4 space-y-6 h-full overflow-y-auto">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-3 border-2 border-gray-700 ring-4 ring-blue-500/20">
                    <AvatarImage src={roomInfo.avatar || "/placeholder.svg"} alt={roomInfo.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xl">
                      {roomInfo.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-medium text-white">{roomInfo.name}</h3>
                  <p className="text-sm text-gray-400">Created on {new Date(roomInfo.created).toLocaleDateString()}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">About</h4>
                  <p className="text-sm text-gray-400">{roomInfo.description}</p>
                </div>

                <OnlineUsersList
                  userId={userId}
                  username={username}
                  className="bg-gray-800/50 rounded-lg border border-gray-700"
                />

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Customize Chat</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Chat Background</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setChatBackground("default")}
                          className={cn(
                            "h-12 rounded border border-gray-700 transition-all",
                            backgrounds.default,
                            chatBackground === "default" ? "ring-2 ring-blue-500" : "",
                          )}
                        />
                        <button
                          onClick={() => setChatBackground("pattern1")}
                          className={cn(
                            "h-12 rounded border border-gray-700 transition-all",
                            "bg-[#0a0e17] bg-opacity-80 bg-[radial-gradient(#1a2035_1px,transparent_1px)] bg-[length:20px_20px]",
                            chatBackground === "pattern1" ? "ring-2 ring-blue-500" : "",
                          )}
                        />
                        <button
                          onClick={() => setChatBackground("pattern2")}
                          className={cn(
                            "h-12 rounded border border-gray-700 transition-all",
                            "bg-gradient-to-b from-[#0a0e17] to-[#1a1f2e]",
                            chatBackground === "pattern2" ? "ring-2 ring-blue-500" : "",
                          )}
                        />
                        <button
                          onClick={() => setChatBackground("pattern3")}
                          className={cn(
                            "h-12 rounded border border-gray-700 transition-all",
                            "bg-[#0a0e17] bg-[linear-gradient(to_right,#1a2035_1px,transparent_1px),linear-gradient(to_bottom,#1a2035_1px,transparent_1px)] bg-[size:20px_20px]",
                            chatBackground === "pattern3" ? "ring-2 ring-blue-500" : "",
                          )}
                        />
                        <button
                          onClick={() => setChatBackground("crypto")}
                          className={cn(
                            "h-12 rounded border border-gray-700 transition-all bg-cover bg-center",
                            "bg-[url('/crypto-chat-bg.jpg')]",
                            chatBackground === "crypto" ? "ring-2 ring-blue-500" : "",
                          )}
                        />
                        <button
                          onClick={() => setChatBackground("modern")}
                          className={cn(
                            "h-12 rounded border border-gray-700 transition-all",
                            "bg-gradient-to-br from-[#0f172a] via-[#131c2e] to-[#1a1f2e]",
                            chatBackground === "modern" ? "ring-2 ring-blue-500" : "",
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Crypto Features</h4>
                  <div className="space-y-2">
                    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-3 border border-blue-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">End-to-End Encrypted</span>
                      </div>
                      <p className="text-xs text-gray-400">All messages and transactions are securely encrypted</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-3 border border-green-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-green-300">Crypto Transactions</span>
                      </div>
                      <p className="text-xs text-gray-400">Send and receive crypto directly in chat</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Members ({roomInfo.members})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs">
                              {["JD", "BK", "ET", "SW", "CK"][i]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm text-white">
                              {["John Doe", "BitcoinKing", "EthTrader", "SolanaWhale", "CryptoKing"][i]}
                            </div>
                            <div className="text-xs text-gray-400">
                              {["Admin", "Moderator", "Member", "Member", "Member"][i]}
                            </div>
                          </div>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Media</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Dialog key={i}>
                        <DialogTrigger asChild>
                          <button className="aspect-square bg-gray-800 rounded overflow-hidden border border-gray-700">
                            <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          </button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1a1f2e] border-gray-700">
                          <div className="aspect-video bg-gray-800 rounded flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                          </div>
                          <div className="text-sm text-gray-400 mt-2">Shared media will appear here</div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reply indicator */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-800 border-t border-gray-700 p-2 flex items-start justify-between"
          >
            <div className="flex items-start gap-2">
              <Reply className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-blue-400">Replying to {replyingTo?.senderUsername}</div>
                <div className="text-xs text-gray-400 line-clamp-1">
                  {replyingTo?.content.replace(/\[REPLY:[^\]]+\]\s*/, "")}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-white"
              onClick={() => setReplyingTo(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media preview */}
      {previewUrl && (
        <div className="p-2 bg-gray-800 border-t border-gray-700">
          <div className="relative inline-block">
            <div className="relative group">
              {mediaType === "image" || mediaType === "sticker" ? (
                <Image
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="h-20 w-auto rounded border border-gray-600"
                />
              ) : mediaType === "video" ? (
                <div className="h-20 w-32 rounded border border-gray-600 bg-gray-700 flex items-center justify-center">
                  <Film className="h-8 w-8 text-gray-400" />
                </div>
              ) : (
                <div className="h-20 w-32 rounded border border-gray-600 bg-gray-700 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <button
                onClick={() => {
                  setSelectedFile(null)
                  setPreviewUrl(null)
                  setMediaType(null)
                }}
                className="absolute -top-2 -right-2 bg-gray-700 rounded-full p-1 hover:bg-gray-600"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
            {selectedFile && (
              <div className="mt-1 text-xs text-gray-400 max-w-[120px] truncate">{selectedFile.name}</div>
            )}
          </div>
        </div>
      )}

      {/* Voice recording UI */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-800 border-t border-gray-700 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-50" />
                  <div className="relative h-3 w-3 bg-red-500 rounded-full" />
                </div>
                <div className="text-sm font-medium text-white">Recording... {formatTime(recordingTime)}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={cancelRecording}>
                  Cancel
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={stopRecording}>
                  Stop
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio preview */}
      <AnimatePresence>
        {audioUrl && !isRecording && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-800 border-t border-gray-700 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const audio = new Audio(audioUrl)
                    audio.play()
                  }}
                  className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center"
                >
                  <PlayCircle className="h-5 w-5 text-white" />
                </button>
                <div>
                  <div className="text-sm font-medium text-white">Voice message</div>
                  <div className="text-xs text-gray-400">{formatTime(recordingTime)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => {
                    setAudioBlob(null)
                    setAudioUrl(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={sendVoiceMessage}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crypto transaction dialog */}
      <Dialog open={showCryptoDialog} onOpenChange={setShowCryptoDialog}>
        <DialogContent className="bg-[#1a1f2e] border-gray-700 max-w-md">
          <DialogTitle className="text-white">Send Crypto</DialogTitle>
          <DialogDescription className="text-gray-400">
            Send cryptocurrency directly through this chat
          </DialogDescription>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="crypto-type" className="text-gray-300">
                Select Cryptocurrency
              </Label>
              <Tabs
                value={selectedCrypto}
                onValueChange={(value) => setSelectedCrypto(value as CryptoType)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-5 bg-gray-800 border border-gray-700">
                  {cryptoOptions.map((crypto) => (
                    <TabsTrigger key={crypto.type} value={crypto.type} className="data-[state=active]:bg-gray-700">
                      <crypto.icon className={`h-4 w-4 ${crypto.color}`} />
                    </TabsTrigger>
                  ))}
                </TabsList>

                {cryptoOptions.map((crypto) => (
                  <TabsContent key={crypto.type} value={crypto.type} className="mt-2">
                    <div
                      className={`p-3 rounded-lg ${crypto.bgColor} border border-${crypto.color.replace("text-", "")}/30 flex items-center gap-3`}
                    >
                      <div className={`p-2 rounded-full ${crypto.bgColor}`}>
                        <crypto.icon className={`h-6 w-6 ${crypto.color}`} />
                      </div>
                      <div>
                        <div className="font-medium text-white">{crypto.name}</div>
                        <div className="text-xs text-gray-300">Current balance: 1.245 {crypto.type}</div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-300">
                Amount
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="amount"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={cryptoAmount}
                  onChange={(e) => setCryptoAmount(Number.parseFloat(e.target.value))}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <div className="text-sm font-medium text-white">{selectedCrypto}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Transaction Fee</Label>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">Network Fee</div>
                <div className="text-sm text-white">0.0001 {selectedCrypto}</div>
              </div>
            </div>

            <div className="pt-2">
              <Label className="text-gray-300">Speed</Label>
              <Slider defaultValue={[50]} max={100} step={1} className="my-4" />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Slower</span>
                <span>Faster</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCryptoDialog(false)} className="border-gray-700">
              Cancel
            </Button>
            <Button
              onClick={handleSendCryptoTransaction}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Send {cryptoAmount} {selectedCrypto}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message input */}
      <div className="bg-[#1a1f2e] border-t border-gray-700/50 p-3">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white p-3 pr-10 resize-none h-12 max-h-32 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500 font-chat"
              style={{ minHeight: "48px" }}
              disabled={isRecording}
            />
            <div className="absolute right-2 bottom-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                    <Smile className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 bg-[#1a1f2e] border-gray-700">
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isRecording && !audioUrl && messageInput.trim() === "" && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white hover:bg-gray-800/50"
                        onClick={() => setShowCryptoOptions(!showCryptoOptions)}
                      >
                        <Bitcoin className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Send crypto</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <AnimatePresence>
                  {showCryptoOptions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute bottom-16 right-16 bg-gray-800 rounded-lg border border-gray-700 shadow-xl p-2 z-10"
                    >
                      <div className="grid grid-cols-3 gap-2">
                        {cryptoOptions.map((crypto) => (
                          <Button
                            key={crypto.type}
                            variant="ghost"
                            className={`flex flex-col items-center gap-1 h-auto py-2 ${crypto.bgColor} hover:bg-opacity-80`}
                            onClick={() => {
                              setSelectedCrypto(crypto.type as CryptoType)
                              setShowCryptoDialog(true)
                              setShowCryptoOptions(false)
                            }}
                          >
                            <crypto.icon className={`h-6 w-6 ${crypto.color}`} />
                            <span className="text-xs text-white">{crypto.type}</span>
                          </Button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white hover:bg-gray-800/50"
                        onClick={startRecording}
                      >
                        <Mic className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Record voice message</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}

            {!isRecording && !audioUrl && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-white hover:bg-gray-800/50"
                      onClick={() => setShowMediaOptions(!showMediaOptions)}
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Attach files</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {(!isRecording && !audioUrl && messageInput.trim() !== "") || selectedFile ? (
              <Button
                onClick={handleSendMessage}
                disabled={(!messageInput.trim() && !selectedFile) || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full h-10 w-10 flex items-center justify-center"
              >
                <Send className="h-5 w-5" />
              </Button>
            ) : null}
          </div>
        </div>

        {/* Hidden file input */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

        {/* Media options */}
        <AnimatePresence>
          {showMediaOptions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-2 p-2 bg-gray-800 rounded-lg border border-gray-700 flex gap-2"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 hover:text-blue-300"
                      onClick={() => handleFileSelect("image")}
                    >
                      <ImageIcon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Send image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-purple-900/30 text-purple-400 hover:bg-purple-900/50 hover:text-purple-300"
                      onClick={() => handleFileSelect("video")}
                    >
                      <Film className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Send video</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-orange-900/30 text-orange-400 hover:bg-orange-900/50 hover:text-orange-300"
                      onClick={() => handleFileSelect("document")}
                    >
                      <FileText className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Send document</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-green-900/30 text-green-400 hover:bg-green-900/50 hover:text-green-300"
                      onClick={() => handleFileSelect("sticker")}
                    >
                      <Sticker className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Send sticker</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
