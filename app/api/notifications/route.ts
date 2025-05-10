import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Notification } from "@/lib/models/notification";
import { getSessionAppRouter } from "@/lib/auth-utils-app";
import mongoose from "mongoose";

// Interface untuk hasil lean() dari Notification
type NotificationLean = {
  _id: mongoose.Types.ObjectId;
  userId: string;
  type: "message" | "quest" | "connection" | "system";
  title: string;
  content: string;
  sourceId?: string;
  sourceType?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionAppRouter();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId") || session.userId;
    const limit = Number(url.searchParams.get("limit") || "50");
    const skip = Number(url.searchParams.get("skip") || "0");
    const type = url.searchParams.get("type");

    // Validasi limit dan skip
    const parsedLimit = Number(limit);
    const parsedSkip = Number(skip);
    if (isNaN(parsedLimit) || isNaN(parsedSkip) || parsedLimit < 0 || parsedSkip < 0) {
      return NextResponse.json({ error: "Invalid limit or skip" }, { status: 400 });
    }

    const query: Record<string, unknown> = { userId };

    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(parsedSkip)
      .limit(parsedLimit)
      .lean<NotificationLean[]>();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      data: notifications.map((notification) => ({
        id: notification._id.toString(),
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        content: notification.content,
        sourceId: notification.sourceId,
        sourceType: notification.sourceType,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
      })),
      total,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch notifications",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAppRouter();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { userId, type, title, content, sourceId, sourceType } = await req.json();

    if (!userId || !type || !title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      );
    }

    // Validasi type
    const validTypes = ["message", "quest", "connection", "system"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
    }

    const notification = new Notification({
      userId,
      type,
      title,
      content,
      sourceId,
      sourceType,
      isRead: false,
    });

    await notification.save();

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
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create notification",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionAppRouter();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId") || session.userId;

    // Delete all notifications for this user
    await Notification.deleteMany({ userId });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete notifications",
      },
      { status: 500 },
    );
  }
}