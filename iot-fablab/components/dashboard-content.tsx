"use client"

import useSWR from "swr"
import { SensorCard } from "@/components/sensor-card"
import { ZoneSummaryCard } from "@/components/zone-summary-card"
import { getDashboardData } from "@/lib/api-service"
import { Zone } from "@/lib/zones.enum"
import { Loader2 } from "lucide-react"

export function DashboardContent() {
  const { data, isLoading } = useSWR("dashboard", getDashboardData, {
    refreshInterval: 300,
    revalidateOnFocus: false,
  })

  if (isLoading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  console.log("Dashboard data:", data)

  // Valeurs par defaut si pas de donnees
  const averages = data?.averages ?? { temperature: null, humidity: null, totalMovements: 0 }
  const zonesData = data?.zones ?? []
  const zones = Object.values(Zone)

  let nbMovement = 0;
  zones.forEach((zone, index) => {
    if (zonesData[index]?.movement?.detected) {
      nbMovement++;}
  })

  // Formatage avec gestion null/undefined -> "-"
  const formatAverage = (
    value: number | null | undefined,
    decimals = 2
  ): string => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return "-"
    }

    return value.toFixed(decimals)
  }

  return (
    <>
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <SensorCard
          type="temperature"
          value={formatAverage(averages.temperature, 1)}
          unit="°C"
          label="Temperature Moyenne"
        />
        <SensorCard
          type="humidity"
          value={formatAverage(averages.humidity)}
          unit="%"
          label="Humidite Moyenne"
        />
        <SensorCard
          type="motion"
          value={nbMovement> 0 ? nbMovement.toString() : "-"}
          unit="/3"
          label="Mouvements Detectes"
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
