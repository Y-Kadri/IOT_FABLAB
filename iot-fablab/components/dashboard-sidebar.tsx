"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Hammer, Cpu, Zap } from "lucide-react";

const navItems = [
  {
    name: "Vue Generale",
    shortName: "Accueil",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Menuiserie",
    shortName: "Menuiserie",
    href: "/zone/menuiserie",
    icon: Hammer,
  },
  {
    name: "Electronique",
    shortName: "Electro",
    href: "/zone/electronique-soudure",
    icon: Cpu,
  },
  {
    name: "Laser",
    shortName: "Laser",
    href: "/zone/decoupeuse-laser",
    icon: Zap,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar desktop/tablet */}
      <aside className="hidden sm:flex w-20 lg:w-24 flex-col bg-sidebar border-r border-sidebar-border shrink-0">
        <div className="flex h-14 items-center justify-center border-b border-sidebar-border">
          <span className="text-lg font-bold text-primary">IoT</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-lg p-3 text-sidebar-foreground transition-colors",
                  "hover:bg-sidebar-accent active:scale-95",
                  isActive && "bg-sidebar-accent text-primary",
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-[10px] leading-tight text-center">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Bottom nav mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-sidebar border-t border-sidebar-border px-2 py-2 safe-area-pb">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors",
                "hover:bg-sidebar-accent active:scale-95",
                isActive && "bg-sidebar-accent text-primary",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[9px] leading-tight">{item.shortName}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
