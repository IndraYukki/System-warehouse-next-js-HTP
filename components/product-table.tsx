"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Package, Edit, Trash2, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { ProductForm } from "@/components/product-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  id: number
  part_no: string
  nama_part: string
  deskripsi: string
  satuan: string
  customer_id: number | null
  nama_customer: string | null
  created_at: string
  updated_at: string
}

interface ApiResponse {
  data: Product[];
  total: number;
  limit: number;
  offset: number;
}

export function ProductTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const offset = currentPage * itemsPerPage

      let url = `/api/master/parts?limit=${itemsPerPage}&offset=${offset}`
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Gagal mengambil data produk')
      }
      const result: ApiResponse = await response.json()

      setProducts(result.data || [])
      setTotalItems(result.total || 0)
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [currentPage, itemsPerPage, searchTerm])

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

  const handleDelete = async (id: number) => {
    const productToDelete = products.find(p => p.id === id);
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const response = await fetch(`/api/master/parts/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setMessage({ type: "success", text: `Produk ${productToDelete?.nama_part || 'tidak dikenal'} berhasil dihapus dari finishgood kita` })
          fetchProducts() // Refresh data
        } else {
          const data = await response.json()
          setMessage({ type: "error", text: data.error || "Gagal menghapus data" })
        }
      } catch (error) {
        console.error("Error deleting product:", error)
        setMessage({ type: "error", text: "Terjadi kesalahan saat menghapus data" })
      }
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setMessage(null) // Clear any previous messages
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingProduct(null)
    setMessage(null) // Clear any previous messages
    setShowForm(true)
  }

  const handleFormSuccess = (message?: { type: "success" | "error"; text: string }) => {
    if (message) {
      setMessage(message);
    }
    setShowForm(false)
    setEditingProduct(null)
    fetchProducts() // Refresh data
  }

  const handleBackToList = () => {
    setShowForm(false)
    setMessage(null) // Membersihkan pesan saat kembali ke daftar tanpa sukses dari form
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <ProductForm
          initialData={editingProduct || undefined}
          onSuccess={handleFormSuccess}
        />
        <Button variant="outline" onClick={handleBackToList}>
          Kembali ke Daftar
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Data Produk
          </CardTitle>
          <CardDescription>Daftar semua produk yang terdaftar dalam sistem</CardDescription>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan Part No atau Nama Part..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
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

        {message && (
          <div
            className={`rounded-md p-4 mb-4 text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center">
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Belum ada data produk</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Part No</th>
                    <th className="text-left py-3 px-4 font-medium">Nama Part</th>
                    <th className="text-left py-3 px-4 font-medium">Satuan</th>
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium">Deskripsi</th>
                    <th className="text-left py-3 px-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-sm">{product.part_no}</td>
                      <td className="py-3 px-4 text-sm">{product.nama_part}</td>
                      <td className="py-3 px-4 text-sm">{product.satuan}</td>
                      <td className="py-3 px-4 text-sm">{product.nama_customer || '-'}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{product.deskripsi}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
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