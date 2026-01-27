import Link from "next/link"
import { cn } from "@/lib/utils"
import type { ZoneData } from "@/lib/zones-data"
import { ChevronRight, Thermometer, Activity, Wind } from "lucide-react"

interface ZoneSummaryCardProps {
  zone: ZoneData
  className?: string
}

export function ZoneSummaryCard({ zone, className }: ZoneSummaryCardProps) {
  return (
    <Link
      href={`/zone/${zone.slug}`}
      className={cn(
        "flex items-center justify-between rounded-lg bg-card border border-border p-3 sm:p-4 transition-colors hover:bg-secondary active:scale-[0.98]",
        className
      )}
    >
      <div className="flex flex-col gap-1 sm:gap-2 min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-card-foreground truncate">{zone.name}</h3>
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <div className="flex items-center gap-1">
            <Thermometer className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
            <span className="text-xs sm:text-sm text-muted-foreground">{zone.temperature}°C</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", zone.motion ? "text-primary" : "text-muted-foreground")} />
            <span className="text-xs sm:text-sm text-muted-foreground">{zone.motion ? "Actif" : "Inactif"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-chart-3" />
            <span className="text-xs sm:text-sm text-muted-foreground">{zone.airQuality}%</span>
          </div>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
    </Link>
  )
}
