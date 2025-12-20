"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Edit, Trash2, Plus } from "lucide-react"
import { ProductForm } from "@/components/product-form"

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

export function ProductTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/master/parts")
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const response = await fetch(`/api/master/parts/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchProducts() // Refresh data
        } else {
          alert("Gagal menghapus data")
        }
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("Terjadi kesalahan saat menghapus data")
      }
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingProduct(null)
    fetchProducts() // Refresh data
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <ProductForm 
          initialData={editingProduct || undefined} 
          onSuccess={handleFormSuccess} 
        />
        <Button variant="outline" onClick={() => setShowForm(false)}>
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
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Belum ada data produk</div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  )
}