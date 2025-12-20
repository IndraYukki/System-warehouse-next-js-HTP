"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Warehouse, PackagePlus } from "lucide-react"

interface MasterRacksFormProps {
  onSuccess: () => void
  initialData?: {
    id?: number
    alamat_rak: string
    zona: string
    kapasitas: number
    status: string
  } | null
}

export function MasterRacksForm({ onSuccess, initialData }: MasterRacksFormProps) {
  const [alamatRak, setAlamatRak] = useState(initialData?.alamat_rak || "")
  const [zona, setZona] = useState(initialData?.zona || "")
  const [kapasitas, setKapasitas] = useState(initialData?.kapasitas?.toString() || "0")
  const [status, setStatus] = useState(initialData?.status || "aktif")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isEdit, setIsEdit] = useState(!!initialData)

  useEffect(() => {
    if (initialData) {
      setAlamatRak(initialData.alamat_rak)
      setZona(initialData.zona)
      setKapasitas(initialData.kapasitas?.toString() || "0")
      setStatus(initialData.status)
      setIsEdit(true)
    } else {
      setAlamatRak("")
      setZona("")
      setKapasitas("0")
      setStatus("aktif")
      setIsEdit(false)
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const method = isEdit ? "PUT" : "POST"
      const endpoint = isEdit ? `/api/master/racks/${initialData?.id}` : "/api/master/racks"
      
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alamat_rak: alamatRak,
          zona,
          kapasitas: parseInt(kapasitas),
          status,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: data.message })
        setAlamatRak("")
        setZona("")
        setKapasitas("0")
        setStatus("aktif")
        onSuccess()
      } else {
        setMessage({ type: "error", text: data.error })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan koneksi" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackagePlus className="h-5 w-5" />
          {isEdit ? "Edit Rak" : "Tambah Rak Baru"}
        </CardTitle>
        <CardDescription>
          {isEdit 
            ? "Edit informasi rak yang sudah terdaftar" 
            : "Tambah rak baru ke dalam sistem"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alamat-rak">Alamat Rak *</Label>
            <Input
              id="alamat-rak"
              value={alamatRak}
              onChange={(e) => setAlamatRak(e.target.value.toUpperCase())}
              placeholder="Contoh: A01, B02"
              required
              disabled={isEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zona">Zona *</Label>
            <Input
              id="zona"
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              placeholder="Contoh: A, B, C"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kapasitas">Kapasitas</Label>
            <Input
              id="kapasitas"
              type="number"
              value={kapasitas}
              onChange={(e) => setKapasitas(e.target.value)}
              placeholder="Contoh: 100"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {message && (
            <div
              className={`rounded-md p-3 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Memproses..." : isEdit ? "Update Rak" : "Tambah Rak"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}