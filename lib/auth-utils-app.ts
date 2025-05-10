import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connectToDatabase } from "@/lib/db"
import { User, type IUser } from "@/lib/models/user"
import { Types } from "mongoose"
import type { Session } from "./types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const TOKEN_NAME = "auth_token"

const textEncoder = new TextEncoder()
const secretKey = textEncoder.encode(JWT_SECRET)

export async function getSessionAppRouter(): Promise<Session | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(TOKEN_NAME)?.value

  console.log("Getting session (App Router), cookies:", cookieStore.getAll())
  console.log("Getting session (App Router), token exists:", !!token)

  if (!token || token === "") {
    console.log("No token or token is empty, returning null")
    return null
  }

  try {
    const { payload } = await jwtVerify(token, secretKey)
    console.log("Token verified, payload:", payload)

    // Ambil role dari database
    await connectToDatabase()
    const user = await User.findOne({
      $or: [
        { _id: payload.userId },
        { _id: new Types.ObjectId(payload.userId as string) },
        { id: payload.userId },
        { userId: payload.userId },
      ],
    })
      .select("role profilePicture")
      .lean<IUser>()

    if (!user) {
      console.error("User not found for userId:", payload.userId)
      return null
    }

    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: user.role as "admin" | "moderator" | "member",
      profilePicture: user.profilePicture as string,
    }
  } catch (error) {
    console.error("Session verification error:", error)
    return null
  }
}
