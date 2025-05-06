import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// Mock database for notifications
let notificationsDB: Array<{
  id: string
  userId: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
  link?: string
}> = [
  {
    id: "1",
    userId: "user123",
    title: "New Message",
    message: "You have received a new message from John",
    type: "message",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    link: "/dashboard/community/chat/123",
  },
  {
    id: "2",
    userId: "user123",
    title: "Quest Completed",
    message: "Congratulations! You've completed the 'First Steps' quest",
    type: "quest",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    link: "/dashboard/galxe-user",
  },
  {
    id: "3",
    userId: "user123",
    title: "System Update",
    message: "The system will be under maintenance on Saturday",
    type: "system",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: "4",
    userId: "user123",
    title: "New Quest Available",
    message: "A new quest 'Crypto Master' is now available",
    type: "quest",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    link: "/dashboard/galxe-user",
  },
  {
    id: "5",
    userId: "user123",
    title: "Friend Request",
    message: "Alice wants to connect with you",
    type: "message",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    link: "/dashboard/community/users",
  },
  {
    id: "6",
    userId: "user123",
    title: "Welcome to Crypto Tracker",
    message: "Welcome! Get started by exploring the dashboard",
    type: "system",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
]

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Filter notifications by userId
    const userNotifications = notificationsDB.filter((notification) => notification.userId === userId)

    // Sort by createdAt (newest first)
    userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(userNotifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.userId || !body.title || !body.message || !body.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newNotification = {
      id: uuidv4(),
      userId: body.userId,
      title: body.title,
      message: body.message,
      type: body.type,
      read: false,
      createdAt: new Date().toISOString(),
      link: body.link || undefined,
    }

    // Add to mock database
    notificationsDB.unshift(newNotification)

    return NextResponse.json(newNotification)
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Remove all notifications for this user
    notificationsDB = notificationsDB.filter((notification) => notification.userId !== userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notifications:", error)
    return NextResponse.json({ error: "Failed to delete notifications" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Mark all notifications as read for this user
    notificationsDB = notificationsDB.map((notification) => {
      if (notification.userId === body.userId) {
        return { ...notification, read: true }
      }
      return notification
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}
