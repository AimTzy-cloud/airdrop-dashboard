"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"

// Define emoji categories
const emojiCategories = {
  recent: "🕒 Recent",
  smileys: "😀 Smileys",
  people: "👋 People",
  animals: "🐶 Animals",
  food: "🍔 Food",
  travel: "✈️ Travel",
  activities: "⚽ Activities",
  objects: "💡 Objects",
  symbols: "❤️ Symbols",
  flags: "🏁 Flags",
}

// Define emojis for each category
const emojis = {
  recent: [] as string[],
  smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "🙃",
    "😉",
    "😊",
    "😇",
    "🥰",
    "😍",
    "🤩",
    "😘",
    "😗",
    "😚",
    "😙",
  ],
  people: [
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👌",
    "🤌",
    "🤏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "👍",
    "👎",
  ],
  animals: [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐻‍❄️",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🐔",
    "🐧",
    "🐦",
    "🐤",
  ],
  food: [
    "🍏",
    "🍎",
    "🍐",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🫐",
    "🍈",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🍆",
    "🥑",
  ],
  travel: [
    "✈️",
    "🚀",
    "🚁",
    "🚂",
    "🚃",
    "🚄",
    "🚅",
    "🚆",
    "🚇",
    "🚈",
    "🚉",
    "🚊",
    "🚝",
    "🚞",
    "🚋",
    "🚌",
    "🚍",
    "🚎",
    "🚐",
    "🚑",
  ],
  activities: [
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🥎",
    "🎾",
    "🏐",
    "🏉",
    "🥏",
    "🎱",
    "🪀",
    "🏓",
    "🏸",
    "🏒",
    "🏑",
    "🥍",
    "🏏",
    "🪃",
    "🥅",
    "⛳",
  ],
  objects: [
    "💡",
    "🔦",
    "🕯️",
    "🪔",
    "🧯",
    "🛢️",
    "💸",
    "💵",
    "💴",
    "💶",
    "💷",
    "💰",
    "💳",
    "💎",
    "⚖️",
    "🪜",
    "🧰",
    "🪛",
    "🔧",
    "🔨",
  ],
  symbols: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "☮️",
  ],
  flags: [
    "🏁",
    "🚩",
    "🎌",
    "🏴",
    "🏳️",
    "🏳️‍🌈",
    "🏳️‍⚧️",
    "🏴‍☠️",
    "🇦🇨",
    "🇦🇩",
    "🇦🇪",
    "🇦🇫",
    "🇦🇬",
    "🇦🇮",
    "🇦🇱",
    "🇦🇲",
    "🇦🇴",
    "🇦🇶",
    "🇦🇷",
    "🇦🇸",
  ],
}

// Load recent emojis from localStorage
const loadRecentEmojis = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("recentEmojis")
    return stored ? JSON.parse(stored) : []
  }
  return []
}

// Save recent emojis to localStorage
const saveRecentEmoji = (emoji: string) => {
  if (typeof window !== "undefined") {
    const recent = loadRecentEmojis()
    const newRecent = [emoji, ...recent.filter((e: string) => e !== emoji)].slice(0, 20)
    localStorage.setItem("recentEmojis", JSON.stringify(newRecent))
    return newRecent
  }
  return []
}

interface EmojiPickerProps {
  onEmojiSelect: (emoji: { native: string }) => void
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("smileys")
  const [recentEmojis, setRecentEmojis] = useState<string[]>([])

  useEffect(() => {
    setRecentEmojis(loadRecentEmojis())
  }, [])

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect({ native: emoji })
    const newRecent = saveRecentEmoji(emoji)
    setRecentEmojis(newRecent)
  }

  const filteredEmojis = searchQuery
    ? Object.values(emojis)
        .flat()
        .filter((emoji) => emoji.includes(searchQuery))
    : activeCategory === "recent"
      ? recentEmojis
      : emojis[activeCategory as keyof typeof emojis]

  return (
    <div className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg overflow-hidden">
      <div className="p-2 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search emoji"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-gray-800 border-gray-700"
          />
        </div>
      </div>

      {!searchQuery && (
        <Tabs defaultValue="smileys" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid grid-cols-5 h-auto p-0 bg-[#1a1f2e]">
            {Object.entries(emojiCategories)
              .slice(0, 5)
              .map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="py-2 px-1 text-xs data-[state=active]:bg-gray-800">
                  {label.split(" ")[0]}
                </TabsTrigger>
              ))}
          </TabsList>
          <TabsList className="grid grid-cols-5 h-auto p-0 bg-[#1a1f2e] border-b border-gray-700">
            {Object.entries(emojiCategories)
              .slice(5)
              .map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="py-2 px-1 text-xs data-[state=active]:bg-gray-800">
                  {label.split(" ")[0]}
                </TabsTrigger>
              ))}
          </TabsList>

          {Object.keys(emojiCategories).map((category) => (
            <TabsContent key={category} value={category} className="m-0">
              <ScrollArea className="h-[200px] p-2">
                <div className="grid grid-cols-8 gap-1">
                  {(category === "recent" ? recentEmojis : emojis[category as keyof typeof emojis]).map(
                    (emoji, index) => (
                      <button
                        key={`${emoji}-${index}`}
                        className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-800 text-lg"
                        onClick={() => handleEmojiClick(emoji)}
                      >
                        {emoji}
                      </button>
                    ),
                  )}
                  {category === "recent" && recentEmojis.length === 0 && (
                    <div className="col-span-8 h-[200px] flex items-center justify-center text-gray-500 text-sm">
                      No recent emojis
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {searchQuery && (
        <ScrollArea className="h-[250px] p-2">
          {filteredEmojis.length > 0 ? (
            <div className="grid grid-cols-8 gap-1">
              {filteredEmojis.map((emoji, index) => (
                <button
                  key={`search-${emoji}-${index}`}
                  className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-800 text-lg"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">No emojis found</div>
          )}
        </ScrollArea>
      )}
    </div>
  )
}
