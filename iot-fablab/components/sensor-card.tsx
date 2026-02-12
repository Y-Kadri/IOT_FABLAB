import { cn } from "@/lib/utils";
import { Thermometer, Activity, Wind, Volume2, Droplets } from "lucide-react";

interface SensorCardProps {
  type: "temperature" | "motion" | "air" | "decibels" | "humidity";
  value: number | boolean | string | null;
  unit?: string;
  label: string;
  datereceive?: Date | null;
  className?: string;
  threshold?: number;
}

function formatLastEmission(date: Date | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const icons = {
  temperature: Thermometer,
  motion: Activity,
  air: Wind,
  decibels: Volume2,
  humidity: Droplets,
};

const colors = {
  temperature: "text-accent",
  motion: "text-primary",
  air: "text-chart-3",
  decibels: "text-chart-5",
  humidity: "text-chart-1",
};

const getStatusColor = (ps: number): string => {
  switch (ps) {
    case 1:
      return "";
    case 2:
      return "#ff9800";
    case 3:
      return "#f44336";
    default:
      return "";
  }
};

export function SensorCard({
  type,
  value,
  unit,
  label,
  datereceive,
  className,
  threshold,
}: SensorCardProps) {
  const Icon = icons[type];
  const color = colors[type];
  const backgroundColor = getStatusColor(threshold ?? 0);
  const maxGasContration = 200;
  // Gestion des valeurs null avec "-"
  let displayValue: string;
  if (value === null) {
    displayValue = "-";
  } else if (typeof value === "boolean") {
    displayValue = value ? "Oui" : "Non";
  } else {
    displayValue = String(value);
  }

  console.log("typeof val ", typeof value)
  if (type === "air" && typeof value === "number") {
    if (value > maxGasContration) {
      value = maxGasContration;
    }
    displayValue = (value / maxGasContration * 100).toFixed(2);
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 sm:gap-2 rounded-lg border border-border p-3 sm:p-4 transition-colors duration-300",
        !backgroundColor && "bg-card",
        className,
      )}
      style={{ backgroundColor: backgroundColor || undefined }}
    >
      <Icon
        className={cn(
          "h-6 w-6 sm:h-8 sm:w-8",
          threshold && threshold > 1 ? "text-white" : color,
        )}
      />

      <div className="text-center">
        <p
          className={cn(
            "text-2xl sm:text-3xl font-bold",
            threshold && threshold > 1 ? "text-white" : "text-card-foreground",
          )}
        >
          {displayValue}
          {unit && displayValue !== "-" && (
            <span
              className={cn(
                "text-sm sm:text-lg ml-1",
                threshold && threshold > 1
                  ? "text-white/80"
                  : "text-muted-foreground",
              )}
            >
              {unit}
            </span>
          )}
        </p>
        <p
          className={cn(
            "text-[10px] sm:text-xs mt-1",
            threshold && threshold > 1
              ? "text-white/90"
              : "text-muted-foreground",
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "text-[9px] sm:text-[10px] mt-0.5",
            threshold && threshold > 1
              ? "text-white/70"
              : "text-muted-foreground/70",
          )}
        >
          Derniere emission: {formatLastEmission(datereceive)}
        </p>
      </div>
    </div>
  );
}
