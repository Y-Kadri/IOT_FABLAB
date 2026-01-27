import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardContent } from "@/components/dashboard-content"

export default function HomePage() {
  return (
    <div className="flex min-h-screen min-h-dvh bg-background">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col p-3 sm:p-4 gap-3 sm:gap-4 overflow-hidden pb-20 sm:pb-4">
        <header className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Vue Generale</h1>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">En direct</span>
          </div>
        </header>
        <DashboardContent />
      </main>
    </div>
  )
}
