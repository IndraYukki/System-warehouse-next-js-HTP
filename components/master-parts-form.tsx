"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, PackagePlus } from "lucide-react"

interface MasterPartsFormProps {
  onSuccess: () => void
  initialData?: {
    id?: number
    part_no: string
    nama_part: string
    deskripsi: string
    satuan: string
  } | null
}

export function MasterPartsForm({ onSuccess, initialData }: MasterPartsFormProps) {
  const [partNo, setPartNo] = useState(initialData?.part_no || "")
  const [namaPart, setNamaPart] = useState(initialData?.nama_part || "")
  const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi || "")
  const [satuan, setSatuan] = useState(initialData?.satuan || "")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isEdit, setIsEdit] = useState(!!initialData)

  useEffect(() => {
    if (initialData) {
      setPartNo(initialData.part_no)
      setNamaPart(initialData.nama_part)
      setDeskripsi(initialData.deskripsi)
      setSatuan(initialData.satuan)
      setIsEdit(true)
    } else {
      setPartNo("")
      setNamaPart("")
      setDeskripsi("")
      setSatuan("")
      setIsEdit(false)
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const method = isEdit ? "PUT" : "POST"
      const endpoint = isEdit ? `/api/master/parts/${initialData?.id}` : "/api/master/parts"
      
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part_no: partNo,
          nama_part: namaPart,
          deskripsi,
          satuan,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: data.message })
        setPartNo("")
        setNamaPart("")
        setDeskripsi("")
        setSatuan("")
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
          {isEdit ? "Edit Data Part" : "Tambah Data Part"}
        </CardTitle>
        <CardDescription>
          {isEdit 
            ? "Edit informasi part yang sudah terdaftar" 
            : "Tambah data part baru ke dalam sistem"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="part-no">Part Number *</Label>
            <Input
              id="part-no"
              value={partNo}
              onChange={(e) => setPartNo(e.target.value.toUpperCase())}
              placeholder="Contoh: FG001"
              required
              disabled={isEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama-part">Nama Part *</Label>
            <Input
              id="nama-part"
              value={namaPart}
              onChange={(e) => setNamaPart(e.target.value)}
              placeholder="Contoh: Bearing SKF 6204"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Deskripsi tambahan tentang part ini"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="satuan">Satuan *</Label>
            <Input
              id="satuan"
              value={satuan}
              onChange={(e) => setSatuan(e.target.value)}
              placeholder="Contoh: Pcs, Unit, Set"
              required
            />
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
            {loading ? "Memproses..." : isEdit ? "Update Part" : "Tambah Part"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}