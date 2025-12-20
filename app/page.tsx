"use client"

import { useState } from "react"
import { InboundForm } from "@/components/inbound-form"
import { OutboundForm } from "@/components/outbound-form"
import { HistoryTable } from "@/components/history-table"
import { InventoryTable } from "@/components/inventory-table"
import { Warehouse } from "lucide-react"

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleTransactionSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Warehouse className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">FG Warehouse System</h1>
              <p className="text-sm text-muted-foreground">Sistem Manajemen Gudang dengan Otomasi Penuh</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <InboundForm onSuccess={handleTransactionSuccess} />
          <OutboundForm onSuccess={handleTransactionSuccess} />
        </div>

        <div className="space-y-6">
          <InventoryTable refreshTrigger={refreshTrigger} />
          <HistoryTable refreshTrigger={refreshTrigger} />
        </div>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>✅ Otomatis tambah barang saat stock masuk • ✅ Otomatis kurangi barang saat stock keluar</p>
          <p className="mt-1">⏰ Timestamp otomatis • 🔒 Validasi sistem untuk cegah error</p>
        </div>
      </footer>
    </div>
  )
}
