"use client"

import { useState } from "react"
import { AirdropTable } from "@/components/airdrop-table"
import { DashboardControls } from "@/components/dashboard-controls"
import type { AirdropDocument } from "@/lib/models/airdrop"

interface AirdropTableWithControlsProps {
  airdrops: AirdropDocument[]
}

export function AirdropTableWithControls({ airdrops }: AirdropTableWithControlsProps) {
  const [filteredAirdrops, setFilteredAirdrops] = useState(airdrops)

  return (
    <>
      <DashboardControls airdrops={airdrops} onFiltersChange={setFilteredAirdrops} />
      <AirdropTable airdrops={filteredAirdrops} />
    </>
  )
}