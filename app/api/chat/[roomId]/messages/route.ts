import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Message } from "@/lib/models/message";
import { ChatRoom } from "@/lib/models/chatroom";
import { getSessionAppRouter } from "@/lib/auth-utils-app";
import mongoose from "mongoose";
import { sendMessageNotification } from "@/lib/community-actions";

// Interface untuk hasil lean() dari ChatRoom
interface ChatRoomLean {
  members: string[];
  name: string;
}

export async function GET(req: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const session = await getSessionAppRouter();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { roomId } = params;

    // Validate roomId
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
    }

    // Check if room exists and user has access
    const room = await ChatRoom.findById(roomId);

    if (!room) {
      return NextResponse.json({ error: "Chat room not found" }, { status: 404 });
    }

    if (room.isPrivate && !room.members.some((member: mongoose.Types.ObjectId) => member.toString() === session.userId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const limit = Number.parseInt(url.searchParams.get("limit") || "50");
    const before = url.searchParams.get("before");

    // Build query
    const query: Record<string, unknown> = { roomId };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Get messages
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("replyTo", "content senderUsername")
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        roomId,
        senderId: { $ne: session.userId },
        readBy: { $ne: session.userId },
      },
      {
        $set: { deliveryStatus: "read" },
        $addToSet: { readBy: session.userId },
      },
    );

    return NextResponse.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const session = await getSessionAppRouter();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { roomId } = params;

    // Validate roomId
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
    }

    // Check if room exists and user has access
    const room = await ChatRoom.findById(roomId);

    if (!room) {
      return NextResponse.json({ error: "Chat room not found" }, { status: 404 });
    }

    if (room.isPrivate && !room.members.some((member: mongoose.Types.ObjectId) => member.toString() === session.userId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { content, replyTo, attachments } = await req.json();

    // Validate content
    if (!content && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: "Message content or attachments are required" }, { status: 400 });
    }

    // Create new message
    const message = new Message({
      roomId,
      senderId: session.userId,
      senderUsername: session.username,
      content: content || "",
      replyTo: replyTo || null,
      attachments: attachments || [],
      readBy: [session.userId],
    });

    await message.save();

    // Update room's updatedAt timestamp
    await ChatRoom.findByIdAndUpdate(roomId, { updatedAt: new Date() });

    // Kirim notifikasi ke semua anggota chat room kecuali pengirim
    const roomMembers = await ChatRoom.findById(roomId)
      .select("members name")
      .lean() as ChatRoomLean | null;

    if (roomMembers && roomMembers.members) {
      for (const memberId of roomMembers.members) {
        // Skip pengirim pesan
        if (memberId.toString() === session.userId) continue;

        // Kirim notifikasi ke anggota lain
        await sendMessageNotification(
          memberId.toString(),
          session.username,
          roomMembers.name,
          roomId,
          message.content,
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: await Message.findById(message._id).populate("replyTo", "content senderUsername"),
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}