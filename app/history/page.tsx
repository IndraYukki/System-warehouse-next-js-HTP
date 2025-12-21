"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { HistoryTable } from "@/components/history-table"

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="container mx-auto py-6 sm:py-10 px-4">
      <Card>
        <CardHeader className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl">Riwayat Transaksi</CardTitle>
            <CardDescription>Histori semua aktivitas masuk dan keluar barang</CardDescription>
          </div>
          <div className="flex items-end justify-end">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan Part No atau Nama Part..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <HistoryTable
            refreshTrigger={refreshTrigger}
            searchTerm={searchTerm}
          />
        </CardContent>
      </Card>
    </div>
  )
}