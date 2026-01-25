"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, PackageOpen, Warehouse, Eye } from "lucide-react"
import { useAuth } from "@/components/hooks/useAuth"


interface DashboardStats {
  totalProducts: number
  totalQty: number
  totalCustomers: number
  totalRacks: number
  filledRacks: number
  emptyRacks: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard')
        if (!response.ok) {
          throw new Error('Gagal mengambil data statistik')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
        setError('Gagal memuat statistik dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Tampilkan loading jika auth masih loading
  if (authLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    )
  }

  return (
    
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground">Statistik dan informasi sistem gudang</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">Jumlah jenis produk</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total QTY Produk</CardTitle>
              <PackageOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalQty || 0}</div>
              <p className="text-xs text-muted-foreground">Jumlah keseluruhan barang</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customer</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
              <p className="text-xs text-muted-foreground">Jumlah pelanggan terdaftar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rak Gudang</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRacks || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.filledRacks} terisi / {stats?.emptyRacks} kosong
              </p>
            </CardContent>
          </Card>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistik Rak</CardTitle>
              <CardDescription>Detail penggunaan rak gudang</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Rak Terisi:</span>
                  <span className="font-medium">{stats?.filledRacks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rak Kosong:</span>
                  <span className="font-medium">{stats?.emptyRacks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Rak:</span>
                  <span className="font-medium">{stats?.totalRacks || 0}</span>
                </div>
                {stats && stats.totalRacks && (
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${((stats.filledRacks / stats.totalRacks) * 100).toFixed(2)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>{((stats.filledRacks / stats.totalRacks) * 100).toFixed(2)}% terisi</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Sistem</CardTitle>
              <CardDescription>Informasi keseluruhan sistem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Jenis Produk:</span>
                  <span className="font-medium">{stats?.totalProducts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total QTY Barang:</span>
                  <span className="font-medium">{stats?.totalQty || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Customer:</span>
                  <span className="font-medium">{stats?.totalCustomers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rata-rata Barang per Produk:</span>
                  <span className="font-medium">
                    {stats?.totalProducts ? (stats.totalQty / stats.totalProducts).toFixed(2) : 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    
  )
}