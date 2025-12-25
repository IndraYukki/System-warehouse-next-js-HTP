"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

const ADMIN_NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/admin/statistics", label: "Statistik", key: "statistics" },
  { href: "/admin/rack-status", label: "Status Rak", key: "rack-status" },
  { href: "/admin/edit-product", label: "Edit Product", key: "edit-product" },
  { href: "/admin/edit-inventory", label: "Edit Inventory", key: "edit-inventory" },
]

export function AdminNavbar() {
  const pathname = usePathname()

  return (
    <header className="border-b bg-muted/40">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
          <span className="text-xl">📋</span>
          <span>Admin Dashboard</span>
        </Link>
        <nav className="flex items-center gap-2">
          {ADMIN_NAV_ITEMS.map((item) => (
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