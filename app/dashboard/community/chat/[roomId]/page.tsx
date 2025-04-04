import { getSession } from "@/lib/auth-utils"
import { getChatMessages, getChatRooms } from "@/lib/community-actions"
import { redirect } from "next/navigation"
import ChatRoom from "@/components/chat-room"

interface ChatRoomPageProps {
  params: {
    roomId: string
  }
}

export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
  const session = await getSession()

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{currentRoom.name}</h1>
          <p className="text-gray-400">{currentRoom.description}</p>
        </div>
      </div>

      <ChatRoom
        roomId={params.roomId}
        userId={session.userId}
        username={session.username}
        initialMessages={initialMessages}
      />
    </div>
  )
}

