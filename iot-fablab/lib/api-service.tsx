import { Zone } from "./zones.enum"
import type {
  ZoneData,
  ApiZoneResponse,
  StatsResponse,
} from "./types"
import { toast } from "@/hooks/use-toast"

// URL de base de l'API backend local
const API_BASE_URL = "http://192.168.137.11:8000"

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

function getDefaultStats(): StatsResponse {
  return { average_temperature: null, average_humidity: null, total_movements: 0 }
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

// Recupere les statistiques agregees (temperature moyenne, humidite moyenne, total mouvements)
export async function getStats(): Promise<StatsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/stats`)
    if (!response.ok) {
      showErrorToast("Impossible de recuperer les statistiques")
      return getDefaultStats()
    }
    return response.json()
  } catch {
    showErrorToast("Impossible de recuperer les statistiques")
    return getDefaultStats()
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
  const [stats, zonesData] = await Promise.all([
    getStats(),
    getAllZonesData(),
  ])

  return {
    averages: {
      temperature: stats.average_temperature,
      humidity: stats.average_humidity,
      totalMovements: stats.total_movements,
    },
    zones: zonesData,
  }
}
