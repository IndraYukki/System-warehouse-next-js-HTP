"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AdminNavbar } from "@/components/admin-navbar";
import { useAuth } from "@/components/hooks/useAuth";

export function NavbarSwitcher() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Jika path dimulai dengan /admin, gunakan AdminNavbar
  if (pathname?.startsWith('/admin')) {
    // Jika sedang memuat atau tidak ada user, tampilkan AdminNavbar sebagai default
    if (loading || !user) {
      return <AdminNavbar />;
    }

    // Jika user dengan role 'user' mencoba mengakses halaman admin,
    // mereka seharusnya tidak sampai ke sini karena middleware,
    // tapi kita tetap tampilkan Navbar biasa sebagai fallback
    if (user.role === 'user') {
      return <Navbar />;
    }

    return <AdminNavbar />;
  }

  // Untuk halaman lain, gunakan Navbar biasa
  return <Navbar />;
}