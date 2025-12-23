"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ChevronLeft, ChevronRight, Download, Edit, LogOut } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

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

export default function EditInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [localSearchTerm, setLocalSearchTerm] = useState("")
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [newQty, setNewQty] = useState<number>(0)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  // Cek status login saat komponen dimuat
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();

        if (!data.authenticated) {
          router.push('/login');
        }
      } catch (error) {
        // Jika terjadi error, asumsikan tidak login
        router.push('/login');
      }
    };

    checkLoginStatus();
  }, [router]);

  const fetchInventory = async () => {
    // Cek login sebelum fetch data
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();

      if (!data.authenticated) {
        router.push('/login');
        return;
      }
    } catch (error) {
      // Jika terjadi error saat cek login, redirect ke login
      router.push('/login');
      return;
    }

    try {
      setLoading(true)
      const offset = currentPage * itemsPerPage

      let url = `/api/inventory?limit=${itemsPerPage}&offset=${offset}`
      if (localSearchTerm) {
        url += `&search=${encodeURIComponent(localSearchTerm)}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        // Jika responsenya 401 atau 403, redirect ke login
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          return;
        }
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
  }, [currentPage, itemsPerPage, localSearchTerm])

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

  const handleEditQty = (item: InventoryItem) => {
    setEditingItem(item)
    setNewQty(item.jumlah)
  }

  const handleSaveQty = async () => {
    if (!editingItem) return

    // Cek login sebelum menyimpan
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();

      if (!data.authenticated) {
        router.push('/login');
        return;
      }
    } catch (error) {
      // Jika terjadi error saat cek login, redirect ke login
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/inventory/${editingItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jumlah: newQty,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: data.message })
        setEditingItem(null)
        // Refresh data
        fetchInventory()
      } else {
        // Jika responsenya 401 atau 403, redirect ke login
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          return;
        }
        setMessage({ type: "error", text: data.error || 'Gagal mengupdate QTY' })
      }
    } catch (error) {
      setMessage({ type: "error", text: 'Terjadi kesalahan saat mengupdate QTY' })
    }
  }

  const handleExport = async (option: "all" | "per_customer") => {
    // Cek login sebelum ekspor
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();

      if (!data.authenticated) {
        router.push('/login');
        return;
      }
    } catch (error) {
      // Jika terjadi error saat cek login, redirect ke login
      router.push('/login');
      return;
    }

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

  const handleLogout = async () => {
    // Hapus cookie dari server-side
    document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // Redirect ke halaman login
    router.push("/login");
    router.refresh(); // Refresh untuk memastikan perubahan diterapkan
  }

  // Tampilkan loading jika sedang mengecek status login
  if (loading && inventory.length === 0) {
    return (
      <div className="container mx-auto py-6 sm:py-10 px-4">
        <div className="text-center py-8 text-muted-foreground">Memeriksa status login...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 sm:py-10 px-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
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
                Edit Inventory
              </CardTitle>
              <CardDescription>Edit jumlah barang di inventory</CardDescription>
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
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Cari part no, nama part, alamat rak, atau customer..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {message && (
            <div
              className={`rounded-md p-3 mb-4 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

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
                      <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">Aksi</th>
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
                          <td className="py-2 px-2 sm:py-3 sm:px-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditQty(item)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-2 px-2 sm:py-3 sm:px-4 text-center text-xs sm:text-sm text-muted-foreground">
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

      {/* Dialog untuk edit QTY */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Jumlah Barang</DialogTitle>
            <DialogDescription>
              Perbarui jumlah barang untuk part {editingItem?.part_no} di rak {editingItem?.alamat_rak}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right">Part No:</span>
              <span className="col-span-3 font-medium">{editingItem?.part_no}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right">Nama Part:</span>
              <span className="col-span-3">{editingItem?.nama_part}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right">Alamat Rak:</span>
              <span className="col-span-3 font-mono">{editingItem?.alamat_rak}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-qty" className="text-right">Jumlah Baru:</label>
              <Input
                id="new-qty"
                type="number"
                value={newQty}
                onChange={(e) => setNewQty(parseInt(e.target.value) || 0)}
                className="col-span-2"
                min="0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right">Jumlah Lama:</span>
              <span className="col-span-3">{editingItem?.jumlah}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingItem(null)}>Batal</Button>
            <Button onClick={handleSaveQty}>Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}