"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AdminNavbar } from "@/components/admin-navbar";

export function NavbarSwitcher() {
  const pathname = usePathname();

  // Selama path /admin → pakai AdminNavbar
  if (pathname?.startsWith("/admin")) {
    return <AdminNavbar />;
  }

  // Selain itu → Navbar biasa
  return <Navbar />;
}
