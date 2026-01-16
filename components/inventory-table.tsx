"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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

interface ApiResponse {
  data: InventoryItem[];
  total: number;
  limit: number;
  offset: number;
}

interface InventoryTableProps {
  refreshTrigger: number
  searchTerm?: string
}

export function InventoryTable({ refreshTrigger, searchTerm: externalSearchTerm }: InventoryTableProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
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

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const offset = currentPage * itemsPerPage

      let url = `/api/inventory?limit=${itemsPerPage}&offset=${offset}`
      if (localSearchTerm) {
        url += `&search=${encodeURIComponent(localSearchTerm)}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Gagal mengambil data inventory')
      }
      const result: ApiResponse = await response.json()

      setInventory(result.data || [])
      setTotalItems(result.total || 0)
    } catch (error) {
      console.error("Error fetching inventory:", error)
      setInventory([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
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

  const handleExport = (option: "all" | "per_customer") => {
    let url = "/api/inventory/export";
    if (option === "all") {
      // Export semua data tanpa filter customer
      window.open(url, "_blank");
    } else if (option === "per_customer") {
      // Export dengan pembagian per customer
      url += "?customer=all";
      window.open(url, "_blank");
    }
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
                  <DialogTitle>Export Data Inventory</DialogTitle>
                  <DialogDescription>
                    Pilih opsi ekspor data inventory ke file CSV
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Button
                    onClick={() => handleExport("all")}
                    className="w-full"
                  >
                    Export Semua Data
                  </Button>
                  <Button
                    onClick={() => handleExport("per_customer")}
                    variant="outline"
                    className="w-full"
                  >
                    Export Per Customer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Saat Ini
            </CardTitle>
            <CardDescription>Barang yang tersedia di gudang</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tampilkan:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-0">
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
        ) : Array.isArray(inventory) && inventory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Inventory kosong</div>
        ) : (
          <>
            <div className="overflow-x-auto mb-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Customer</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Part No</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Nama Part</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Alamat Rak</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Zona</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Jumlah</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Total Stok</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Tanggal Masuk</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(inventory) && inventory.length > 0 ? (
                    inventory.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">{item.nama_customer || '-'}</td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4 font-mono text-xs sm:text-sm">{item.part_no}</td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">{item.nama_part}</td>
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
