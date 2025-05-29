import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { User } from "@/lib/models/user"
import { connectToDatabase } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    // Get the current user from Clerk
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the request body
    const { googleId, email } = await req.json()

    if (!googleId) {
      return NextResponse.json({ message: "Google ID is required" }, { status: 400 })
    }

    // Connect to MongoDB
    await connectToDatabase()

    // Find the user by Clerk username
    // Note: You might need to adjust this query based on how you identify users
    const user = await User.findOne({ username: clerkUser.username })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Update the user with Google information
    user.googleId = googleId
    user.hasLinkedGoogle = true

    // Update email if it doesn't exist
    if (email && !user.email) {
      user.email = email
    }

    // Save the updated user
    await user.save()

    return NextResponse.json({ message: "Google account linked successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error linking Google account:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
