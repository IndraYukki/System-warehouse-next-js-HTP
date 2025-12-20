"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PackageMinus } from "lucide-react"

interface OutboundFormProps {
  onSuccess: () => void
}

export function OutboundForm({ onSuccess }: OutboundFormProps) {
  const [partNo, setPartNo] = useState("")
  const [jumlah, setJumlah] = useState("1")
  const [keterangan, setKeterangan] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validasi jumlah
    const jumlahInt = parseInt(jumlah)
    if (isNaN(jumlahInt) || jumlahInt <= 0) {
      setMessage({ type: "error", text: "Jumlah harus berupa angka positif!" })
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/outbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part_no: partNo,
          jumlah: jumlahInt,
          keterangan,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: `${data.message} Lokasi: ${data.data.alamat_rak || 'Tidak Tersedia'}` })
        setPartNo("")
        setJumlah("1")
        setKeterangan("")
        onSuccess()
      } else {
        setMessage({ type: "error", text: data.error || 'Terjadi kesalahan' })
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
          <PackageMinus className="h-5 w-5" />
          Barang Keluar (Outbound)
        </CardTitle>
        <CardDescription>Sistem otomatis kurangi barang dari inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="part-no-out">Part Number *</Label>
            <Input
              id="part-no-out"
              value={partNo}
              onChange={(e) => setPartNo(e.target.value.toUpperCase())}
              placeholder="Contoh: FG001"
              required
            />
            <p className="text-xs text-muted-foreground">Lokasi rak akan dicari otomatis oleh sistem</p>
          </div>


          <div className="space-y-2">
            <Label htmlFor="jumlah-out">Jumlah *</Label>
            <Input
              id="jumlah-out"
              type="number"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder="Contoh: 5"
              min="1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan-out">Keterangan</Label>
            <Textarea
              id="keterangan-out"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Catatan tambahan (opsional)"
              rows={3}
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
            {loading ? "Memproses..." : "Keluarkan Barang"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
