"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { History, Search, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
  total_awal: number
  total_akhir: number
}

interface ApiResponse {
  data: HistoryLog[];
  total: number;
  limit: number;
  offset: number;
}

interface HistoryTableProps {
  refreshTrigger: number
  searchTerm?: string
}

export function HistoryTable({ refreshTrigger, searchTerm: externalSearchTerm }: HistoryTableProps) {
  const [history, setHistory] = useState<HistoryLog[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [localSearchTerm, setLocalSearchTerm] = useState("")

  // Sinkronkan searchTerm eksternal dengan state lokal
  useEffect(() => {
    setLocalSearchTerm(externalSearchTerm || "")
    setCurrentPage(0) // Reset ke halaman pertama saat pencarian berubah
  }, [externalSearchTerm])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const offset = currentPage * itemsPerPage

      let url = `/api/history?limit=${itemsPerPage}&offset=${offset}`
      if (localSearchTerm) {
        url += `&search=${encodeURIComponent(localSearchTerm)}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Gagal mengambil data history')
      }
      const result: ApiResponse = await response.json()

      setHistory(result.data || [])
      setTotalItems(result.total || 0)
    } catch (error) {
      console.error("Error fetching history:", error)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [refreshTrigger, currentPage, itemsPerPage, localSearchTerm])

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value)
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(0) // Reset ke halaman pertama saat mengganti jumlah item per halaman
  }

  const handleExport = () => {
    const url = "/api/history/export";
    window.open(url, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Data History</DialogTitle>
                  <DialogDescription>
                    Pilih opsi ekspor data history transaksi ke file CSV
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Button
                    onClick={handleExport}
                    className="w-full"
                  >
                    Export Semua Data
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Riwayat Transaksi
            </CardTitle>
            <CardDescription>History semua aktivitas masuk dan keluar barang (1 minggu terakhir)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan Part No atau Nama Part..."
              value={localSearchTerm}
              onChange={(e) => {
                setLocalSearchTerm(e.target.value)
                setCurrentPage(0) // Reset ke halaman pertama saat pencarian berubah
              }}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tampilkan:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : Array.isArray(history) && history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Belum ada riwayat transaksi dalam 1 minggu terakhir</div>
        ) : (
          <>
            <div className="overflow-x-auto mb-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Waktu</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Customer</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Part No</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Nama Part</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Rak</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Tipe</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Jumlah</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Total Awal</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Total Akhir</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(history) && history.length > 0 ? (
                    history.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">
                          {format(new Date(log.waktu_kejadian), "dd MMM yyyy HH:mm", { locale: id })}
                        </td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">{log.nama_customer || '-'}</td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4 font-mono text-xs sm:text-sm">{log.part_no}</td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">{log.nama_part}</td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4 font-mono text-xs sm:text-sm">{log.alamat_rak}</td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4">
                          <Badge variant={log.tipe === "IN" ? "default" : "secondary"}>
                            {log.tipe === "IN" ? "MASUK" : "KELUAR"}
                          </Badge>
                        </td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">{log.jumlah}</td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">{log.total_awal}</td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">{log.total_akhir}</td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm text-muted-foreground">{log.keterangan}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-2 px-2 sm:py-3 sm:px-4 text-center text-xs sm:text-sm text-muted-foreground">
                        Tidak ada data history
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Menampilkan {(currentPage * itemsPerPage) + 1} - {Math.min((currentPage + 1) * itemsPerPage, totalItems)} dari {totalItems} entri
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0}
                  className={`p-2 rounded-md ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="text-sm">
                  Halaman {currentPage + 1} dari {totalPages || 1}
                </span>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages - 1 || totalPages === 0}
                  className={`p-2 rounded-md ${currentPage === totalPages - 1 || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
