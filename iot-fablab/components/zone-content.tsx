"use client";

import useSWR from "swr";
import { SensorCard } from "@/components/sensor-card";
import { getLastDataByZone } from "@/lib/api-service";
import { Zone } from "@/lib/zones.enum";
import { Loader2 } from "lucide-react";
import type { ZoneData } from "@/lib/types";

interface ZoneContentProps {
  zone: Zone;
}

// Valeurs par defaut
function getDefaultData(zone: Zone): ZoneData {
  return {
    zone,
    temperature: { value: null, unit: "C", datereceive: null },
    airQuality: { value: null, unit: "%", datereceive: null },
    humidity: { value: null, unit: "%", datereceive: null },
    movement: { detected: null, datereceive: null },
    sound:
      zone === Zone.CARPENTRY
        ? { value: null, unit: "dB", datereceive: null }
        : undefined,
  };
}

export function ZoneContent({ zone }: ZoneContentProps) {
  const { data, isLoading } = useSWR(
    `zone-${zone}`,
    () => getLastDataByZone(zone),
    {
      refreshInterval: 300,
      revalidateOnFocus: false,
    },
  );

  const hasSound = zone === Zone.CARPENTRY;
  const hasntAirQuality = zone !== Zone.CARPENTRY;

  if (isLoading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Utilise les donnees ou les valeurs par defaut
  const zoneData = data ?? getDefaultData(zone);

  // Formatage des valeurs avec gestion null -> "-"
  const formatValue = (value: number | null, decimals = 0): string => {
    if (value === null) return "-";
    return decimals > 0 ? value.toFixed(decimals) : value.toString();
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("fr-FR");
  };

  const gasToPs = (
    gasValue: number | null | undefined,
    zone: string,
  ): number | undefined => {
    if (gasValue === null || gasValue === undefined) return undefined;

    if (zone === "Laser") {
      if (gasValue < 45) return 1;
      if (gasValue < 50) return 2;
      return 3;
    } else {
      if (gasValue < 55) return 1;
      if (gasValue < 60) return 2;
      return 3;
    }
  };

  const noiseToPs = (
    noiseValue: number | null | undefined,
  ): number | undefined => {
    if (noiseValue === null || noiseValue === undefined) return undefined;

    if (noiseValue <= 55) return 1;
    if (noiseValue <= 70) return 2;
    return 3;
  };

  const temperatureToPs = (
    temperatureValue: number | null | undefined,
  ): number | undefined => {
    if (temperatureValue === null || temperatureValue === undefined)
      return undefined;

    return temperatureValue <= 31 ? 1 : 2;
  };

  const humidityToPs = (
    humidityValue: number | null | undefined,
  ): number | undefined => {
    if (humidityValue === null || humidityValue === undefined) return undefined;

    return humidityValue <= 79 ? 1 : 2;
  };

  return (
    <>
      <section
        className={`grid gap-2 sm:gap-3 flex-1 ${hasSound || hasntAirQuality ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}
      >
        <SensorCard
          type="temperature"
          value={formatValue(zoneData.temperature.value, 1)}
          unit="°C"
          label="Temperature"
          datereceive={zoneData.temperature.datereceive}
          threshold={temperatureToPs(zoneData.temperature.value)}
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
            label="Qualite de l'Air"
            datereceive={zoneData.airQuality.datereceive}
            threshold={gasToPs(zoneData.airQuality.value, zone)}
          />
        )}
        <SensorCard
          type="humidity"
          value={formatValue(zoneData.humidity.value)}
          unit="%"
          label="Humidite"
          datereceive={zoneData.humidity.datereceive}
          threshold={humidityToPs(zoneData.humidity.value)}
        />
        {hasSound && zoneData.sound && (
          <SensorCard
            type="decibels"
            value={formatValue(zoneData.sound.value)}
            unit="dB"
            label="Niveau Sonore"
            datereceive={zoneData.sound.datereceive}
            threshold={noiseToPs(zoneData.sound.value)}
          />
        )}
      </section>
    </>
  );
}
