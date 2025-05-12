import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Notification } from "@/lib/models/notification"
import { getSessionAppRouter } from "@/lib/auth-utils-app"

// Cache for notification counts
const countCache = new Map<string, { count: number; timestamp: number }>()
const CACHE_TTL = 30000 // 30 seconds cache TTL

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

    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") || session.userId
    const type = url.searchParams.get("type")

    // Check cache first
    const cacheKey = `${userId}-${type || 'all'}`
    const cachedData = countCache.get(cacheKey)
    const now = Date.now()

    if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: cachedData.count,
        cached: true,
      })
    }

    await connectToDatabase()

    const query: Record<string, unknown> = {
      userId,
      isRead: false,
    }

    if (type) {
      query.type = type
    }

    const count = await Notification.countDocuments(query)

    // Update cache
    countCache.set(cacheKey, { count, timestamp: now })

    return NextResponse.json({
      success: true,
      data: count,
      cached: false,
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
