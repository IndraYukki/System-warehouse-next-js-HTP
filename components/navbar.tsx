"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/hooks/useAuth"
import { useState, useEffect, useRef } from "react"
import { 
  User, BarChart3, LogOut, Home, Package, 
  Truck, FileText, Database, ChevronDown, Activity, Layers, Archive, Boxes, Worm, TrendingUpDown, PackageOpen, PackageMinus, ReceiptText, FileClock
} from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const { isLoggedIn, loading, logout, user } = useAuth()
  
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMaterialMenu, setShowMaterialMenu] = useState(false)
  const [showFGMenu, setShowFGMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const materialRef = useRef<HTMLDivElement>(null)
  const fgRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    await logout()
    setShowDropdown(false)
    window.location.href = '/login'
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) setShowDropdown(false);
      if (materialRef.current && !materialRef.current.contains(target)) setShowMaterialMenu(false);
      if (fgRef.current && !fgRef.current.contains(target)) setShowFGMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className={`border-b sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-cyan-400/90 backdrop-blur-sm shadow-sm' : 'bg-cyan-400'}`}>
      <div className="container flex h-16 items-center justify-between px-4">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 font-bold group">
          <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-blue-600 font-black uppercase tracking-tighter">Inventory System</span>
            <span className="text-lg tracking-tight uppercase">HTP-Warehouse</span>
          </div>
        </Link>

        {/* NAVIGASI */}
        <nav className="flex items-center gap-1">

          <Button variant={pathname === "/" ? "secondary" : "ghost"} asChild className="text-white hover:text-cyan-100">
            <Link href="/"><Home className="mr-2 h-4 w-4" /> Home</Link>
          </Button>

          {/* DROPDOWN FINISH GOODS */}
          <div className="relative" ref={fgRef}>
            <Button
              variant={pathname === "/inventory" || pathname === "/inbound" || pathname === "/outbound" || pathname === "/history" ? "default" : "ghost"}
              className={pathname === "/inventory" || pathname === "/inbound" || pathname === "/outbound" || pathname === "/history" ? "bg-blue-600 text-white hover:bg-blue-700" : "hover:text-cyan-100 text-white"}
              onClick={() => { setShowFGMenu(!showFGMenu); setShowMaterialMenu(false); }}
            >
              <Package className="mr-2 h-4 w-4" />
              Finish Goods
              <ChevronDown className={`ml-2 h-3 w-3 transition-transform ${showFGMenu ? 'rotate-180' : ''}`} />
            </Button>

            {showFGMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-white/95 backdrop-blur-0 border border-slate-200 rounded-2xl shadow-2xl z-50 py-3 animate-in fade-in slide-in-from-top-2">
                <p className="px-5 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Produk Jadi</p>
                <Link href="/inventory" className="flex items-center px-5 py-3 hover:bg-blue-50 text-gray-700 transition" onClick={() => setShowFGMenu(false)}>
                  <div className="bg-blue-100 p-2 rounded-lg mr-4"><Package className="h-4 w-4 text-blue-600" /></div>
                  <div className="flex flex-col"><span className="text-sm font-bold">FG Inventory</span><span className="text-[10px] text-gray-400">Cek Stok Produk Jadi</span></div>
                </Link>
                <Link href="/inbound" className="flex items-center px-5 py-3 hover:bg-blue-50 text-gray-700 transition" onClick={() => setShowFGMenu(false)}>
                  <div className="bg-blue-100 p-2 rounded-lg mr-4"><Truck className="h-4 w-4 text-blue-600" /></div>
                  <div className="flex flex-col"><span className="text-sm font-bold">Inbound</span><span className="text-[10px] text-gray-400">Penerimaan Produksi</span></div>
                </Link>
                <Link href="/outbound" className="flex items-center px-5 py-3 hover:bg-blue-50 text-gray-700 transition" onClick={() => setShowFGMenu(false)}>
                  <div className="bg-blue-100 p-2 rounded-lg mr-4"><Truck className="h-4 w-4 text-blue-600" /></div>
                  <div className="flex flex-col"><span className="text-sm font-bold">Outbound</span><span className="text-[10px] text-gray-400">Pengiriman Customer</span></div>
                </Link>
                <div className="border-t mx-4 my-2"></div>
                <Link href="/history" className="flex items-center px-5 py-3 hover:bg-gray-50 text-gray-700 transition" onClick={() => setShowFGMenu(false)}>
                  <div className="bg-gray-100 p-2 rounded-lg mr-4"><FileClock className="h-4 w-4 text-gray-500" /></div>
                  <span className="text-sm font-bold">FG History Logs</span>
                </Link>
              </div>
            )}
          </div>

          {/* DROPDOWN RAW MATERIAL */}
          <div className="relative" ref={materialRef}>
            <Button
              variant={pathname?.startsWith("/material-area") ? "default" : "ghost"}
              className={pathname?.startsWith("/material-area") ? "bg-emerald-600 text-white hover:bg-emerald-700" : "hover:text-cyan-100 text-white"}
              onClick={() => { setShowMaterialMenu(!showMaterialMenu); setShowFGMenu(false); }}
            >
              <Database className="mr-2 h-4 w-4" />
              Raw Material
              <ChevronDown className={`ml-2 h-3 w-3 transition-transform ${showMaterialMenu ? 'rotate-180' : ''}`} />
            </Button>

            {showMaterialMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-white/95 backdrop-blur-0 border border-slate-200 rounded-2xl shadow-2xl z-50 py-3 animate-in fade-in slide-in-from-top-2">
                <p className="px-5 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Biji Plastik</p>
                <Link href="/material-area/inventory" className="flex items-center px-5 py-3 hover:bg-emerald-50 text-gray-700 transition" onClick={() => setShowMaterialMenu(false)}>
                  <div className="bg-emerald-100 p-2 rounded-lg mr-4"><PackageOpen className="h-4 w-4 text-emerald-600" /></div>
                  <div className="flex flex-col"><span className="text-sm font-bold">Material Stok</span><span className="text-[10px] text-gray-400">Saldo & Rak</span></div>
                </Link>
                <Link href="/material-area/master-bom" className="flex items-center px-5 py-3 hover:bg-emerald-50 text-gray-700 transition" onClick={() => setShowMaterialMenu(false)}>
                  <div className="bg-emerald-100 p-2 rounded-lg mr-4"><ReceiptText className="h-4 w-4 text-emerald-600" /></div>
                  <div className="flex flex-col"><span className="text-sm font-bold">BOM produk</span><span className="text-[10px] text-gray-400">Racikan Gramasi</span></div>
                </Link>
                <Link href="/material-area/inbound" className="flex items-center px-5 py-3 hover:bg-emerald-50 text-gray-700 transition" onClick={() => setShowMaterialMenu(false)}>
                  <div className="bg-emerald-100 p-2 rounded-lg mr-4"><Truck className="h-4 w-4 text-emerald-600" /></div>
                  <div className="flex flex-col"><span className="text-sm font-bold">Inbound</span><span className="text-[10px] text-gray-400">Input Barang Datang</span></div>
                </Link>
                <Link href="/material-area/production" className="flex items-center px-5 py-3 hover:bg-emerald-50 text-gray-700 transition" onClick={() => setShowMaterialMenu(false)}>
                  <div className="bg-emerald-100 p-2 rounded-lg mr-4"><PackageMinus className="h-4 w-4 text-emerald-600" /></div>
                  <div className="flex flex-col"><span className="text-sm font-bold">Produksi (Out)</span><span className="text-[10px] text-gray-400">Potong Stok via BOM</span></div>
                </Link>
                <Link
                  href="/material-area/simulation" className="flex items-center px-5 py-3 hover:bg-emerald-50 text-gray-700 transition" onClick={() => setShowMaterialMenu(false)}>
                  <div className="bg-emerald-100 p-2 rounded-lg mr-4">
                    <Worm className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Simulasi Material</span>
                    <span className="text-[10px] text-gray-400">
                      Hitung Qty ↔ Kg (Tanpa Potong Stok)
                    </span>
                  </div>
                </Link>
                <div className="border-t mx-4 my-2"></div>
                <Link href="/material-area/history" className="flex items-center px-5 py-3 hover:bg-gray-50 text-gray-700 transition" onClick={() => setShowMaterialMenu(false)}>
                  <div className="bg-gray-100 p-2 rounded-lg mr-4"><FileClock className="h-4 w-4 text-gray-500" /></div>
                  <span className="text-sm font-bold">Material History</span>
                </Link>
              </div>
            )}
          </div>

          {/* AREA AKUN & LOGIN (DIKEMBALIKAN) */}
          <div className="ml-2 flex items-center">
            {loading ? (
              <Button variant="outline" disabled className="animate-pulse text-white">Loading...</Button>
            ) : isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <Button variant="outline" onClick={() => setShowDropdown(!showDropdown)} className="border-cyan-300 text-white hover:bg-cyan-700">
                  <User className="mr-2 h-4 w-4 text-white" />
                  {user?.nama_panggilan || "Akun"}
                </Button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-0 border border-cyan-200 rounded-xl shadow-xl z-50 py-2 overflow-hidden">
                    {(user.role === 'admin' || user.role === 'manager' || user.role === 'user') && (
                      <>
                        <Link href="/admin/dashboard" className="flex items-center px-4 py-2.5 hover:bg-gray-50 text-sm transition" onClick={() => setShowDropdown(false)}>
                          <BarChart3 className="mr-3 h-4 w-4 text-blue-600" /> Dashboard Admin
                        </Link>
                        
                      </>
                    )}
                    <div className="border-t my-1"></div>
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 font-bold transition">
                      <LogOut className="mr-3 h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-md text-white">
                <Link href="/login" className="text-white">Login Admin</Link>
              </Button>
            )}
          </div>

        </nav>
      </div>
    </header>
  )
}