"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { registerUser } from "@/lib/auth-actions"
import { Loader2, Github } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await registerUser(username, password)
      if (result.success) {
        toast({
          title: "Success!",
          description: "Registration successful. Please login.",
          variant: "default",
        })
        router.push("/login?registered=true")
      } else {
        setError(result.message || "Registration failed")
        toast({
          title: "Error",
          description: result.message || "Registration failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("An error occurred during registration")
      toast({
        title: "Error",
        description: "An error occurred during registration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-blue-950 to-slate-950">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_center,rgba(14,66,121,0.15),transparent_70%)]"></div>
      <Card className="w-full max-w-md shadow-xl border border-blue-900/20 bg-blue-950/30 backdrop-blur-md rounded-3xl">
        <div className="flex justify-center pt-8">
          <div className="h-12 w-12 rounded-full bg-blue-900/30 flex items-center justify-center backdrop-blur-sm border border-blue-800/50">
            <div className="h-6 w-6 rounded-full border-2 border-blue-400"></div>
          </div>
        </div>
        <CardHeader className="space-y-1 pt-4">
          <CardTitle className="text-2xl font-bold text-center text-white">Create account</CardTitle>
          <CardDescription className="text-center text-slate-300">
            Enter your details to create a new account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="p-3 text-sm text-white bg-red-500/80 backdrop-blur-sm rounded-lg">{error}</div>}
            <div className="space-y-3">
              <div className="relative">
                <Input
                  id="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="py-6 bg-blue-900/20 border-blue-800/30 text-white rounded-xl focus:border-blue-400 focus:ring-blue-400/50"
                />
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="py-6 bg-blue-900/20 border-blue-800/30 text-white rounded-xl focus:border-blue-400 focus:ring-blue-400/50"
                />
              </div>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="py-6 bg-blue-900/20 border-blue-800/30 text-white rounded-xl focus:border-blue-400 focus:ring-blue-400/50"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full py-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-blue-800/50"></div>
              </div>
              <div className="relative z-10 bg-blue-950/30 px-4 text-sm text-slate-400">OR</div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full py-6 bg-blue-900/20 border-blue-800/30 text-white hover:bg-blue-900/40 hover:text-blue-100 rounded-xl opacity-70"
              disabled
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Continue with Google <span className="ml-2 text-xs bg-blue-800/50 px-2 py-1 rounded-full">Soon</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full py-6 bg-blue-900/20 border-blue-800/30 text-white hover:bg-blue-900/40 hover:text-blue-100 rounded-xl opacity-70"
              disabled
            >
              <Github className="mr-2 h-4 w-4" />
              Continue with GitHub <span className="ml-2 text-xs bg-blue-800/50 px-2 py-1 rounded-full">Soon</span>
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-8">
            <div className="text-center text-sm text-slate-300">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 hover:underline font-medium">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
