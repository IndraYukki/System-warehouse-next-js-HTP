"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PackageMinus, Copy } from "lucide-react"

interface OutboundFormProps {
  onSuccess: () => void
}

interface PartInfo {
  id: number;
  part_no: string;
  nama_part: string;
  deskripsi: string;
  satuan: string;
  customer_id: number | null;
  nama_customer: string | null;
}

export function OutboundForm({ onSuccess }: OutboundFormProps) {
  const [partNo, setPartNo] = useState("")
  const [partName, setPartName] = useState("")
  const [jumlah, setJumlah] = useState("1")
  const [keterangan, setKeterangan] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [partValid, setPartValid] = useState<boolean | null>(null) // null = belum dicek, true = valid, false = tidak valid

  // Fungsi untuk mencari informasi part berdasarkan part number
  const fetchPartInfo = async (partNumber: string) => {
    if (partNumber.trim() === "") {
      setPartName("")
      setPartValid(null)
      return
    }

    try {
      // Kita akan menggunakan endpoint API yang mencari part berdasarkan part_no
      const response = await fetch(`/api/master/parts/search?part_no=${encodeURIComponent(partNumber)}`)

      if (response.ok) {
        const data: PartInfo = await response.json()
        setPartName(data.nama_part || "")
        setPartValid(true)
      } else {
        setPartName("Masukan part no yang benar!!!")
        setPartValid(false)
      }
    } catch (error) {
      console.error("Error fetching part info:", error)
      setPartName("Masukan part no yang benar!!!")
      setPartValid(false)
    }
  }

  // Efek untuk memanggil fetchPartInfo ketika partNo berubah
  useEffect(() => {
    if (partNo) {
      const delayDebounceFn = setTimeout(() => {
        fetchPartInfo(partNo)
      }, 500) // Delay 500ms untuk mencegah panggilan API yang terlalu sering

      return () => clearTimeout(delayDebounceFn)
    } else {
      setPartName("")
      setPartValid(null)
    }
  }, [partNo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validasi bahwa part number valid sebelum submit
    if (partValid === false) {
      setMessage({ type: "error", text: "Part Number tidak valid. Harap masukkan Part Number yang benar." })
      setLoading(false)
      return
    }

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
        setMessage({ type: "success", text: data.message })
        setPartNo("")
        setPartName("")
        setJumlah("1")
        setKeterangan("")
        setPartValid(null)
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
            <Label htmlFor="part-name-out">Part Name</Label>
            <Input
              id="part-name-out"
              value={partName}
              readOnly
              className={`${partValid === false ? "text-red-500 bg-red-50 border-red-200" : partValid === true ? "text-blue-500 bg-blue-50 border-blue-200" : ""}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="part-no-out">Part Number *</Label>
            <div className="flex gap-2">
              <Input
                id="part-no-out"
                value={partNo}
                onChange={(e) => setPartNo(e.target.value.toUpperCase())}
                placeholder="Contoh: FG001"
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    if (navigator.clipboard) {
                      const text = await navigator.clipboard.readText();
                      if (text && text.trim() !== '') {
                        setPartNo(text.trim().toUpperCase());
                      } else {
                        alert('Tidak ada teks di clipboard. Silakan salin hasil scan terlebih dahulu.');
                      }
                    } else {
                      alert('Browser Anda tidak mendukung pembacaan clipboard.');
                    }
                  } catch (err) {
                    console.error('Error reading clipboard:', err);
                    alert('Gagal membaca dari clipboard. Silakan pastikan izin akses diberikan.');
                  }
                }}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
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
