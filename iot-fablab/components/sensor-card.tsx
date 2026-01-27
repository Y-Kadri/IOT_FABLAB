import { cn } from "@/lib/utils"
import {
  Thermometer,
  Activity,
  Wind,
  Volume2,
  Droplets,
} from "lucide-react"

interface SensorCardProps {
  type: "temperature" | "motion" | "air" | "decibels" | "humidity"
  value: number | boolean | string
  unit?: string
  label: string
  className?: string
}

const icons = {
  temperature: Thermometer,
  motion: Activity,
  air: Wind,
  decibels: Volume2,
  humidity: Droplets,
}

const colors = {
  temperature: "text-accent",
  motion: "text-primary",
  air: "text-chart-3",
  decibels: "text-chart-5",
  humidity: "text-chart-1",
}

export function SensorCard({ type, value, unit, label, className }: SensorCardProps) {
  const Icon = icons[type]
  const color = colors[type]

  const displayValue = typeof value === "boolean" 
    ? (value ? "Oui" : "Non") 
    : value

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-1 sm:gap-2 rounded-lg bg-card border border-border p-3 sm:p-4",
      className
    )}>
      <Icon className={cn("h-6 w-6 sm:h-8 sm:w-8", color)} />
      <div className="text-center">
        <p className="text-2xl sm:text-3xl font-bold text-card-foreground">
          {displayValue}
          {unit && <span className="text-sm sm:text-lg text-muted-foreground ml-1">{unit}</span>}
        </p>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  )
}
