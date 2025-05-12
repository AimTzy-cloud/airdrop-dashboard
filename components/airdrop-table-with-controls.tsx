"use client"

import { useState } from "react"
import { AirdropTable } from "@/components/airdrop-table"
import { DashboardControls } from "@/components/dashboard-controls"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import type { AirdropDocument } from "@/lib/models/airdrop"

interface AirdropTableWithControlsProps {
  airdrops: AirdropDocument[]
  totalCount: number
  page?: number
  limit?: number
}

export function AirdropTableWithControls({ 
  airdrops, 
  totalCount,
  page = 1,
  limit = 10
}: AirdropTableWithControlsProps) {
  const [filteredAirdrops, setFilteredAirdrops] = useState(airdrops)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit)
  
  // Function to update URL with new page
  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }
  
  // Function to update URL with new limit
  {/*const changeLimit = (newLimit: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("limit", newLimit.toString())
    params.delete("page") // Reset to page 1 when changing limit
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }*/}

  return (
    <div className="space-y-4">
      <DashboardControls airdrops={airdrops} onFiltersChange={setFilteredAirdrops} />
      <AirdropTable airdrops={filteredAirdrops} />
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-400">
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, totalCount)} of {totalCount}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="bg-[#232836] border-gray-700 text-white hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="bg-[#232836] border-gray-700 text-white hover:bg-gray-700"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}