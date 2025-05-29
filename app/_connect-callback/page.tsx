"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from 'lucide-react'

export default function ConnectCallbackPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function linkGoogleAccount() {
      if (!isLoaded || !user) return

      try {
        // Get Google account details from Clerk
        const googleAccount = user.externalAccounts.find((account) => account.provider === "google")

        if (!googleAccount) {
          throw new Error("Google account not found")
        }

        // Get Google ID and email - using id instead of externalId
        const googleId = googleAccount.id // Changed from externalId to id
        const email = googleAccount.emailAddress

        // Call your API to update the user in MongoDB
        const response = await fetch("/api/users/link-google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            googleId,
            email,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || "Failed to link Google account")
        }

        setStatus("success")
      } catch (error) {
        console.error("Error linking account:", error)
        setStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
      }
    }

    linkGoogleAccount()
  }, [isLoaded, user])

  const handleContinue = () => {
    router.push("/dashboard")
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md bg-[#1a1f2e] border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === "loading" && "Menghubungkan Akun Google..."}
            {status === "success" && (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Akun Google Berhasil Terhubung
              </>
            )}
            {status === "error" && (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                Gagal Menghubungkan Akun
              </>
            )}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {status === "loading" && "Mohon tunggu sebentar..."}
            {status === "success" && "Akun Google Anda telah berhasil terhubung dengan akun yang ada."}
            {status === "error" && "Terjadi kesalahan saat menghubungkan akun."}
          </CardDescription>
        </CardHeader>
        <CardContent>{status === "error" && <p className="text-sm text-red-500">{errorMessage}</p>}</CardContent>
        <CardFooter>
          {status !== "loading" && (
            <Button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {status === "success" ? "Lanjutkan ke Dashboard" : "Kembali ke Dashboard"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}