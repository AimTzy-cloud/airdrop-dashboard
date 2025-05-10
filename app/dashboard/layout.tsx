import type React from "react"
import { redirect } from "next/navigation"
import { getSessionAppRouter } from "@/lib/auth-utils-app"
import { SidebarNav } from "@/components/sidebar-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Preloader } from "@/components/preloader"
import { PageTransition } from "@/components/page-transition"
import { ParticleBackground } from "@/components/particle-background"
import { DashboardNav } from "@/components/dashboard-nav"
import { SidebarArrowTrigger } from "@/components/sidebar-trigger"
import { NotificationListener } from "@/components/notification-listener"
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSessionAppRouter()

  if (!session) {
    redirect("/login")
  }

  // Gunakan userId dari session, fallback ke username jika userId tidak ada
  const userId = session.userId || session.username

  return (
    <html lang="en">
      <Preloader />
      <ParticleBackground />
      <PageTransition>
        <div className="min-h-screen bg-[#0a0e17] relative z-10">
          <SidebarProvider defaultOpen={false}>
            <SidebarNav username={session.username} />
            <SidebarArrowTrigger />
            <SidebarInset className="bg-[#0a0e17]">
              {/* Include NotificationListener for real-time notifications */}
              <NotificationListener userId={userId} username={session.username} />

              {/* Include DashboardNav here, passing the username, userId and profilePicture */}
              <DashboardNav username={session.username} userId={userId} profilePicture={session.profilePicture} />

              <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-8">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </PageTransition>
    </html>
  )
}
