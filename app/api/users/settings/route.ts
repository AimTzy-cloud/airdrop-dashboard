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
    const { settings } = await req.json()

    if (!settings) {
      return NextResponse.json({ error: "Settings are required" }, { status: 400 })
    }

    await connectToDatabase()

    // Update user settings
    const updatedUser = await User.findByIdAndUpdate(userId, { $set: { settings } }, { new: true })

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Settings updated successfully",
      settings: updatedUser.settings,
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
