"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/hooks/useAuth"
import { useState, useEffect, useRef } from "react"
import { User, Home, BarChart3, LogOut, Package, FileText, TrendingUp, Edit } from "lucide-react"

export function AdminNavbar() {
  const pathname = usePathname()
  const { user, logout, loading } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 4 && currentHour < 11) {
      return "Pagi";
    } else if (currentHour >= 11 && currentHour < 15) {
      return "Siang";
    } else if (currentHour >= 15 && currentHour < 18) {
      return "Sore";
    } else {
      return "Malam";
    }
  };

  const handleLogout = async () => {
    await logout()
    setShowDropdown(false)
    // Arahkan ke halaman login setelah logout
    window.location.href = '/'
  }

  // Fungsi untuk menangani scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fungsi untuk menutup dropdown saat klik di luar area dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    // Tambahkan event listener saat dropdown terbuka
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    // Hapus event listener saat komponen unmount atau dropdown tertutup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  // Tentukan item navigasi berdasarkan role
  const getAdminNavItems = () => {
    if (!user) return [];

    // Item dasar untuk semua role yang bisa mengakses halaman admin
    const baseItems = [
      { href: "/admin/dashboard", label: "Dashboard", key: "dashboard", icon: BarChart3 },
      { href: "/admin/rack-status", label: "Status Rak", key: "rack-status", icon: Package },
    ];

    // Hanya admin dan manager yang bisa mengakses statistik
    if (user.role === 'admin' || user.role === 'manager') {
      baseItems.push(
        { href: "/admin/statistics", label: "Statistik", key: "statistics", icon: TrendingUp }
      );
    }

    // Hanya admin dan manager yang bisa mengakses edit product
    if (user.role === 'admin' || user.role === 'manager') {
      baseItems.push(
        { href: "/admin/edit-product", label: "Edit Product", key: "edit-product", icon: Edit }
      );
    }

    // Hanya admin yang bisa mengakses edit inventory
    if (user.role === 'admin') {
      baseItems.push(
        { href: "/admin/edit-inventory", label: "Edit Inventory", key: "edit-inventory", icon: Edit }
      );
    }

    return baseItems;
  };

  const navItems = getAdminNavItems();

  return (
    <header className={`border-b bg-muted/40 sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-muted/90 backdrop-blur-sm' : 'bg-muted/40'}`}>
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
            <span className="text-xl">📋</span>
            <span>Admin Dashboard</span>
          </Link>
          {!loading && user && (
            <p className="text-sm text-muted-foreground">
              Selamat {getGreeting()} {user.nama_panggilan}, Selamat Datang
            </p>
          )}
        </div>
        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.key}
                variant={pathname === item.href ? "default" : "ghost"}
                asChild
                className={pathname === item.href ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}

          {/* Dropdown Akun (Hanya muncul jika user ada) */}
          {!loading && user && (
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="outline"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <User className="mr-2 h-4 w-4" /> {user.nama_panggilan}
              </Button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50 py-1">
                  <Link
                    href="/"
                    className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Home className="mr-2 h-4 w-4" /> Kembali ke Beranda
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
          {loading && <Button variant="outline" disabled>Loading...</Button>}
        </nav>
      </div>
    </header>
  )
}