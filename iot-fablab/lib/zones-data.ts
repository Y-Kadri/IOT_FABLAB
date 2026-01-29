export interface ZoneData {
  id: string
  name: string
  slug: string
  temperature: number
  motion: boolean
  airQuality: number
  decibels?: number
}

export const zonesData: ZoneData[] = [
  {
    id: "menuiserie",
    name: "Menuiserie",
    slug: "menuiserie",
    temperature: 22.5,
    motion: true,
    airQuality: 78,
    decibels: 65,
  },
  {
    id: "electronique",
    name: "Électronique & Soudure",
    slug: "electronique-soudure",
    temperature: 24.2,
    motion: false,
    airQuality: 92,
  },
  {
    id: "laser",
    name: "Découpeuse Laser",
    slug: "decoupeuse-laser",
    temperature: 26.8,
    motion: true,
    airQuality: 68,
  },
]

export function getZoneBySlug(slug: string): ZoneData | undefined {
  return zonesData.find((zone) => zone.slug === slug)
}

export function getAverages() {
  const avgTemp =
    zonesData.reduce((sum, z) => sum + z.temperature, 0) / zonesData.length
  const motionCount = zonesData.filter((z) => z.motion).length
  const avgAir =
    zonesData.reduce((sum, z) => sum + z.airQuality, 0) / zonesData.length

  return {
    temperature: Math.round(avgTemp * 10) / 10,
    motionZones: motionCount,
    airQuality: Math.round(avgAir),
  }
}
