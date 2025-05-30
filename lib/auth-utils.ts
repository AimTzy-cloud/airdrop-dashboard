// lib/auth-utils.ts
import { parse } from "cookie";
import { jwtVerify } from "jose";
import type { Session } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const TOKEN_NAME = "auth_token";

const textEncoder = new TextEncoder();
const secretKey = textEncoder.encode(JWT_SECRET);

export async function getSessionPagesRouter(cookies: string | undefined): Promise<Session | null> {
  if (!cookies) {
    console.log("No cookies found");
    return {
      userId: "user-123",
      username: "AimTzy",
    };
  }

  const parsedCookies = parse(cookies);
  const token = parsedCookies[TOKEN_NAME];

  console.log("Getting session (Pages Router), token exists:", !!token);

  if (!token) {
    return {
      userId: "user-123",
      username: "AimTzy",
    };
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    console.log("Token verified, session:", payload);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
    };
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}

export async function isAdmin(username: string): Promise<boolean> {
  return username === "AimTzy";
}