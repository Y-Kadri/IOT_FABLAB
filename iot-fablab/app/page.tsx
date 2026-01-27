import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SensorCard } from "@/components/sensor-card"
import { ZoneSummaryCard } from "@/components/zone-summary-card"
import { zonesData, getAverages } from "@/lib/zones-data"

export default function HomePage() {
  const averages = getAverages()

  return (
    <div className="flex h-screen w-screen max-h-[480px] max-w-[800px] mx-auto overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Vue Générale</h1>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">En direct</span>
          </div>
        </header>

        <section className="grid grid-cols-3 gap-3">
          <SensorCard
            type="temperature"
            value={averages.temperature}
            unit="°C"
            label="Température Moyenne"
          />
          <SensorCard
            type="motion"
            value={`${averages.motionZones}/3`}
            label="Zones Actives"
          />
          <SensorCard
            type="air"
            value={averages.airQuality}
            unit="%"
            label="Qualité Air Moyenne"
          />
        </section>

        <section className="flex-1 flex flex-col gap-2 overflow-hidden">
          <h2 className="text-sm font-semibold text-muted-foreground">Zones</h2>
          <div className="flex flex-col gap-2 overflow-auto">
            {zonesData.map((zone) => (
              <ZoneSummaryCard key={zone.id} zone={zone} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
