import { notFound } from "next/navigation"
import Link from "next/link"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SensorCard } from "@/components/sensor-card"
import { getZoneBySlug, zonesData } from "@/lib/zones-data"
import { ArrowLeft } from "lucide-react"

interface ZonePageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return zonesData.map((zone) => ({
    slug: zone.slug,
  }))
}

export default async function ZonePage({ params }: ZonePageProps) {
  const { slug } = await params
  const zone = getZoneBySlug(slug)

  if (!zone) {
    notFound()
  }

  const hasDecibels = zone.decibels !== undefined

  return (
    <div className="flex min-h-screen min-h-dvh bg-background">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col p-3 sm:p-4 gap-3 sm:gap-4 overflow-hidden pb-20 sm:pb-4">
        <header className="flex items-center gap-3">
          <Link 
            href="/" 
            className="flex items-center justify-center h-10 w-10 rounded-lg bg-secondary hover:bg-border transition-colors active:scale-95"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{zone.name}</h1>
            <p className="text-xs text-muted-foreground">Donnees en temps reel</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground hidden sm:inline">En direct</span>
          </div>
        </header>

        <section className={`grid gap-2 sm:gap-3 flex-1 ${hasDecibels ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
          <SensorCard
            type="temperature"
            value={zone.temperature}
            unit="°C"
            label="Temperature"
          />
          <SensorCard
            type="motion"
            value={zone.motion}
            label="Mouvement Detecte"
          />
          <SensorCard
            type="air"
            value={zone.airQuality}
            unit="%"
            label="Qualite de l'Air"
          />
          {hasDecibels && (
            <SensorCard
              type="decibels"
              value={zone.decibels!}
              unit="dB"
              label="Niveau Sonore"
            />
          )}
        </section>

        <footer className="flex justify-center">
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>Derniere mise a jour:</span>
            <span className="text-foreground">maintenant</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
