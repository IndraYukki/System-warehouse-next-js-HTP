"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Edit, Trash2, Plus } from "lucide-react"
import { MasterPartsForm } from "@/components/master-parts-form"

interface MasterPart {
  id: number
  part_no: string
  nama_part: string
  deskripsi: string
  satuan: string
  created_at: string
  updated_at: string
}

export function MasterPartsTable() {
  const [parts, setParts] = useState<MasterPart[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPart, setEditingPart] = useState<MasterPart | null>(null)

  const fetchParts = async () => {
    try {
      const response = await fetch("/api/master/parts")
      const data = await response.json()
      setParts(data)
    } catch (error) {
      console.error("Error fetching parts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParts()
  }, [])

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const response = await fetch(`/api/master/parts/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchParts() // Refresh data
        } else {
          alert("Gagal menghapus data")
        }
      } catch (error) {
        console.error("Error deleting part:", error)
        alert("Terjadi kesalahan saat menghapus data")
      }
    }
  }

  const handleEdit = (part: MasterPart) => {
    setEditingPart(part)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingPart(null)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingPart(null)
    fetchParts() // Refresh data
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <MasterPartsForm 
          initialData={editingPart || undefined} 
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
            Data Master Parts
          </CardTitle>
          <CardDescription>Daftar semua part yang terdaftar dalam sistem</CardDescription>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Part
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : parts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Belum ada data part</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Part No</th>
                  <th className="text-left py-3 px-4 font-medium">Nama Part</th>
                  <th className="text-left py-3 px-4 font-medium">Satuan</th>
                  <th className="text-left py-3 px-4 font-medium">Deskripsi</th>
                  <th className="text-left py-3 px-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {parts && Array.isArray(parts) ? (
                  parts.map((part) => (
                    <tr key={part.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-sm">{part.part_no}</td>
                      <td className="py-3 px-4 text-sm">{part.nama_part}</td>
                      <td className="py-3 px-4 text-sm">{part.satuan}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{part.deskripsi}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(part)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(part.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-3 px-4 text-center text-muted-foreground">
                      Tidak ada data part
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