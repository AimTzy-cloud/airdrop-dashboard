import { Schema, model, models, type Document } from "mongoose"

export interface NotificationDocument extends Document {
  userId: string
  type: "message" | "quest" | "system"
  title: string
  message: string
  timestamp: Date
  read: boolean
  link?: string
  sender?: {
    id: string
    name: string
    avatar?: string
  }
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["message", "quest", "system"],
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    link: { type: String },
    sender: {
      id: { type: String },
      name: { type: String },
      avatar: { type: String },
    },
  },
  { timestamps: true },
)

// Create indexes for faster queries
NotificationSchema.index({ userId: 1, timestamp: -1 })
NotificationSchema.index({ userId: 1, read: 1 })

export const Notification = models.Notification || model<NotificationDocument>("Notification", NotificationSchema)
