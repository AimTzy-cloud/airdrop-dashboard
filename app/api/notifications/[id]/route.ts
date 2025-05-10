import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Notification } from "@/lib/models/notification"
import { getSessionAppRouter } from "@/lib/auth-utils-app"
import mongoose from "mongoose"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionAppRouter()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid notification ID",
        },
        { status: 400 },
      )
    }

    const notification = await Notification.findById(id)

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          error: "Notification not found",
        },
        { status: 404 },
      )
    }

    if (notification.userId !== session.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied",
        },
        { status: 403 },
      )
    }

    const { isRead } = await req.json()

    notification.isRead = isRead
    await notification.save()

    return NextResponse.json({
      success: true,
      data: {
        id: notification._id.toString(),
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        content: notification.content,
        sourceId: notification.sourceId,
        sourceType: notification.sourceType,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update notification",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid notification ID",
        },
        { status: 400 },
      )
    }

    const notification = await Notification.findById(id)

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          error: "Notification not found",
        },
        { status: 404 },
      )
    }

    if (notification.userId !== session.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied",
        },
        { status: 403 },
      )
    }

    await Notification.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete notification",
      },
      { status: 500 },
    )
  }
}
