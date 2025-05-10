import mongoose, { type Document, Schema } from "mongoose";

// Interface for chat room data (client-side friendly)
export interface ChatRoomData {
  _id: string;
  name: string;
  description: string;
  topic: string;
  members: string[]; // Array of user IDs
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Mongoose document (server-side)
export interface IChatRoom extends Document, ChatRoomData {
  _id: string; // Override Document's _id type
}

const ChatRoomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // Assuming you have a User model
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const ChatRoom = mongoose.models.ChatRoom || mongoose.model<IChatRoom>("ChatRoom", ChatRoomSchema);