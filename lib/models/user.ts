import mongoose, { Schema, type Document } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
  username: string
  password: string
  email?: string
  profilePicture?: string
  bio?: string
  role: "admin" | "moderator" | "member"
  status: "online" | "away" | "offline"
  lastActive: Date
  connections: string[] // Array of user IDs the user is connected to
  joinedDate: Date
  settings?: {
    theme?: string
    notifications?: boolean
    language?: string
  }
  googleId?: string // Added for Google authentication
  hasLinkedGoogle: boolean // Track if user has linked Google account
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      sparse: true, // Allows multiple null values (for existing users)
      trim: true,
      lowercase: true,
      index: true,
    },
    profilePicture: {
      type: String,
      default: "", // Empty string as default
    },
    bio: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "moderator", "member"],
      default: "member",
    },
    status: {
      type: String,
      enum: ["online", "away", "offline"],
      default: "offline",
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    connections: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    settings: {
      theme: {
        type: String,
        default: "dark",
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        default: "id", // Default to Indonesian
      },
    },
    googleId: {
      type: String,
      sparse: true, // Allows multiple null values (for users without Google)
      index: true,
    },
    hasLinkedGoogle: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Create a sparse unique index for googleId
// This ensures uniqueness when present but allows multiple documents without googleId
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true })

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Check if model exists before creating a new one (for Next.js hot reloading)
export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)