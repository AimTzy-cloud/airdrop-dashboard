"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createAirdrop } from "@/lib/airdrop-actions"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { FileUpload } from "@/components/file-upload"

interface AddAirdropFormProps {
  userId: string
}

export function AddAirdropForm({ userId }: AddAirdropFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [twitterPreview, setTwitterPreview] = useState<string | null>(null)
  const [isLoadingTwitterPreview, setIsLoadingTwitterPreview] = useState(false)
  const [showFaucetField, setShowFaucetField] = useState(false)
  const [guideImageBase64, setGuideImageBase64] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    type: "testnet" as "testnet" | "daily" | "quest" | "node" | "retro",
    chain: "ethereum" as "ethereum" | "solana" | "avax" | "bnb" | "rise_chain" | "monad" | "megaeth" | 'other',
    twitterLink: "",
    discordLink: "",
    airdropLink: "",
    faucetLink: "",
    description: "",
    guideImage: null as File | null,
  })

  // Convert guide image to base64 when it changes
  useEffect(() => {
    if (!formData.guideImage) {
      setGuideImageBase64(null)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setGuideImageBase64(e.target.result as string)
      }
    }
    reader.readAsDataURL(formData.guideImage)
  }, [formData.guideImage])

  // Show/hide faucet field based on type
  useEffect(() => {
    setShowFaucetField(formData.type === "testnet")
  }, [formData.type])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // If Twitter link changes, try to extract the Twitter handle and set a preview
    if (name === "twitterLink" && value) {
      try {
        setIsLoadingTwitterPreview(true)
        // Extract Twitter handle from URL
        const twitterRegex = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i
        const match = value.match(twitterRegex)

        if (match && match[1]) {
          const handle = match[1]
          // Try multiple sources for Twitter profile image
          setTwitterPreview(`https://unavatar.io/twitter/${handle}`)
        } else {
          setTwitterPreview(null)
        }
      } catch (error) {
        console.error("Error parsing Twitter URL:", error)
        setTwitterPreview(null)
      } finally {
        setIsLoadingTwitterPreview(false)
      }
    }
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const formDataToSend = new FormData()
    formDataToSend.append("userId", userId)
    formDataToSend.append("name", formData.name)
    formDataToSend.append("type", formData.type)
    formDataToSend.append("chain", formData.chain)
    formDataToSend.append("twitterLink", formData.twitterLink)
    formDataToSend.append("discordLink", formData.discordLink)
    formDataToSend.append("airdropLink", formData.airdropLink || "")
    formDataToSend.append("description", formData.description || "")

    // Add faucet link if applicable
    if (formData.type === "testnet") {
      formDataToSend.append("faucetLink", formData.faucetLink || "")
    }

    // Add Twitter image URL if available
    if (twitterPreview) {
      formDataToSend.append("airdropImageUrl", twitterPreview)
    }

    // Add guide image if available
    if (formData.guideImage && guideImageBase64) {
      formDataToSend.append("guideImageBase64", guideImageBase64)
      formDataToSend.append("guideImageName", formData.guideImage.name)
      formDataToSend.append("guideImageType", formData.guideImage.type)
    }

    try {
      await createAirdrop(formDataToSend)
      toast({
        title: "Success!",
        description: "Airdrop added successfully",
        variant: "default",
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Add airdrop error:", error)
      setError("An error occurred while adding the airdrop")
      toast({
        title: "Error",
        description: "An error occurred while adding the airdrop",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-md bg-[#111827] border-gray-700 text-white">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="userId" value={userId} />

          {error && <div className="p-3 text-sm text-white bg-red-500 rounded">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-200">
              Airdrop Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-[#1e293b] border-gray-700 text-white focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-200">
                Airdrop Type *
              </Label>
              <Select
                name="type"
                defaultValue={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
                required
              >
                <SelectTrigger
                  id="type"
                  className="bg-[#1e293b] border-gray-700 text-white focus:ring-2 focus:ring-primary"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f2e] border-gray-700 text-white">
                  <SelectItem value="testnet" className="focus:bg-gray-700 focus:text-white">
                    Testnet
                  </SelectItem>
                  <SelectItem value="daily" className="focus:bg-gray-700 focus:text-white">
                    Daily
                  </SelectItem>
                  <SelectItem value="quest" className="focus:bg-gray-700 focus:text-white">
                    Quest
                  </SelectItem>
                  <SelectItem value="node" className="focus:bg-gray-700 focus:text-white">
                    Node
                  </SelectItem>
                  <SelectItem value="retro" className="focus:bg-gray-700 focus:text-white">
                    Retro
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chain" className="text-gray-200">
                Blockchain Chain *
              </Label>
              <Select
                name="chain"
                defaultValue={formData.chain}
                onValueChange={(value) => handleSelectChange("chain", value)}
                required
              >
                <SelectTrigger
                  id="chain"
                  className="bg-[#1e293b] border-gray-700 text-white focus:ring-2 focus:ring-primary"
                >
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f2e] border-gray-700 text-white">
                  <SelectItem value="ethereum" className="focus:bg-gray-700 focus:text-white">
                    Ethereum
                  </SelectItem>
                  <SelectItem value="solana" className="focus:bg-gray-700 focus:text-white">
                    Solana
                  </SelectItem>
                  <SelectItem value="avax" className="focus:bg-gray-700 focus:text-white">
                    Avalanche
                  </SelectItem>
                  <SelectItem value="bnb" className="focus:bg-gray-700 focus:text-white">
                    BNB Chain
                  </SelectItem>
                  <SelectItem value="rise_chain" className="focus:bg-gray-700 focus:text-white">
                    Rise Chain
                  </SelectItem>
                  <SelectItem value="monad" className="focus:bg-gray-700 focus:text-white">
                    Monad
                  </SelectItem>
                  <SelectItem value="megaeth" className="focus:bg-gray-700 focus:text-white">
                    MegaETH
                  </SelectItem>
                  <SelectItem value="other" className="focus:bg-gray-700 focus:text-white">
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitterLink" className="text-gray-200">
              Twitter Link *
            </Label>
            <Input
              id="twitterLink"
              name="twitterLink"
              value={formData.twitterLink}
              onChange={handleChange}
              placeholder="https://twitter.com/..."
              required
              className="bg-[#1e293b] border-gray-700 text-white focus:ring-2 focus:ring-primary"
            />
            {isLoadingTwitterPreview && (
              <div className="flex items-center mt-2 text-gray-400">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading preview...
              </div>
            )}
            {twitterPreview && (
              <div className="mt-2">
                <p className="text-sm text-gray-400 mb-2">Project logo preview (from Twitter):</p>
                <div className="relative h-16 w-16 rounded-full overflow-hidden border border-gray-700">
                  <Image
                    src={twitterPreview || "/placeholder.svg"}
                    alt="Twitter profile"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="discordLink" className="text-gray-200">
              Discord Link *
            </Label>
            <Input
              id="discordLink"
              name="discordLink"
              value={formData.discordLink}
              onChange={handleChange}
              placeholder="https://discord.gg/..."
              required
              className="bg-[#1e293b] border-gray-700 text-white focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="airdropLink" className="text-gray-200">
              Airdrop Link
            </Label>
            <Input
              id="airdropLink"
              name="airdropLink"
              value={formData.airdropLink}
              onChange={handleChange}
              placeholder="https://..."
              className="bg-[#1e293b] border-gray-700 text-white focus:ring-2 focus:ring-primary"
            />
          </div>

          {showFaucetField && (
            <div className="space-y-2">
              <Label htmlFor="faucetLink" className="text-gray-200">
                Faucet Link (Optional)
              </Label>
              <Input
                id="faucetLink"
                name="faucetLink"
                value={formData.faucetLink}
                onChange={handleChange}
                placeholder="https://faucet...."
                className="bg-[#1e293b] border-gray-700 text-white focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-200">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter airdrop description (optional)"
              rows={4}
              className="bg-[#1e293b] border-gray-700 text-white focus:ring-2 focus:ring-primary"
            />
          </div>

          <FileUpload
            id="guideImage"
            label="Guide Image (How to Participate)"
            value={formData.guideImage}
            onChange={(file) => setFormData((prev) => ({ ...prev, guideImage: file }))}
            accept="image/*"
            helpText="Supported formats: JPG, JPEG, PNG, WebP, GIF, SVG, and more"
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              disabled={isSubmitting}
              className="border-gray-700 text-gray-200 hover:bg-gray-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[100px] bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Airdrop"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

