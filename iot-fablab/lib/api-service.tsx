import { Zone } from "./zones.enum"
import type {
  ZoneData,
  ApiZoneResponse,
  AvgTemperatureResponse,
  AvgHumidityResponse,
  MovementCountResponse,
} from "./types"
import { toast } from "@/hooks/use-toast"

// URL de base de l'API backend local
const API_BASE_URL = "http://localhost:8000"

// Valeurs par defaut quand l'API ne repond pas
function getDefaultZoneData(zone: Zone): ZoneData {
  return {
    zone,
    temperature: { value: null, unit: "C", datereceive: null },
    airQuality: { value: null, unit: "%", datereceive: null },
    humidity: { value: null, unit: "%", datereceive: null },
    movement: { detected: null, datereceive: null },
    sound: zone === Zone.CARPENTRY ? { value: null, unit: "dB", datereceive: null } : undefined,
  }
}

function getDefaultAvgTemperature(): AvgTemperatureResponse {
  return { average: 0, unit: "C" }
}

function getDefaultAvgHumidity(): AvgHumidityResponse {
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
  return {
    zone,
    temperature: { 
      value: apiData.temperature, 
      unit: "C", 
      datereceive: apiData.temperature_date ? new Date(apiData.temperature_date) : null 
    },
    airQuality: { 
      value: apiData.gasconcentration, 
      unit: "%", 
      datereceive: apiData.gas_date ? new Date(apiData.gas_date) : null 
    },
    humidity: { 
      value: apiData.humidity, 
      unit: "%", 
      datereceive: apiData.humidity_date ? new Date(apiData.humidity_date) : null 
    },
    movement: { 
      detected: apiData.movement, 
      datereceive: apiData.movement_date ? new Date(apiData.movement_date) : null 
    },
    sound: zone === Zone.CARPENTRY ? { 
      value: apiData.noise, 
      unit: "dB", 
      datereceive: apiData.noise_date ? new Date(apiData.noise_date) : null 
    } : undefined,
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

// Recupere l'humidite moyenne de toutes les zones
export async function getAvgHumidity(): Promise<AvgHumidityResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/sensors/humidity/average`)
    if (!response.ok) {
      showErrorToast("Impossible de recuperer l'humidite moyenne")
      return getDefaultAvgHumidity()
    }
    return response.json()
  } catch {
    showErrorToast("Impossible de recuperer l'humidite moyenne")
    return getDefaultAvgHumidity()
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
  const [avgTemp, avgHumidity, movementCount, zonesData] = await Promise.all([
    getAvgTemperature(),
    getAvgHumidity(),
    getActualNbMovement(),
    getAllZonesData(),
  ])

  return {
    averages: {
      temperature: avgTemp.average,
      humidity: avgHumidity.average,
      motionZones: movementCount.count,
      totalZones: movementCount.total,
    },
    zones: zonesData,
  }
}
