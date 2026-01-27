"use client"

import useSWR from "swr"
import { SensorCard } from "@/components/sensor-card"
import { ZoneSummaryCard } from "@/components/zone-summary-card"
import { getDashboardData } from "@/lib/api-service"
import { Zone } from "@/lib/zones.enum"
import { Loader2 } from "lucide-react"

export function DashboardContent() {
  const { data, isLoading } = useSWR("dashboard", getDashboardData, {
    refreshInterval: 5000,
    revalidateOnFocus: false,
  })

  if (isLoading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Valeurs par defaut si pas de donnees
  const averages = data?.averages ?? { temperature: 0, airQuality: 0, motionZones: 0, totalZones: 3 }
  const zonesData = data?.zones ?? []
  const zones = Object.values(Zone)

  return (
    <>
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <SensorCard
          type="temperature"
          value={averages.temperature.toFixed(1)}
          unit="°C"
          label="Temperature Moyenne"
        />
        <SensorCard
          type="motion"
          value={`${averages.motionZones}/${averages.totalZones}`}
          label="Zones Actives"
        />
        <SensorCard
          type="air"
          value={averages.airQuality.toFixed(0)}
          unit="%"
          label="Qualite Air Moyenne"
        />
      </section>

      <section className="flex-1 flex flex-col gap-2 overflow-hidden">
        <h2 className="text-sm font-semibold text-muted-foreground">Zones</h2>
        <div className="flex flex-col gap-2 overflow-auto">
          {zones.map((zone, index) => (
            <ZoneSummaryCard 
              key={zone} 
              zone={zone} 
              data={zonesData[index]} 
            />
          ))}
        </div>
      </section>
    </>
  )
}
