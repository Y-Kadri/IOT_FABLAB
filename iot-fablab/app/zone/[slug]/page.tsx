import { notFound } from "next/navigation"
import Link from "next/link"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ZoneContent } from "@/components/zone-content"
import { Zone, ZoneSlugs, ZoneLabels, getZoneFromSlug } from "@/lib/zones.enum"
import { ArrowLeft } from "lucide-react"

interface ZonePageProps {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return Object.values(Zone).map((zone) => ({
    slug: ZoneSlugs[zone],
  }))
}

export default async function ZonePage({ params }: ZonePageProps) {
  const { slug } = await params
  const zone = getZoneFromSlug(slug)

  if (!zone) {
    notFound()
  }

  const label = ZoneLabels[zone]

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
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
              {label}
            </h1>
            <p className="text-xs text-muted-foreground">Donnees en temps reel</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground hidden sm:inline">En direct</span>
          </div>
        </header>
        <ZoneContent zone={zone} />
      </main>
    </div>
  )
}
