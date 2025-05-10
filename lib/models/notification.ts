import mongoose, { Schema, type Document } from "mongoose"

export interface NotificationDocument extends Document {
  userId: string
  type: "message" | "quest" | "connection" | "system"
  title: string
  content: string
  sourceId?: string
  sourceType?: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["message", "quest", "connection", "system"],
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sourceId: {
      type: String,
    },
    sourceType: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export const Notification =
  mongoose.models.Notification || mongoose.model<NotificationDocument>("Notification", NotificationSchema)
