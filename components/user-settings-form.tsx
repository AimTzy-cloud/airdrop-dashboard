"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Save, Upload, ChromeIcon as Google, Check, AlertTriangle } from 'lucide-react'
// Socket import removed

interface UserSettingsFormProps {
  user: {
    _id: string
    username: string
    bio?: string
    profilePicture?: string
    role?: string
    status?: string
    lastActive?: Date
    joinedDate?: Date
    createdAt?: Date
    updatedAt?: Date
    settings?: {
      theme?: string
      notifications?: boolean
      language?: string
    }
    connections?: string[]
    // Add Google connection fields
    hasLinkedGoogle?: boolean
    googleId?: string
  }
}

export default function UserSettingsForm({ user }: UserSettingsFormProps) {
  const [bio, setBio] = useState(user.bio || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [notificationsEnabled] = useState(user.settings?.notifications !== false)
  const [darkMode] = useState(user.settings?.theme === "dark")
  const [language] = useState(user.settings?.language || "en")
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || "")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Socket connection removed
  // Using a mocked connection status instead
  // econst isConnected = true // Always show as connected

  // Socket-related useEffect removed

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio,
          profilePicture,
          settings: {
            theme: darkMode ? "dark" : "light",
            notifications: notificationsEnabled,
            language,
          },
        }),
      })

      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Update failed",
          description: data.message || "Failed to update profile. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      toast({
        title: "Update failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation password must match.",
        variant: "destructive",
      })
      return
    }

    if (!currentPassword) {
      toast({
        title: "Current password required",
        description: "Please enter your current password to update.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/users/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (response.ok) {
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully.",
        })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        const data = await response.json()
        toast({
          title: "Update failed",
          description: data.message || "Failed to update password. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error updating password:", err)
      toast({
        title: "Update failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProfilePictureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Profile picture must be less than 2MB.",
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async () => {
        const base64data = reader.result as string
        setProfilePicture(base64data)

        // Update profile picture in database
        const response = await fetch("/api/users/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profilePicture: base64data,
          }),
        })

        if (response.ok) {
          toast({
            title: "Profile picture updated",
            description: "Your profile picture has been updated successfully.",
          })
        } else {
          const data = await response.json()
          toast({
            title: "Update failed",
            description: data.message || "Failed to update profile picture. Please try again.",
            variant: "destructive",
          })
          // Revert to previous profile picture
          setProfilePicture(user.profilePicture || "")
        }

        setIsUploading(false)
      }
    } catch (err) {
      console.error("Error updating profile picture:", err)
      toast({
        title: "Update failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setIsUploading(false)
    }
  }

  const handleConnectGoogle = () => {
    // Redirect to dashboard where the popup will appear
    window.location.href = "/dashboard"
  }

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6 relative">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="preferences" disabled>
            Preferences
            <span className="absolute -top-2 right-2 bg-yellow-600 text-yellow-100 text-[10px] px-1 rounded">Soon</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative">
                <Avatar
                  className="h-24 w-24 border-2 border-gray-700 cursor-pointer"
                  onClick={handleProfilePictureClick}
                >
                  <AvatarImage src={profilePicture || "/placeholder.svg"} alt={user.username} />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>

                  {/* Overlay for upload icon */}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    ) : (
                      <Upload className="h-8 w-8 text-white" />
                    )}
                  </div>
                </Avatar>

                {/* Hidden file input */}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>

              <div className="text-center">
                <h2 className="text-xl font-medium text-white">{user.username}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs bg-gray-700/50 text-gray-300">
                    {user.role || "member"}
                  </Badge>
                  <Badge variant="outline" className="bg-green-900/30 text-green-300 border-green-800 text-xs">
                    online
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Member since{" "}
                  {user.joinedDate ? formatDistanceToNow(new Date(user.joinedDate), { addSuffix: true }) : "unknown"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  value={user.username}
                  disabled
                  className="bg-gray-900 border-gray-700 text-gray-200"
                />
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="bio" className="text-white">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-gray-900 border-gray-700 min-h-[100px] text-gray-200"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="security">
          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <div>
              <Label htmlFor="current-password" className="text-white">
                Current Password
              </Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-gray-900 border-gray-700 text-gray-200"
              />
            </div>

            <div>
              <Label htmlFor="new-password" className="text-white">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-gray-900 border-gray-700 text-gray-200"
              />
            </div>

            <div>
              <Label htmlFor="confirm-password" className="text-white">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-gray-900 border-gray-700 text-gray-200"
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        {/* New Connections Tab */}
        <TabsContent value="connections">
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Connected Accounts</h3>
              
              {/* Google Account Connection */}
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-700 p-2 rounded-full">
                    <Google className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Google</p>
                    <p className="text-xs text-gray-400">
                      {user.hasLinkedGoogle
                        ? "Your Google account is connected"
                        : "Connect your Google account for easier login"}
                    </p>
                  </div>
                </div>
                
                {user.hasLinkedGoogle ? (
                  <div className="flex items-center text-green-500 gap-1 bg-green-900/20 px-2 py-1 rounded">
                    <Check className="h-4 w-4" />
                    <span className="text-xs">Connected</span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-gray-600 text-white hover:bg-gray-700"
                    onClick={handleConnectGoogle}
                  >
                    Connect
                  </Button>
                )}
              </div>

              {/* Warning message if not connected */}
              {!user.hasLinkedGoogle && (
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800/50 rounded-md flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-200">
                    Our system will be transitioning to Google authentication. Please connect your Google account to avoid login issues in the future.
                  </p>
                </div>
              )}
            </div>

            {/* Future connections section */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Coming Soon</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-700 p-2 rounded-full">
                      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.441 16.892c-2.102.144-6.784.144-8.883 0-2.276-.156-2.541-1.27-2.558-4.892.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0 2.277.156 2.541 1.27 2.559 4.892-.018 3.629-.285 4.736-2.559 4.892zm-6.441-7.234l4.917 2.338-4.917 2.346v-4.684z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">YouTube</p>
                      <p className="text-xs text-gray-400">Connect your YouTube account</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs bg-gray-700 text-gray-300">
                    Soon
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-700 p-2 rounded-full">
                      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">Twitter</p>
                      <p className="text-xs text-gray-400">Connect your Twitter account</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs bg-gray-700 text-gray-300">
                    Soon
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 max-w-md mx-auto">
              <div className="bg-yellow-600/20 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Preferences Coming Soon</h3>
              <p className="text-gray-400 mb-6">
                We&apos;re working hard to bring you customizable preferences. This feature will be available in the
                next update.
              </p>
              <div className="text-sm text-gray-500 bg-gray-900/50 rounded-md p-3">
                <p>Future features will include:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Custom theme settings</li>
                  <li>Notification preferences</li>
                  <li>Language options</li>
                  <li>Privacy controls</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}