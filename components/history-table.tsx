"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { History, Search } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface HistoryLog {
  id: number
  part_no: string
  nama_part: string
  alamat_rak: string
  nama_customer: string
  tipe: "IN" | "OUT"
  jumlah: number
  waktu_kejadian: string
  keterangan: string
}

interface HistoryTableProps {
  refreshTrigger: number
  searchTerm?: string
}

export function HistoryTable({ refreshTrigger }: HistoryTableProps) {
  const [history, setHistory] = useState<HistoryLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchHistory = async () => {
    try {
      let url = "/api/history"
      if (searchTerm) {
        url += `?part_no=${encodeURIComponent(searchTerm)}`
      }

      const response = await fetch(url)
      const data = await response.json()
      setHistory(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching history:", error)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [refreshTrigger, searchTerm])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory()
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Riwayat Transaksi
        </CardTitle>
        <CardDescription>History semua aktivitas masuk dan keluar barang</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan Part No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Belum ada riwayat transaksi</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Waktu</th>
                  <th className="text-left py-3 px-4 font-medium">Part No</th>
                  <th className="text-left py-3 px-4 font-medium">Nama Part</th>
                  <th className="text-left py-3 px-4 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 font-medium">Rak</th>
                  <th className="text-left py-3 px-4 font-medium">Tipe</th>
                  <th className="text-left py-3 px-4 font-medium">Jumlah</th>
                  <th className="text-left py-3 px-4 font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {history && Array.isArray(history) ? (
                  history.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">
                        {format(new Date(log.waktu_kejadian), "dd MMM yyyy HH:mm", { locale: id })}
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">{log.part_no}</td>
                      <td className="py-3 px-4 text-sm">{log.nama_part}</td>
                      <td className="py-3 px-4 text-sm">{log.nama_customer || '-'}</td>
                      <td className="py-3 px-4 font-mono text-sm">{log.alamat_rak}</td>
                      <td className="py-3 px-4">
                        <Badge variant={log.tipe === "IN" ? "default" : "secondary"}>
                          {log.tipe === "IN" ? "MASUK" : "KELUAR"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{log.jumlah}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{log.keterangan}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-3 px-4 text-center text-muted-foreground">
                      Tidak ada data history
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
