"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface InventoryItem {
  id: number
  part_no: string
  nama_part: string
  nama_customer: string
  alamat_rak: string
  zona: string
  jumlah: number
  tgl_masuk: string
  total_jumlah: number
}

interface InventoryTableProps {
  refreshTrigger: number
  searchTerm?: string
}

export function InventoryTable({ refreshTrigger, searchTerm }: InventoryTableProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInventory = async () => {
    try {
      let url = "/api/inventory"
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`
      }
      const response = await fetch(url)
      const data = await response.json()
      setInventory(data)
    } catch (error) {
      console.error("Error fetching inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [refreshTrigger, searchTerm])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Saat Ini
        </CardTitle>
        <CardDescription>Barang yang tersedia di gudang</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Inventory kosong</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Part No</th>
                  <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Nama Part</th>
                  <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Customer</th>
                  <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Alamat Rak</th>
                  <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Zona</th>
                  <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Jumlah</th>
                  <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Total Jumlah</th>
                  <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Tanggal Masuk</th>
                </tr>
              </thead>
              <tbody>
                {inventory && Array.isArray(inventory) ? (
                  inventory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 sm:py-3 sm:px-4 font-mono text-xs sm:text-sm">{item.part_no}</td>
                      <td className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">{item.nama_part}</td>
                      <td className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">{item.nama_customer || '-'}</td>
                      <td className="py-2 px-2 sm:py-3 sm:px-4 font-mono text-xs sm:text-sm">{item.alamat_rak}</td>
                      <td className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">{item.zona}</td>
                      <td className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium">{item.jumlah}</td>
                      <td className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium">{item.total_jumlah}</td>
                      <td className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">
                        {format(new Date(item.tgl_masuk), "dd MMM yyyy HH:mm", { locale: id })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-2 px-2 sm:py-3 sm:px-4 text-center text-xs sm:text-sm text-muted-foreground">
                      Tidak ada data inventory
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
