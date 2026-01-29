export interface ApiZoneResponse {
  humidity: number
  temperature: number
  movement: boolean
  datereceive: string
  id_zone: number
  airquality: number
  id_value: number
  noise: number
}

export interface Temperature {
  value: number
  unit: "C" | "F"
  timestamp: Date
}

export interface AirQuality {
  value: number
  unit: "ppm" | "%"
  timestamp: Date
}

export interface Humidity {
  value: number
  unit: "%"
  timestamp: Date
}

export interface Movement {
  detected: boolean
  timestamp: Date
}

export interface Sound {
  value: number
  unit: "dB"
  timestamp: Date
}

export interface ZoneData {
  zone: string
  temperature: Temperature
  airQuality: AirQuality
  humidity: Humidity
  movement: Movement
  sound?: Sound
}

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
