"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", key: "dashboard" },
  { href: "/inbound", label: "Inbound", key: "inbound" },
  { href: "/outbound", label: "Outbound", key: "outbound" },
  { href: "/inventory", label: "Inventory", key: "inventory" },
  { href: "/history", label: "History", key: "history" },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="text-xl">🏠</span>
          <span>Sistem Gudang FG</span>
        </Link>
        <nav className="flex items-center gap-2">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.key}
              variant={pathname === item.href ? "default" : "ghost"}
              asChild
              className={pathname === item.href ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  )
}