import { type NextRequest, NextResponse } from "next/server"
import { getSessionAppRouter } from "@/lib/auth-utils-app"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/lib/models/user"

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionAppRouter()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.userId
    const data = await req.json()
    const { bio, profilePicture, settings } = data

    await connectToDatabase()

    // Buat objek update dengan field yang ada
    const updateData: Record<string, unknown> = {}

    if (bio !== undefined) {
      updateData.bio = bio
    }

    if (profilePicture !== undefined) {
      updateData.profilePicture = profilePicture
    }

    if (settings !== undefined) {
      updateData["settings"] = settings
    }

    // Update lastActive
    updateData.lastActive = new Date()

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true })

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profilePicture,
        settings: updatedUser.settings,
      },
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
