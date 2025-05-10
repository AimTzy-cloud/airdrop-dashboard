import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Notification } from "@/lib/models/notification"
import { getSessionAppRouter } from "@/lib/auth-utils-app"

export async function GET(req: NextRequest) {
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

    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") || session.userId
    const type = url.searchParams.get("type")

    const query: Record<string, unknown> = {
      userId,
      isRead: false,
    }

    if (type) {
      query.type = type
    }

    const count = await Notification.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: count,
    })
  } catch (error) {
    console.error("Error counting unread notifications:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to count notifications",
      },
      { status: 500 },
    )
  }
}
