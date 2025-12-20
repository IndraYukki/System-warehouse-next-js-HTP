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
  alamat_rak: string
  zona: string
  tgl_masuk: string
}

interface InventoryTableProps {
  refreshTrigger: number
}

export function InventoryTable({ refreshTrigger }: InventoryTableProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInventory = async () => {
    try {
      const response = await fetch("/api/inventory")
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
  }, [refreshTrigger])

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
                  <th className="text-left py-3 px-4 font-medium">Part No</th>
                  <th className="text-left py-3 px-4 font-medium">Nama Part</th>
                  <th className="text-left py-3 px-4 font-medium">Alamat Rak</th>
                  <th className="text-left py-3 px-4 font-medium">Zona</th>
                  <th className="text-left py-3 px-4 font-medium">Tanggal Masuk</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono text-sm">{item.part_no}</td>
                    <td className="py-3 px-4 text-sm">{item.nama_part}</td>
                    <td className="py-3 px-4 font-mono text-sm">{item.alamat_rak}</td>
                    <td className="py-3 px-4 text-sm">{item.zona}</td>
                    <td className="py-3 px-4 text-sm">
                      {format(new Date(item.tgl_masuk), "dd MMM yyyy HH:mm", { locale: id })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
