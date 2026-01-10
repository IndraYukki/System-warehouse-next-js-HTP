"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { InventoryTable } from "@/components/inventory-table"

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="container mx-auto py-6 sm:py-10 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
      <Card>
        <CardHeader className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl">Inventory Barang</CardTitle>
            <CardDescription>Daftar semua barang yang tersedia di gudang</CardDescription>
          </div>
          <div className="flex items-end justify-end">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan Part No, Nama Part, atau Alamat Rak..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <InventoryTable
            refreshTrigger={refreshTrigger}
            searchTerm={searchTerm}
          />
        </CardContent>
      </Card>
    </div>
  )
}