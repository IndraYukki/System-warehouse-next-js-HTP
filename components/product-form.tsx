"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, PackagePlus } from "lucide-react"

interface ProductFormProps {
  onSuccess: (message?: { type: "success" | "error"; text: string }) => void
  initialData?: {
    id?: number
    part_no: string
    nama_part: string
    deskripsi: string
    satuan: string
    customer_id: number | null
  } | null
}

interface Customer {
  id: number
  nama_customer: string
}

export function ProductForm({ onSuccess, initialData }: ProductFormProps) {
  const [partNo, setPartNo] = useState(initialData?.part_no || "")
  const [namaPart, setNamaPart] = useState(initialData?.nama_part || "")
  const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi || "")
  const [satuan, setSatuan] = useState(initialData?.satuan || "")
  const [customerId, setCustomerId] = useState<string>(initialData?.customer_id?.toString() || "")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isEdit, setIsEdit] = useState(!!initialData)

  useEffect(() => {
    if (initialData) {
      setPartNo(initialData.part_no)
      setNamaPart(initialData.nama_part)
      setDeskripsi(initialData.deskripsi)
      setSatuan(initialData.satuan)
      setCustomerId(initialData.customer_id?.toString() || "")
      setIsEdit(true)
    } else {
      setPartNo("")
      setNamaPart("")
      setDeskripsi("")
      setSatuan("")
      setCustomerId("")
      setIsEdit(false)
    }
    
    fetchCustomers()
  }, [initialData])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/master/customers")
      const data = await response.json()
      setCustomers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

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
          customer_id: customerId ? parseInt(customerId) : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const successMessage = {
          type: "success" as const,
          text: isEdit
            ? `Produk ${namaPart} berhasil di update`
            : `Produk ${namaPart} berhasil di tambah ke finishgood kita`
        }
        setMessage(successMessage)
        setPartNo("")
        setNamaPart("")
        setDeskripsi("")
        setSatuan("")
        setCustomerId("")
        onSuccess(successMessage)
      } else {
        const errorMessage = {
          type: "error" as const,
          text: data.error || (isEdit ? "Gagal memperbarui produk" : "Gagal menambahkan produk")
        }
        setMessage(errorMessage)
        onSuccess(errorMessage)
      }
    } catch (error) {
      const errorMessage = { type: "error" as const, text: "Terjadi kesalahan koneksi" }
      setMessage(errorMessage)
      onSuccess(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackagePlus className="h-5 w-5" />
          {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
        </CardTitle>
        <CardDescription>
          {isEdit 
            ? "Edit informasi produk yang sudah terdaftar" 
            : "Tambah produk baru ke dalam sistem"}
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

          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih customer (opsional)" />
              </SelectTrigger>
              <SelectContent>
                {customers && Array.isArray(customers) ? (
                  customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.nama_customer}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>Loading...</SelectItem>
                )}
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
            {loading ? "Memproses..." : isEdit ? "Update Produk" : "Tambah Produk"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}