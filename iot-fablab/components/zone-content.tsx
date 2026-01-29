"use client"

import useSWR from "swr"
import { SensorCard } from "@/components/sensor-card"
import { getLastDataByZone } from "@/lib/api-service"
import { Zone } from "@/lib/zones.enum"
import { Loader2 } from "lucide-react"
import type { ZoneData } from "@/lib/types"

interface ZoneContentProps {
  zone: Zone
}

// Valeurs par defaut
function getDefaultData(zone: Zone): ZoneData {
  return {
    zone,
    temperature: { value: 0, unit: "C", datereceive: new Date() },
    airQuality: { value: 0, unit: "%", datereceive: new Date() },
    humidity: { value: 0, unit: "%", datereceive: new Date() },
    movement: { detected: false, datereceive: new Date() },
    sound: zone === Zone.CARPENTRY ? { value: 0, unit: "dB", datereceive: new Date() } : undefined,
  }
}

export function ZoneContent({ zone }: ZoneContentProps) {
  const { data, isLoading } = useSWR(
    `zone-${zone}`,
    () => getLastDataByZone(zone),
    {
      refreshInterval: 5000,
      revalidateOnFocus: false,
    }
  )

  const hasSound = zone === Zone.CARPENTRY;
  const hasntAirQuality = zone !== Zone.CARPENTRY;

  if (isLoading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Utilise les donnees ou les valeurs par defaut
  const zoneData = data ?? getDefaultData(zone)

  return (
    <>
      <section className={`grid gap-2 sm:gap-3 flex-1 ${hasSound || hasntAirQuality ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
        <SensorCard
          type="temperature"
          value={zoneData.temperature.value.toFixed(1)}
          unit="°C"
          label="Temperature"
        />
        <SensorCard
          type="motion"
          value={zoneData.movement.detected}
          label="Mouvement Detecte"
        />
        {hasntAirQuality && (
            <SensorCard
            type="air"
            value={zoneData.airQuality.value.toFixed(0)}
            unit="%"
            label="Qualite de l'Air"
            />
        )}
        <SensorCard
          type="humidity"
          value={zoneData.humidity.value.toFixed(0)}
          unit="%"
          label="Humidite"
        />
        {hasSound && zoneData.sound && (
          <SensorCard
            type="decibels"
            value={zoneData.sound.value.toFixed(0)}
            unit="dB"
            label="Niveau Sonore"
          />
        )}
      </section>

      <footer className="flex justify-center">
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>Derniere mise a jour:</span>
          <span className="text-foreground">
            {new Date(zoneData.temperature.datereceive).toLocaleTimeString("fr-FR")}
          </span>
        </div>
      </footer>
    </>
  )
}
