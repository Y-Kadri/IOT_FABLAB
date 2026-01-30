// Reponse brute de l'API backend
export interface ApiZoneResponse {
  zone: string

  temperature: number | null
  temperature_date: string | null

  humidity: number | null
  humidity_date: string | null

  gasconcentration: number | null
  gas_date: string | null

  movement: boolean | null
  movement_date: string | null

  noise: number | null
  noise_date: string | null
}


// Modeles de donnees capteurs (format front)
export interface Temperature {
  value: number | null
  unit: "C" | "F"
  datereceive: Date | null
}

export interface AirQuality {
  value: number | null
  unit: "ppm" | "%"
  datereceive: Date | null
}

export interface Humidity {
  value: number | null
  unit: "%"
  datereceive: Date | null
}

export interface Movement {
  detected: boolean | null
  datereceive: Date | null
}

export interface Sound {
  value: number | null
  unit: "dB"
  datereceive: Date | null
}

// Donnees completes d'une zone (format front)
export interface ZoneData {
  zone: string
  temperature: Temperature
  airQuality: AirQuality
  humidity: Humidity
  movement: Movement
  sound?: Sound
}

// Reponses API agregees
export interface AvgTemperatureResponse {
  average: number
  unit: "C" | "F"
}

export interface AvgAirQualityResponse {
  average: number
  unit: "ppm" | "%"
}

export interface MovementCountResponse {
  count: number
  total: number
}
