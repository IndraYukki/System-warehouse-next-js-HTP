"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/hooks/useAuth"
import { useState, useEffect, useRef } from "react"
import { User, BarChart3, LogOut, Home, Package, Truck, FileText } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const { isLoggedIn, loading, logout, user } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    await logout()
    setShowDropdown(false)
    // Arahkan ke halaman login setelah logout
    window.location.href = '/login'
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
  const getNavItems = () => {
    // Semua pengguna (termasuk yang tidak login) bisa mengakses halaman utama
    const baseItems = [
      { href: "/", label: "Dashboard", key: "dashboard", icon: Home },
      { href: "/inbound", label: "Inbound", key: "inbound", icon: Truck },
      { href: "/outbound", label: "Outbound", key: "outbound", icon: Truck },
      { href: "/inventory", label: "Inventory", key: "inventory", icon: Package },
      { href: "/history", label: "History", key: "history", icon: FileText },
    ];

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <header className={`border-b sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-sm' : 'bg-background'}`}>
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="text-xl">🏠</span>
          <span>Sistem Gudang FG</span>
        </Link>
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

          {/* Tombol Login/Logout */}
          {!loading && (
            <>
              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="outline"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    {loading || !user ? <><User className="mr-2 h-4 w-4" /> Akun</> : <><User className="mr-2 h-4 w-4" /> {user.nama_panggilan}</>}
                  </Button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50 py-1">
                      {(user.role === 'admin' || user.role === 'manager' || user.role === 'user') && (
                        <Link
                          href="/admin/dashboard"
                          className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => setShowDropdown(false)}
                        >
                          <BarChart3 className="mr-2 h-4 w-4" /> Dashboard Admin
                        </Link>
                      )}
                      {(user.role === 'admin' || user.role === 'manager' || user.role === 'user') && (
                        <Link
                          href="/admin/rack-status"
                          className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => setShowDropdown(false)}
                        >
                          <Package className="mr-2 h-4 w-4" /> Status Rak
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button asChild>
                  <Link href="/login">Login Admin</Link>
                </Button>
              )}
            </>
          )}
          {loading && <Button variant="outline" disabled>Loading...</Button>}
        </nav>
      </div>
    </header>
  )
}