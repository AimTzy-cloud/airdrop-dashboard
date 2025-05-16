import { redirect } from "next/navigation"
import { getSessionAppRouter } from "@/lib/auth-utils-app";
import { getAirdrops } from "@/lib/airdrop-actions"
import { Suspense } from "react"
import { AirdropTableSkeleton } from "@/components/airdrop-table-skeleton"
import { Button } from "@/components/ui/button"
import { Plus, BarChart3, Wallet, Coins, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AirdropTableWithControls } from "@/components/airdrop-table-with-controls"
import { AnimatedElement } from "@/components/animated-element"
import { PageLoader } from "@/components/loading-spinner"

export default async function DashboardPage() {
  const session = await getSessionAppRouter()

  if (!session) {
    redirect("/login")
  }

  return (
    <>
      <PageLoader />
      <div className="space-y-8">
        <AnimatedElement animation="fadeUp" delay={0.1}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400 mt-1">Track and manage your crypto airdrops</p>
            </div>
            <div className="flex items-center">
              <Link href="/dashboard/add">
                <Button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="mr-2 h-4 w-4 transition-transform group-hover:scale-125" />
                  Add Airdrop
                </Button>
              </Link>
            </div>
          </div>
        </AnimatedElement>

        <Suspense fallback={<StatsCardsSkeleton />}>
          <StatsCards userId={session.userId} />
        </Suspense>

        <AnimatedElement animation="fadeUp" delay={0.6}>
          <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-6">
            <Suspense fallback={<AirdropTableSkeleton />}>
              <AirdropContent userId={session.userId} />
            </Suspense>
          </div>
        </AnimatedElement>
      </div>
    </>
  )
}

// Update the StatsCards function to show the correct data
async function StatsCards({ userId }: { userId: string }) {
  const airdrops = await getAirdrops(userId)

  // Calculate stats
  const totalAirdrops = airdrops.length
  const completedAirdrops = airdrops.filter((airdrop) => airdrop.completed).length
  const activeAirdrops = totalAirdrops - completedAirdrops

  // Calculate daily completed airdrops (those completed in the last 24 hours)
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)
  const dailyCompletedAirdrops = airdrops.filter(
    (airdrop) => airdrop.completed && airdrop.updatedAt && new Date(airdrop.updatedAt) >= oneDayAgo,
  ).length

  // Calculate daily completion percentage
  const dailyCompletionPercentage = activeAirdrops > 0 ? Math.round((dailyCompletedAirdrops / activeAirdrops) * 100) : 0

  // Calculate upcoming airdrops (those added in the last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const upcomingAirdrops = airdrops.filter((airdrop) => new Date(airdrop.createdAt) >= sevenDaysAgo).length

  // Estimate value (this is a placeholder - you might want to implement your own logic)
  const estimatedValue = completedAirdrops * 50 + activeAirdrops * 30 // Simple placeholder calculation

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <AnimatedElement animation="fadeUp" delay={0.2}>
        <Card className="bg-[#1a1f2e] border-gray-700 hover:border-gray-600 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-bl-full"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Total Airdrops</CardDescription>
            <CardTitle className="text-2xl text-white flex items-baseline">
              {totalAirdrops}
              <span className="ml-2 text-sm text-green-400 flex items-center">
                +{upcomingAirdrops}
                <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {activeAirdrops} active, {completedAirdrops} completed
              </span>
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </AnimatedElement>

      <AnimatedElement animation="fadeUp" delay={0.3}>
        <Card className="bg-[#1a1f2e] border-gray-700 hover:border-gray-600 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-600/10 to-blue-600/10 rounded-bl-full"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Estimated Value</CardDescription>
            <CardTitle className="text-2xl text-white flex items-baseline">
              ${estimatedValue}
              <span className="ml-2 text-sm text-green-400 flex items-center">
                +${upcomingAirdrops * 20}
                <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Based on current market data</span>
              <Wallet className="h-5 w-5 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </AnimatedElement>

      <AnimatedElement animation="fadeUp" delay={0.4}>
        <Card className="bg-[#1a1f2e] border-gray-700 hover:border-gray-600 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-bl-full"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Completed Airdrop Daily</CardDescription>
            <CardTitle className="text-2xl text-white flex items-baseline">
              {dailyCompletionPercentage}%
              <span className="ml-2 text-sm text-green-400 flex items-center">
                {dailyCompletedAirdrops} today
                <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {dailyCompletedAirdrops}/{activeAirdrops} daily tasks
              </span>
              <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${dailyCompletionPercentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedElement>

      <AnimatedElement animation="fadeUp" delay={0.5}>
        <Card className="bg-[#1a1f2e] border-gray-700 hover:border-gray-600 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-600/10 to-red-600/10 rounded-bl-full"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Upcoming Airdrops</CardDescription>
            <CardTitle className="text-2xl text-white flex items-baseline">
              {upcomingAirdrops}
              <span className="ml-2 text-sm text-yellow-400 flex items-center">Next 7 days</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">{Math.ceil(upcomingAirdrops / 3) || 0} high priority</span>
              <Coins className="h-5 w-5 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  )
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-6 h-[140px] animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-800 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-800 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  )
}

async function AirdropContent({ userId }: { userId: string }) {
  const airdrops = await getAirdrops(userId)
  const hasAirdrops = airdrops.length > 0

  if (!hasAirdrops) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-gray-700 rounded-lg bg-[#1a1f2e] text-white shadow-lg">
        <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
          <Coins className="h-8 w-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-medium mb-2">No airdrops yet</h3>
        <p className="text-gray-400 mb-6 max-w-md">Start tracking your crypto airdrops by adding your first one</p>
        <Link href="/dashboard/add">
          <Button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="mr-2 h-4 w-4 transition-transform group-hover:scale-125" />
            Add Your First Airdrop
          </Button>
        </Link>
      </div>
    )
  }

  return <AirdropTableWithControls airdrops={airdrops} />
}