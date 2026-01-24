"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/hooks/useAuth"
import { useState, useEffect, useRef } from "react"
import { User, Home, BarChart3, LogOut, Package, FileText, TrendingUp, Edit, ChevronDown, Database, Truck, Worm } from "lucide-react"

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

  const [showFGMenu, setShowFGMenu] = useState(false);
  const [showMaterialMenu, setShowMaterialMenu] = useState(false);
  const fgRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (fgRef.current && !fgRef.current.contains(target)) setShowFGMenu(false);
      if (materialRef.current && !materialRef.current.contains(target)) setShowMaterialMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className={`border-b bg-cyan-300/20 sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-cyan-400/90 backdrop-blur-sm shadow-sm' : 'bg-cyan-400'}`}>
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-white">
            <span className="text-xl">📋</span>
            <span>Admin Dashboard</span>
          </Link>
          {!loading && user && (
            <p className="text-sm text-cyan-100">
              Selamat {getGreeting()} {user.nama_panggilan}, Selamat Datang
            </p>
          )}
        </div>
        <nav className="flex items-center gap-2">

          {/* Dashboard */}
          <Button
            variant={pathname === "/admin/dashboard" ? "default" : "ghost"}
            asChild
            className={pathname === "/admin/dashboard" ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-white hover:text-cyan-100"}
          >
            <Link href="/admin/dashboard" className="text-white">
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>

          {/* Statistik - hanya untuk admin dan manager */}
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <Button
              variant={pathname === "/admin/statistics" ? "default" : "ghost"}
              asChild
              className={pathname === "/admin/statistics" ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-white hover:text-cyan-100"}
            >
              <Link href="/admin/statistics" className="text-white">
                <TrendingUp className="mr-2 h-4 w-4" />
                Statistik
              </Link>
            </Button>
          )}

          {/* Dropdown Admin Finish Goods */}
          <div className="relative" ref={fgRef}>
            <Button
              variant={pathname.startsWith("/admin/rack-status") || pathname.startsWith("/admin/edit-product") || pathname.startsWith("/admin/edit-inventory") ? "default" : "ghost"}
              className={pathname.startsWith("/admin/rack-status") || pathname.startsWith("/admin/edit-product") || pathname.startsWith("/admin/edit-inventory") ? "bg-blue-600 hover:bg-blue-700 text-white" : "hover:text-cyan-100 text-white"}
              onClick={() => { setShowFGMenu(!showFGMenu); setShowMaterialMenu(false); }}
            >
              <Package className="mr-2 h-4 w-4" />
              Admin FG
              <ChevronDown className={`ml-2 h-3 w-3 transition-transform ${showFGMenu ? 'rotate-180' : ''}`} />
            </Button>

            {showFGMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-white/95 backdrop-blur-0 border border-slate-200 rounded-2xl shadow-2xl z-50 py-3 animate-in fade-in slide-in-from-top-2">
                <p className="px-5 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Finish Goods</p>

                <Link href="/admin/rack-status" className="flex items-center px-5 py-3 hover:bg-blue-50 text-gray-700 transition" onClick={() => setShowFGMenu(false)}>
                  <div className="bg-blue-100 p-2 rounded-lg mr-4"><Package className="h-4 w-4 text-blue-600" /></div>
                  <div className="flex flex-col"><span className="text-sm font-bold">Status Rak</span><span className="text-[10px] text-gray-400">Monitor Rak Gudang</span></div>
                </Link>

                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <Link href="/admin/edit-product" className="flex items-center px-5 py-3 hover:bg-blue-50 text-gray-700 transition" onClick={() => setShowFGMenu(false)}>
                    <div className="bg-blue-100 p-2 rounded-lg mr-4"><Edit className="h-4 w-4 text-blue-600" /></div>
                    <div className="flex flex-col"><span className="text-sm font-bold">Edit Product</span><span className="text-[10px] text-gray-400">Kelola Produk FG</span></div>
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <Link href="/admin/edit-inventory" className="flex items-center px-5 py-3 hover:bg-blue-50 text-gray-700 transition" onClick={() => setShowFGMenu(false)}>
                    <div className="bg-blue-100 p-2 rounded-lg mr-4"><Edit className="h-4 w-4 text-blue-600" /></div>
                    <div className="flex flex-col"><span className="text-sm font-bold">Edit Inventory</span><span className="text-[10px] text-gray-400">Kelola Inventaris FG</span></div>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Dropdown Admin Material */}
          <div className="relative" ref={materialRef}>
            <Button
              variant={pathname.startsWith("/admin/admin-material") ? "default" : "ghost"}
              className={pathname.startsWith("/admin/admin-material") ? "bg-emerald-600 text-white hover:bg-emerald-700" : "hover:text-cyan-100 text-white"}
              onClick={() => { setShowMaterialMenu(!showMaterialMenu); setShowFGMenu(false); }}
            >
              <Database className="mr-2 h-4 w-4" />
              Admin Material
              <ChevronDown className={`ml-2 h-3 w-3 transition-transform ${showMaterialMenu ? 'rotate-180' : ''}`} />
            </Button>

            {showMaterialMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-white/95 backdrop-blur-0 border border-slate-200 rounded-2xl shadow-2xl z-50 py-3 animate-in fade-in slide-in-from-top-2">
                <p className="px-5 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Material</p>

                <Link href="/admin/admin-material/edit-material-bom" className="flex items-center px-5 py-3 hover:bg-emerald-50 text-gray-700 transition" onClick={() => setShowMaterialMenu(false)}>
                  <div className="bg-emerald-100 p-2 rounded-lg mr-4"><Edit className="h-4 w-4 text-emerald-600" /></div>
                  <div className="flex flex-col"><span className="text-sm font-bold">Edit BOM Master</span><span className="text-[10px] text-gray-400">Kelola Resep Produk</span></div>
                </Link>

                <Link href="/admin/admin-material/edit-material-inventory" className="flex items-center px-5 py-3 hover:bg-emerald-50 text-gray-700 transition" onClick={() => setShowMaterialMenu(false)}>
                  <div className="bg-emerald-100 p-2 rounded-lg mr-4"><Edit className="h-4 w-4 text-emerald-600" /></div>
                  <div className="flex flex-col"><span className="text-sm font-bold">Edit Inventory</span><span className="text-[10px] text-gray-400">Kelola Inventaris Material</span></div>
                </Link>

                <Link href="/admin/admin-material/material-shipping" className="flex items-center px-5 py-3 hover:bg-emerald-50 text-gray-700 transition" onClick={() => setShowMaterialMenu(false)}>
                  <div className="bg-emerald-100 p-2 rounded-lg mr-4"><Truck className="h-4 w-4 text-emerald-600" /></div>
                  <div className="flex flex-col"><span className="text-sm font-bold">Material Shipping</span><span className="text-[10px] text-gray-400">Pengiriman Material Mentah</span></div>
                </Link>
              </div>
            )}
          </div>

          {/* Dropdown Akun (Hanya muncul jika user ada) */}
          {!loading && user && (
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="outline"
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-white border-cyan-300 hover:bg-cyan-700"
              >
                <User className="mr-2 h-4 w-4" /> {user.nama_panggilan}
              </Button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-0 border border-slate-200 rounded-md shadow-lg z-50 py-1">
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