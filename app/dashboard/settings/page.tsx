import { getSessionAppRouter } from "@/lib/auth-utils-app"
import { redirect } from "next/navigation"
import UserSettingsForm from "@/components/user-settings-form"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/lib/models/user"
import { Types } from "mongoose"
import type { UserData } from "@/lib/types"

export default async function SettingsPage() {
  const session = await getSessionAppRouter()

  if (!session) {
    redirect("/login")
  }

  await connectToDatabase()

  // Gunakan findById untuk mendapatkan satu dokumen berdasarkan ID
  const userDoc = await User.findById(new Types.ObjectId(session.userId)).lean()

  if (!userDoc) {
    redirect("/login")
  }

  // Konversi dokumen Mongoose ke objek JavaScript biasa dengan tipe yang benar
  const user = userDoc as Record<string, unknown>

  // Konversi _id menjadi string untuk menghindari masalah serialisasi
  const userData: UserData = {
    _id: user._id?.toString() || "",
    username: (user.username as string) || "",
    bio: (user.bio as string) || "",
    profilePicture:
      (user.profilePicture as string) ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${(user.username as string) || "User"}`,
    role: ((user.role as string) || "member") as "admin" | "moderator" | "member",
    status: ((user.status as string) || "offline") as "online" | "away" | "offline",
    lastActive: (user.lastActive as Date) || new Date(),
    joinedDate: (user.joinedDate as Date) || (user.createdAt as Date) || new Date(),
    createdAt: (user.createdAt as Date) || new Date(),
    updatedAt: (user.updatedAt as Date) || new Date(),
    settings: {
      theme: ((user.settings as Record<string, unknown>)?.theme as string) || "dark",
      notifications: ((user.settings as Record<string, unknown>)?.notifications as boolean) !== false,
      language: ((user.settings as Record<string, unknown>)?.language as string) || "en",
    },
    connections: Array.isArray(user.connections) ? (user.connections as string[]) : [],
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-white">Account Settings</h1>
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <UserSettingsForm user={userData} />
      </div>
    </div>
  )
}
