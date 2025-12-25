"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AdminNavbar } from "@/components/admin-navbar";

export function NavbarSwitcher() {
  const pathname = usePathname();
  
  // Jika path dimulai dengan /admin, gunakan AdminNavbar
  if (pathname?.startsWith('/admin')) {
    return <AdminNavbar />;
  }
  
  // Untuk halaman lain, gunakan Navbar biasa
  return <Navbar />;
}