"use client"

import { useState, useEffect } from "react"
// import { useClerk } from "@clerk/nextjs"
// import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from 'lucide-react'

interface ConnectGooglePopupProps {
  hasLinkedGoogle: boolean
  userId: string // Tetap menerima userId untuk kompatibilitas
}

export default function ConnectGooglePopup({ hasLinkedGoogle }: ConnectGooglePopupProps) {
  const [open, setOpen] = useState(false)
  // const { openSignIn } = useClerk()
  // const [isLoading, setIsLoading] = useState(false)

  // Popup will always be open if user hasn't linked Google
  useEffect(() => {
    if (!hasLinkedGoogle) {
      setOpen(true)
    }
  }, [hasLinkedGoogle])

  // Prevent closing the popup if user hasn't linked Google
  const handleOpenChange = (newOpen: boolean) => {
    // Only allow closing if user has linked Google
    if (hasLinkedGoogle || newOpen) {
      setOpen(newOpen)
    }
  }

  {/*const handleConnectGoogle = async () => {
    setIsLoading(true)
    try {
      // Menggunakan openSignIn dari Clerk dengan parameter yang benar
      openSignIn({
        redirectUrl: `${window.location.origin}/connect-callback`,
        redirectUrlComplete: "/dashboard",
        signUpUrl: "/connect-callback", // Tambahkan ini untuk pengguna baru
        afterSignInUrl: "/connect-callback", // Tambahkan ini untuk pengguna yang sudah ada
      })
    } catch (error) {
      console.error("Error connecting Google account:", error)
      setIsLoading(false)
    }
  }*/}

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1a1f2e] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Penting: Tautkan Akun Google Anda
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Warning system kami akan melakukan perubahan pada fungsi login, silahkan menautkan akun Google Anda, agar
            menghilangkan error di masa depan.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <p className="text-sm text-gray-400">
            Dengan menautkan akun Google, Anda tetap dapat mengakses semua data dan aktivitas Anda yang sudah ada.
          </p>
        </div>
        <DialogFooter>
          {/*<Button
            type="button"
            variant="default"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={handleConnectGoogle}
            disabled={isLoading}
          >
            {isLoading ? "Menghubungkan..." : "Tautkan Akun Google"}
          </Button>*/}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}