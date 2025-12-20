"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Warehouse, Edit, Trash2, Plus } from "lucide-react"
import { MasterRacksForm } from "@/components/master-racks-form"

interface MasterRack {
  id: number
  alamat_rak: string
  zona: string
  kapasitas: number
  status: string
  created_at: string
}

export function MasterRacksTable() {
  const [racks, setRacks] = useState<MasterRack[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRack, setEditingRack] = useState<MasterRack | null>(null)

  const fetchRacks = async () => {
    try {
      const response = await fetch("/api/master/racks")
      const data = await response.json()
      setRacks(data)
    } catch (error) {
      console.error("Error fetching racks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRacks()
  }, [])

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const response = await fetch(`/api/master/racks/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchRacks() // Refresh data
        } else {
          alert("Gagal menghapus data")
        }
      } catch (error) {
        console.error("Error deleting rack:", error)
        alert("Terjadi kesalahan saat menghapus data")
      }
    }
  }

  const handleEdit = (rack: MasterRack) => {
    setEditingRack(rack)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingRack(null)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingRack(null)
    fetchRacks() // Refresh data
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <MasterRacksForm 
          initialData={editingRack || undefined} 
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
            <Warehouse className="h-5 w-5" />
            Data Master Racks
          </CardTitle>
          <CardDescription>Daftar semua rak yang tersedia dalam sistem</CardDescription>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Rak
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : racks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Belum ada data rak</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Alamat Rak</th>
                  <th className="text-left py-3 px-4 font-medium">Zona</th>
                  <th className="text-left py-3 px-4 font-medium">Kapasitas</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {racks && Array.isArray(racks) ? (
                  racks.map((rack) => (
                    <tr key={rack.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-sm">{rack.alamat_rak}</td>
                      <td className="py-3 px-4 text-sm">{rack.zona}</td>
                      <td className="py-3 px-4 text-sm">{rack.kapasitas}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          rack.status === 'aktif'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rack.status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(rack)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(rack.id)}
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
                      Tidak ada data rak
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