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
    temperature: { value: null, unit: "C", datereceive: null },
    airQuality: { value: null, unit: "%", datereceive: null },
    humidity: { value: null, unit: "%", datereceive: null },
    movement: { detected: null, datereceive: null },
    sound: zone === Zone.CARPENTRY ? { value: null, unit: "dB", datereceive: null } : undefined,
  }
}

export function ZoneContent({ zone }: ZoneContentProps) {
  const { data, isLoading } = useSWR(
    `zone-${zone}`,
    () => getLastDataByZone(zone),
    {
      refreshInterval: 300,
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

  // Formatage des valeurs avec gestion null -> "-"
  const formatValue = (value: number | null, decimals = 0): string => {
    if (value === null) return "-"
    return decimals > 0 ? value.toFixed(decimals) : value.toString()
  }

  const formatDate = (date: Date | null): string => {
    if (!date) return "-"
    return new Date(date).toLocaleTimeString("fr-FR")
  }

  return (
    <>
      <section className={`grid gap-2 sm:gap-3 flex-1 ${hasSound || hasntAirQuality ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
        <SensorCard
          type="temperature"
          value={formatValue(zoneData.temperature.value, 1)}
          unit="°C"
          label="Temperature"
          datereceive={zoneData.temperature.datereceive}
        />
        <SensorCard
          type="motion"
          value={zoneData.movement.detected}
          label="Mouvement Detecte"
          datereceive={zoneData.movement.datereceive}
        />
        {hasntAirQuality && (
            <SensorCard
            type="air"
            value={formatValue(zoneData.airQuality.value)}
            unit="%"
            label="Qualite de l'Air"
            datereceive={zoneData.airQuality.datereceive}
            />
        )}
        <SensorCard
          type="humidity"
          value={formatValue(zoneData.humidity.value)}
          unit="%"
          label="Humidite"
          datereceive={zoneData.humidity.datereceive}
        />
        {hasSound && zoneData.sound && (
          <SensorCard
            type="decibels"
            value={formatValue(zoneData.sound.value)}
            unit="dB"
            label="Niveau Sonore"
            datereceive={zoneData.sound.datereceive}
          />
        )}
      </section>
    </>
  )
}
