import type {
  Quest,
  QuestCompletion,
  QuestCreateInput,
  QuestUpdateInput,
  QuestCompletionInput,
  ApiResponse,
} from "./types"
import { broadcastNotification } from "@/lib/socket-notification"

// Gunakan base URL dinamis untuk Client Component
const API_BASE_URL = typeof window !== "undefined" ? "/api" : "http://localhost:3000/api"

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    return {
      success: false,
      error: errorData.error || `Error: ${response.status} ${response.statusText}`,
    }
  }

  const data = await response.json()
  return {
    success: true,
    data: data,
  }
}

// Get all quests
export async function getAllQuests(): Promise<ApiResponse<Quest[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/quests`)
    return handleResponse<Quest[]>(response)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Get a single quest by ID
export async function getQuestById(id: string): Promise<ApiResponse<Quest>> {
  try {
    const response = await fetch(`${API_BASE_URL}/quests/${id}`)
    return handleResponse<Quest>(response)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Create a new quest
export async function createQuest(quest: QuestCreateInput): Promise<ApiResponse<Quest>> {
  try {
    const response = await fetch(`${API_BASE_URL}/quests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quest),
    })
    return handleResponse<Quest>(response)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Update an existing quest
export async function updateQuest(quest: QuestUpdateInput): Promise<ApiResponse<Quest>> {
  try {
    const response = await fetch(`${API_BASE_URL}/quests/${quest.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quest),
    })
    return handleResponse<Quest>(response)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Delete a quest
export async function deleteQuest(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/quests/${id}`, {
      method: "DELETE",
    })
    return handleResponse<void>(response)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Get quest completions for a user
export async function getUserQuestCompletions(userId: string): Promise<ApiResponse<QuestCompletion[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/quest-completions`)
    return handleResponse<QuestCompletion[]>(response)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Update quest completion status
export async function updateQuestCompletion(
  userId: string,
  data: QuestCompletionInput,
): Promise<ApiResponse<QuestCompletion>> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/quest-completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return handleResponse<QuestCompletion>(response)
  } catch (error) {
    console.error("Error in updateQuestCompletion:", error)
    return {
      success: false,
      error: error instanceof Error ? "Failed to update quest status" : "Unknown error occurred",
    }
  }
}

// Get all completions for a specific quest
export async function getQuestCompletions(questId: string): Promise<ApiResponse<QuestCompletion[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/quests/${questId}/completions`)
    return handleResponse<QuestCompletion[]>(response)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Delete multiple quests
export async function deleteMultipleQuests(ids: string[]): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/quests/batch-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    })
    return handleResponse<void>(response)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Update status of multiple quests
export async function updateQuestsStatus(ids: string[], status: "active" | "inactive"): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/quests/batch-update-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids, status }),
    })
    return handleResponse<void>(response)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Tambahkan fungsi ini ke file quest-service.ts yang sudah ada
export async function notifyNewQuest(quest: { id: string; name: string; description: string; createdBy: string }) {
  try {
    // Broadcast notifikasi ke semua pengguna
    await broadcastNotification(
      "Quest Baru Tersedia",
      `${quest.name} - ${quest.description.substring(0, 100)}${quest.description.length > 100 ? "..." : ""}`,
      "quest",
      quest.id,
      "quest",
      quest.createdBy, // Exclude creator from notification
    )

    return true
  } catch (error) {
    console.error("Error broadcasting quest notification:", error)
    return false
  }
}
