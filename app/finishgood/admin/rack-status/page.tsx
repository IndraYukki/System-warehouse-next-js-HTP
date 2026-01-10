"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { RoleProtected } from "@/components/role-protected"

interface RackStatus {
  id: number
  rack_code: string
  rack_name: string
  zone: string
  status: string
  product_info: string | null
  nama_part: string | null
}

export default function AdminRackStatusPage() {
  const [racks, setRacks] = useState<RackStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") // Filter untuk status
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [totalItems, setTotalItems] = useState(0)
  const [filteredRacks, setFilteredRacks] = useState<RackStatus[]>([])

  useEffect(() => {
    const fetchRackStatus = async () => {
      try {
        const response = await fetch('/api/admin/rack-status')
        if (!response.ok) {
          throw new Error('Gagal mengambil data status rak')
        }
        const data = await response.json()
        setRacks(data)
        setFilteredRacks(data)
        setTotalItems(data.length)
      } catch (error) {
        console.error("Error fetching rack status:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRackStatus()
  }, [])

  useEffect(() => {
    let filtered = racks;

    // Terapkan filter pencarian
    if (searchTerm) {
      filtered = filtered.filter(rack =>
        rack.rack_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rack.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rack.nama_part && rack.nama_part.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Terapkan filter status
    if (statusFilter !== "all") {
      filtered = filtered.filter(rack =>
        (statusFilter === "occupied" && rack.status === "occupied") ||
        (statusFilter === "available" && rack.status === "available")
      )
    }

    setFilteredRacks(filtered)
    setTotalItems(filtered.length)
    setCurrentPage(0) // Reset ke halaman pertama saat filter berubah
  }, [searchTerm, statusFilter, racks])

  // Pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = currentPage * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const currentRacks = filteredRacks.slice(startIndex, endIndex)

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

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <RoleProtected
      allowedRoles={['admin', 'manager', 'user']}
      fallback={
        <div className="container mx-auto py-10 px-4">
          <div className="text-center py-10 text-red-500">
            Anda tidak memiliki akses ke halaman ini.
          </div>
        </div>
      }
    >
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Status Rak</h1>
          <p className="text-muted-foreground">Informasi status penggunaan rak gudang</p>
        </div>

        <Card>
          <CardHeader className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl">Daftar Rak</CardTitle>
              <CardDescription>Informasi status setiap rak di gudang</CardDescription>
            </div>
            <div className="flex items-end justify-end">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan nama rak, zona, atau produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-end justify-end">
              <div className="w-full md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Semua Status</option>
                  <option value="occupied">Terisi</option>
                  <option value="available">Kosong</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tampilkan:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            {filteredRacks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "Tidak ada rak yang cocok dengan pencarian" : "Tidak ada data rak"}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto mb-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Nama Rak</th>
                        <th className="text-left py-3 px-4 font-medium">Zona</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Produk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRacks.map((rack) => (
                        <tr key={rack.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-mono">{rack.rack_name}</td>
                          <td className="py-3 px-4">{rack.zone || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              rack.status === 'occupied'
                                ? 'bg-green-100 text-green-800'
                                : rack.status === 'available'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {rack.status === 'occupied' ? 'TERISI' : rack.status === 'available' ? 'KOSONG' : rack.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {rack.nama_part ? (
                              <div>
                                <div className="font-medium">{rack.nama_part}</div>
                                <div className="text-xs text-muted-foreground">{rack.product_info}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan {startIndex + 1} - {endIndex} dari {totalItems} entri
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 0}
                      className={`p-2 rounded-md ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <span className="text-sm">
                      Halaman {currentPage + 1} dari {totalPages || 1}
                    </span>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages - 1 || totalPages === 0}
                      className={`p-2 rounded-md ${currentPage === totalPages - 1 || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleProtected>
  )
}