import { getSessionAppRouter } from "@/lib/auth-utils-app"
import { getChatMessages, getChatRooms } from "@/lib/community-actions"
import { redirect } from "next/navigation"
import ChatRoom from "@/components/chat-room"
import { SocketStatus } from "@/components/socket-status"
import { Users, MessageSquare, Calendar, Shield, ChevronLeft, Sparkles } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface ChatRoomPageProps {
  params: {
    roomId: string
  }
}

export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
  const session = await getSessionAppRouter()

  if (!session) {
    redirect("/login?redirect=/dashboard/community/chat")
  }

  // Get the current chat room
  const chatRooms = await getChatRooms()
  const currentRoom = chatRooms.find((r) => r._id === params.roomId)

  if (!currentRoom) {
    redirect("/dashboard/community/chat")
  }

  // Get initial messages
  const initialMessages = await getChatMessages(params.roomId)

  // Calculate member count (for demo purposes)
  const memberCount = currentRoom.memberCount || Math.floor(Math.random() * 50) + 10

  // Get creation date
  const creationDate = currentRoom.createdAt || new Date().toISOString()

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header with blur effect and gradient */}
      <div className="relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-md -z-10" />
        <div className="border-b border-gray-800/60">
          <div className="container mx-auto py-4 px-4 md:px-6">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/dashboard/community/chat">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <span className="text-gray-400 text-sm">Back to Rooms</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-gray-700 ring-2 ring-blue-500/30">
                  <AvatarImage
                    src={currentRoom.avatar || `/placeholder.svg?text=${currentRoom.name.substring(0, 2)}`}
                    alt={currentRoom.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xl">
                    {currentRoom.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-white">{currentRoom.name}</h1>
                    <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-800">
                      <Shield className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                    {/* Tags removed to avoid TypeScript errors */}
                  </div>
                  <p className="text-gray-400 mt-1 max-w-2xl">{currentRoom.description}</p>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Users className="h-4 w-4 text-blue-400" />
                      <span>{memberCount} members</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <MessageSquare className="h-4 w-4 text-green-400" />
                      <span>{initialMessages.length} messages</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      <span>Created {formatDistanceToNow(new Date(creationDate), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">Socket Status:</span>
                </div>
                <SocketStatus userId={session.userId} username={session.username} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat container with flex-grow to fill available space */}
      <div className="flex-grow overflow-hidden px-4 md:px-6 py-4">
        <ChatRoom
          roomId={params.roomId}
          userId={session.userId}
          username={session.username}
          initialMessages={initialMessages}
        />
      </div>
    </div>
  )
}
