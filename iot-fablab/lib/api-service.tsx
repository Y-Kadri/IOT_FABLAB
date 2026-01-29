import { Zone } from "./zones.enum"
import type {
  ZoneData,
  ApiZoneResponse,
  AvgTemperatureResponse,
  AvgAirQualityResponse,
  MovementCountResponse,
} from "./types"
import { toast } from "@/hooks/use-toast"

// URL de base de l'API backend local
const API_BASE_URL = "http://localhost:8000"

// Valeurs par defaut quand l'API ne repond pas
function getDefaultZoneData(zone: Zone): ZoneData {
  return {
    zone,
    temperature: { value: 0, unit: "C", timestamp: new Date() },
    airQuality: { value: 0, unit: "%", timestamp: new Date() },
    humidity: { value: 0, unit: "%", timestamp: new Date() },
    movement: { detected: false, timestamp: new Date() },
    sound: zone === Zone.CARPENTRY ? { value: 0, unit: "dB", timestamp: new Date() } : undefined,
  }
}

function getDefaultAvgTemperature(): AvgTemperatureResponse {
  return { average: 0, unit: "C" }
}

function getDefaultAvgAirQuality(): AvgAirQualityResponse {
  return { average: 0, unit: "%" }
}

function getDefaultMovementCount(): MovementCountResponse {
  return { count: 0, total: 3 }
}

// Affiche un toast d'erreur
function showErrorToast(message: string) {
  toast({
    title: "Erreur de communication",
    description: message,
    variant: "destructive",
  })
}

// Transforme la reponse API en format front
function mapApiResponseToZoneData(zone: Zone, apiData: ApiZoneResponse): ZoneData {
  const timestamp = new Date(apiData.datereceive)
  return {
    zone,
    temperature: { value: apiData.temperature, unit: "C", timestamp },
    airQuality: { value: apiData.airquality, unit: "%", timestamp },
    humidity: { value: apiData.humidity, unit: "%", timestamp },
    movement: { detected: apiData.movement, timestamp },
    sound: zone === Zone.CARPENTRY ? { value: apiData.noise, unit: "dB", timestamp } : undefined,
  }
}

// Recupere les dernieres donnees d'une zone
export async function getLastDataByZone(zone: Zone): Promise<ZoneData> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/last-by-zone/${zone}`)
    
    if (!response.ok) {
      showErrorToast(`Impossible de recuperer les donnees de la zone ${zone}`)
      return getDefaultZoneData(zone)
    }
    
    const apiData: ApiZoneResponse = await response.json()
    console.log("API Data for zone", zone, ":", apiData)
    return mapApiResponseToZoneData(zone, apiData)
  } catch {
    showErrorToast(`Impossible de recuperer les donnees de la zone ${zone}`)
    return getDefaultZoneData(zone)
  }
}

// Recupere la temperature moyenne de toutes les zones
export async function getAvgTemperature(): Promise<AvgTemperatureResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/sensors/temperature/average`)
    if (!response.ok) {
      showErrorToast("Impossible de recuperer la temperature moyenne")
      return getDefaultAvgTemperature()
    }
    return response.json()
  } catch {
    showErrorToast("Impossible de recuperer la temperature moyenne")
    return getDefaultAvgTemperature()
  }
}

// Recupere la qualite d'air moyenne de toutes les zones
export async function getAvgAirQuality(): Promise<AvgAirQualityResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/sensors/air-quality/average`)
    if (!response.ok) {
      showErrorToast("Impossible de recuperer la qualite d'air moyenne")
      return getDefaultAvgAirQuality()
    }
    return response.json()
  } catch {
    showErrorToast("Impossible de recuperer la qualite d'air moyenne")
    return getDefaultAvgAirQuality()
  }
}

// Recupere le nombre de zones avec mouvement detecte
export async function getActualNbMovement(): Promise<MovementCountResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/sensors/movement/count`)
    if (!response.ok) {
      showErrorToast("Impossible de recuperer le nombre de mouvements")
      return getDefaultMovementCount()
    }
    return response.json()
  } catch {
    showErrorToast("Impossible de recuperer le nombre de mouvements")
    return getDefaultMovementCount()
  }
}

// Recupere toutes les donnees de toutes les zones
export async function getAllZonesData(): Promise<ZoneData[]> {
  const zones = Object.values(Zone)
  const promises = zones.map((zone) => getLastDataByZone(zone))
  return Promise.all(promises)
}

// Recupere les donnees agregees pour la vue generale
export async function getDashboardData() {
  const [avgTemp, avgAirQuality, movementCount, zonesData] = await Promise.all([
    getAvgTemperature(),
    getAvgAirQuality(),
    getActualNbMovement(),
    getAllZonesData(),
  ])

  return {
    averages: {
      temperature: avgTemp.average,
      airQuality: avgAirQuality.average,
      motionZones: movementCount.count,
      totalZones: movementCount.total,
    },
    zones: zonesData,
  }
}
