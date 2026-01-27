import Link from "next/link"
import { cn } from "@/lib/utils"
import type { ZoneData } from "@/lib/types"
import { Zone, ZoneSlugs, ZoneLabels } from "@/lib/zones.enum"
import { ChevronRight, Thermometer, Activity, Wind } from "lucide-react"

interface ZoneSummaryCardProps {
  zone: Zone
  data?: ZoneData
  className?: string
}

export function ZoneSummaryCard({ zone, data, className }: ZoneSummaryCardProps) {
  const slug = ZoneSlugs[zone]
  const label = ZoneLabels[zone]

  // Valeurs par defaut si pas de donnees
  const temperature = data?.temperature?.value ?? 0
  const motion = data?.movement?.detected ?? false
  const airQuality = data?.airQuality?.value ?? 0

  return (
    <Link
      href={`/zone/${slug}`}
      className={cn(
        "flex items-center justify-between rounded-lg bg-card border border-border p-3 sm:p-4 transition-colors hover:bg-secondary active:scale-[0.98]",
        className
      )}
    >
      <div className="flex flex-col gap-1 sm:gap-2 min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-card-foreground truncate">{label}</h3>
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <div className="flex items-center gap-1">
            <Thermometer className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
            <span className="text-xs sm:text-sm text-muted-foreground">{temperature}°C</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", motion ? "text-primary" : "text-muted-foreground")} />
            <span className="text-xs sm:text-sm text-muted-foreground">{motion ? "Actif" : "Inactif"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-chart-3" />
            <span className="text-xs sm:text-sm text-muted-foreground">{airQuality}%</span>
          </div>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
    </Link>
  )
}
