"use server"

import { connectToDatabase } from "./db"
import { Airdrop, type AirdropDocument } from "./models/airdrop"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface AddAirdropParams {
  userId: string
  name: string
  type: "testnet" | "daily" | "quest" | "node" | "retro"
  chain?: string
  twitterLink: string
  discordLink: string
  airdropLink?: string
  faucetLink?: string
  description?: string
  airdropImage: File | null
  guideImage: File | null
}

export async function getAirdrops(userId: string): Promise<AirdropDocument[]> {
  try {
    await connectToDatabase()

    const airdrops = (await Airdrop.find({ userId }).sort({ createdAt: -1 }).lean()) as AirdropDocument[]

    return airdrops
  } catch (error) {
    console.error("Error fetching airdrops:", error)
    return []
  }
}

export async function getAllAirdrops(query: string): Promise<AirdropDocument[]> {
  try {
    await connectToDatabase()

    // Create a case-insensitive search regex
    const searchRegex = new RegExp(query, "i")

    // Search across multiple fields
    const airdrops = (await Airdrop.find({
      $or: [{ name: searchRegex }, { type: searchRegex }, { chain: searchRegex }, { description: searchRegex }],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()) as AirdropDocument[]

    return airdrops
  } catch (error) {
    console.error("Error searching airdrops:", error)
    return []
  }
}

export async function getAirdropById(airdropId: string): Promise<AirdropDocument | null> {
  try {
    await connectToDatabase()

    const airdrop = (await Airdrop.findById(airdropId).lean()) as AirdropDocument | null

    if (!airdrop) {
      return null
    }

    return airdrop
  } catch (error) {
    console.error("Error fetching airdrop:", error)
    return null
  }
}

export async function addAirdrop(params: AddAirdropParams) {
  try {
    await connectToDatabase()

    // Validate inputs
    if (!params.name || !params.type || !params.twitterLink || !params.discordLink) {
      return { success: false, message: "Missing required fields" }
    }

    // Extract Twitter handle for image
    let airdropImageUrl = undefined
    try {
      const twitterRegex = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i
      const match = params.twitterLink.match(twitterRegex)

      if (match && match[1]) {
        const handle = match[1]
        airdropImageUrl = `https://unavatar.io/twitter/${handle}`
      }
    } catch (error) {
      console.error("Error parsing Twitter URL:", error)
    }

    // In a real app, you would upload the guide image to a storage service
    // and get back a URL. For this example, we'll simulate it.
    const guideImageUrl = params.guideImage ? `/placeholder.svg?height=400&width=600` : undefined

    // Create new airdrop
    const airdrop = new Airdrop({
      userId: params.userId,
      name: params.name,
      type: params.type,
      chain: params.chain || "ethereum",
      twitterLink: params.twitterLink,
      discordLink: params.discordLink,
      airdropLink: params.airdropLink || "",
      faucetLink: params.faucetLink || "",
      description: params.description || "",
      airdropImageUrl,
      guideImageUrl,
      completed: false,
    })

    await airdrop.save()

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error adding airdrop:", error)
    return { success: false, message: "An error occurred while adding the airdrop" }
  }
}

// Direct server action for form submission with base64 image support
export async function createAirdrop(formData: FormData) {
  try {
    const userId = formData.get("userId") as string
    const name = formData.get("name") as string
    const type = formData.get("type") as "testnet" | "daily" | "quest" | "node" | "retro"
    const chain = (formData.get("chain") as string) || "ethereum"
    const twitterLink = formData.get("twitterLink") as string
    const discordLink = formData.get("discordLink") as string
    const airdropLink = formData.get("airdropLink") as string
    const faucetLink = formData.get("faucetLink") as string
    const description = formData.get("description") as string

    // Get guide image data
    const guideImageBase64 = formData.get("guideImageBase64") as string

    // Get airdrop image URL from Twitter
    let airdropImageUrl = formData.get("airdropImageUrl") as string

    if (!airdropImageUrl && twitterLink) {
      try {
        const twitterRegex = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i
        const match = twitterLink.match(twitterRegex)

        if (match && match[1]) {
          const handle = match[1]
          // Try multiple sources for Twitter profile image
          const sources = [
            `https://unavatar.io/twitter/${handle}`,
            `https://api.dicebear.com/7.x/identicon/svg?seed=${handle}`,
            `https://ui-avatars.com/api/?name=${handle}&background=random`,
          ]
          airdropImageUrl = sources[0] // Default to first source
        }
      } catch (error) {
        console.error("Error parsing Twitter URL:", error)
      }
    }

    // Process guide image
    let guideImageUrl = formData.get("guideImageUrl") as string

    // If we have a base64 image, use that directly
    if (guideImageBase64) {
      guideImageUrl = guideImageBase64
    } else if (!guideImageUrl) {
      // Default placeholder if no guide image
      guideImageUrl = "https://placehold.co/600x400/1a1f2e/ffffff?text=Tutorial+Guide"
    }

    await connectToDatabase()

    // Create new airdrop
    const airdrop = new Airdrop({
      userId,
      name,
      type,
      chain,
      twitterLink,
      discordLink,
      airdropLink,
      faucetLink,
      description,
      airdropImageUrl,
      guideImageUrl,
      completed: false,
    })

    await airdrop.save()

    revalidatePath("/dashboard")
    redirect("/dashboard")
  } catch (error) {
    console.error("Error creating airdrop:", error)
    return { success: false, message: "An error occurred while creating the airdrop" }
  }
}

// Update airdrop with base64 image support
export async function updateAirdrop(formData: FormData) {
  try {
    const airdropId = formData.get("airdropId") as string
    const userId = formData.get("userId") as string
    const name = formData.get("name") as string
    const type = formData.get("type") as "testnet" | "daily" | "quest" | "node" | "retro"
    const chain = (formData.get("chain") as string) || "ethereum"
    const twitterLink = formData.get("twitterLink") as string
    const discordLink = formData.get("discordLink") as string
    const airdropLink = formData.get("airdropLink") as string
    const faucetLink = formData.get("faucetLink") as string
    const description = formData.get("description") as string
    const airdropImageUrl = formData.get("airdropImageUrl") as string

    // Get guide image data
    const guideImageBase64 = formData.get("guideImageBase64") as string
    const existingGuideImageUrl = formData.get("guideImageUrl") as string

    await connectToDatabase()

    // Find the airdrop
    const airdrop = await Airdrop.findById(airdropId)
    if (!airdrop) {
      return { success: false, message: "Airdrop not found" }
    }

    // Make sure the user can only update their own airdrops
    if (airdrop.userId !== userId) {
      return { success: false, message: "Unauthorized" }
    }

    // Update the airdrop
    airdrop.name = name
    airdrop.type = type
    airdrop.chain = chain
    airdrop.twitterLink = twitterLink
    airdrop.discordLink = discordLink
    airdrop.airdropLink = airdropLink
    airdrop.faucetLink = faucetLink
    airdrop.description = description

    if (airdropImageUrl) {
      airdrop.airdropImageUrl = airdropImageUrl
    }

    // Handle guide image
    if (guideImageBase64) {
      // If we have a new base64 image, use that
      airdrop.guideImageUrl = guideImageBase64
    } else if (existingGuideImageUrl) {
      // Keep the existing guide image if no new one is uploaded
      airdrop.guideImageUrl = existingGuideImageUrl
    }

    await airdrop.save()

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error updating airdrop:", error)
    return { success: false, message: "An error occurred while updating the airdrop" }
  }
}

// Clone an airdrop from another user
export async function cloneAirdrop({ airdropId, userId }: { airdropId: string; userId: string }) {
  try {
    await connectToDatabase()

    // Find the original airdrop
    const originalAirdrop = await Airdrop.findById(airdropId)
    if (!originalAirdrop) {
      return { success: false, message: "Airdrop not found" }
    }

    // Check if user already has this airdrop
    const existingAirdrop = await Airdrop.findOne({
      userId,
      name: originalAirdrop.name,
      twitterLink: originalAirdrop.twitterLink,
    })

    if (existingAirdrop) {
      return { success: false, message: "You already have this airdrop in your dashboard" }
    }

    // Create a new airdrop based on the original
    const newAirdrop = new Airdrop({
      userId,
      name: originalAirdrop.name,
      type: originalAirdrop.type,
      chain: originalAirdrop.chain,
      twitterLink: originalAirdrop.twitterLink,
      discordLink: originalAirdrop.discordLink,
      airdropLink: originalAirdrop.airdropLink,
      faucetLink: originalAirdrop.faucetLink,
      description: originalAirdrop.description,
      airdropImageUrl: originalAirdrop.airdropImageUrl,
      guideImageUrl: originalAirdrop.guideImageUrl,
      completed: false,
    })

    await newAirdrop.save()

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error cloning airdrop:", error)
    return { success: false, message: "An error occurred while adding the airdrop" }
  }
}

// Ubah fungsi toggleAirdropCompletion untuk menerima parameter forceValue
export async function toggleAirdropCompletion(airdropId: string, forceValue?: boolean) {
  try {
    await connectToDatabase()

    const airdrop = await Airdrop.findById(airdropId)
    if (!airdrop) {
      return { success: false, message: "Airdrop not found" }
    }

    // Toggle completion status or set to forced value if provided
    airdrop.completed = forceValue !== undefined ? forceValue : !airdrop.completed

    // Store the exact timestamp when the status was changed
    airdrop.updatedAt = new Date()

    // If marking as completed, set completedAt
    if (airdrop.completed) {
      airdrop.completedAt = new Date()
    } else {
      // If marking as not completed, remove completedAt
      airdrop.completedAt = undefined
    }

    // Save the changes
    await airdrop.save()

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error toggling airdrop completion:", error)
    return { success: false, message: "An error occurred while updating the airdrop" }
  }
}

// Delete airdrop
export async function deleteAirdrop(airdropId: string) {
  try {
    await connectToDatabase()

    const result = await Airdrop.findByIdAndDelete(airdropId)
    if (!result) {
      return { success: false, message: "Airdrop not found" }
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error deleting airdrop:", error)
    return { success: false, message: "An error occurred while deleting the airdrop" }
  }
}
