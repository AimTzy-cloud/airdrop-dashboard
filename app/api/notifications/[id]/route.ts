import { type NextRequest, NextResponse } from "next/server"

// Reuse the mock database from the main notifications route
// This is just for demo purposes - in a real app, you'd use a proper database
let notificationsDB: Array<{
  id: string
  userId: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
  link?: string
}> = []

// Initialize with some data if empty (this is just for the mock implementation)
if (notificationsDB.length === 0) {
  notificationsDB = [
    {
      id: "1",
      userId: "user123",
      title: "New Message",
      message: "You have received a new message from John",
      type: "message",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      link: "/dashboard/community/chat/123",
    },
    // ... other notifications would be here
  ]
}

// GET /api/notifications/[id] - Get a specific notification
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 })
    }

    const notification = notificationsDB.find((n) => n.id === id)

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error fetching notification:", error)
    return NextResponse.json({ error: "Failed to fetch notification" }, { status: 500 })
  }
}

// DELETE /api/notifications/[id] - Delete a specific notification
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 })
    }

    const index = notificationsDB.findIndex((n) => n.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Remove the notification
    notificationsDB.splice(index, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}

// PUT /api/notifications/[id]/read - Mark a specific notification as read
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 })
    }

    const notification = notificationsDB.find((n) => n.id === id)

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Mark as read
    notification.read = true

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
