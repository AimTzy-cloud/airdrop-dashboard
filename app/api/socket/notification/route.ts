import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Notification } from "@/lib/models/notification"
import { getSessionAppRouter } from "@/lib/auth-utils-app"

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAppRouter()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { userId, type, title, content, sourceId, sourceType } = await req.json()

    // Create notification
    const notification = new Notification({
      userId,
      type,
      title,
      content,
      sourceId,
      sourceType,
      isRead: false,
    })

    await notification.save()

    // In a real implementation, you would emit a socket event here
    // to notify the user in real-time

    return NextResponse.json({
      success: true,
      notification,
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
