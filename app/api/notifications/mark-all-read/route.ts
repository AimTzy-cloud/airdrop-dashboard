import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Notification } from "@/lib/models/notification"
import { getSessionAppRouter } from "@/lib/auth-utils-app"

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAppRouter()

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      )
    }

    await connectToDatabase()

    const { userId, type } = await req.json()
    const targetUserId = userId || session.userId

    // Only allow users to mark their own notifications as read
    // or admins to mark any user's notifications
    if (targetUserId !== session.userId && session.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied",
        },
        { status: 403 },
      )
    }

    const query: Record<string, unknown> = { userId: targetUserId }

    if (type) {
      query.type = type
    }

    const result = await Notification.updateMany(query, { $set: { isRead: true } })

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to mark notifications as read",
      },
      { status: 500 },
    )
  }
}
