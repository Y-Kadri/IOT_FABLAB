export enum Zone {
  CARPENTRY = "Carpentry",
  ELECTRONICS = "Electronics",
  LASER = "Laser",
}

export const ZoneLabels: Record<Zone, string> = {
  [Zone.CARPENTRY]: "Menuiserie",
  [Zone.ELECTRONICS]: "Electronique & Soudure",
  [Zone.LASER]: "Decoupeuse Laser",
}

export const ZoneSlugs: Record<Zone, string> = {
  [Zone.CARPENTRY]: "menuiserie",
  [Zone.ELECTRONICS]: "electronique-soudure",
  [Zone.LASER]: "decoupeuse-laser",
}

export function getZoneFromSlug(slug: string): Zone | null {
  const entry = Object.entries(ZoneSlugs).find(([, value]) => value === slug)
  return entry ? (entry[0] as Zone) : null
}

export function getZoneLabel(zone: Zone): string {
  return ZoneLabels[zone]
}
