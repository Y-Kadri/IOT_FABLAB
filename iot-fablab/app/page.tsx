import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardContent } from "@/components/dashboard-content";

export default function HomePage() {
  return (
    <div className="flex min-h-screen min-h-dvh bg-background">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col p-3 sm:p-4 gap-3 sm:gap-4 overflow-hidden pb-20 sm:pb-4">
        <header className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-foreground">
            Vue Generale
          </h1>
        </header>
        <DashboardContent />
      </main>
    </div>
  );
}
