import { type NextRequest, NextResponse } from "next/server"
import { getSessionAppRouter } from "@/lib/auth-utils-app"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/lib/models/user"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAppRouter()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.userId
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    await connectToDatabase()

    // Get user
    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update password
    user.password = hashedPassword
    await user.save()

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
  }
}
