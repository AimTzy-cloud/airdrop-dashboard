import type { Metadata } from "next"
import { NotificationList } from "@/components/notification-list"

export const metadata: Metadata = {
  title: "Notifications | Crypto Tracker",
  description: "View and manage your notifications",
}

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Notifications</h1>
        <p className="text-gray-400">View and manage your notifications.</p>
      </div>

      <NotificationList />
    </div>
  )
}
