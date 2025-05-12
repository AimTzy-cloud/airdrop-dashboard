import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/user";

// Interface untuk tipe user setelah .lean()
interface LeanUser {
  _id: string;
  username: string;
  password: string;
}

export async function POST(request: Request) {
  // Deklarasikan startTime di luar try-catch
  const startTime = Date.now();

  try {
    const { username, password } = await request.json();
    console.log("Login attempt for username:", username);

    await connectToDatabase();
    console.log("Connected to database for login", `Time: ${Date.now() - startTime}ms`);

    // Gunakan .lean() dan definisikan tipe hasilnya
    const user = await User.findOne({ username })
      .select("username password _id")
      .lean<LeanUser>();
    console.log("User found:", user ? "Yes" : "No", `Time: ${Date.now() - startTime}ms`);
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 404 });
    }

    console.log("Verifying password for user:", user.username);
    // Karena .lean() menghapus method Mongoose, kita ambil dokumen asli untuk comparePassword
    const doc = await User.findOne({ username });
    if (!doc) {
      return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 404 });
    }
    const isPasswordValid = await doc.comparePassword(password);
    console.log("Password match:", isPasswordValid, `Time: ${Date.now() - startTime}ms`);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 });
    }

    console.log("Creating token for user:", user.username);
    const token = await new SignJWT({
      userId: user._id,
      username: user.username,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key"));
    console.log("Token created for user:", user.username, `Time: ${Date.now() - startTime}ms`);

    const response = NextResponse.json({ success: true, message: "Login successful" });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });
    console.log("Cookie set for user:", user.username, `Time: ${Date.now() - startTime}ms`);

    return response;
  } catch (error) {
    console.error("Login error:", error, `Time: ${Date.now() - startTime}ms`);
    return NextResponse.json({ success: false, message: "An error occurred during login" }, { status: 500 });
  }
}