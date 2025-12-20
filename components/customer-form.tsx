"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus } from "lucide-react"

interface CustomerFormProps {
  onSuccess: () => void
  initialData?: {
    id?: number
    nama_customer: string
    alamat: string
    telepon: string
    email: string
  } | null
}

export function CustomerForm({ onSuccess, initialData }: CustomerFormProps) {
  const [namaCustomer, setNamaCustomer] = useState(initialData?.nama_customer || "")
  const [alamat, setAlamat] = useState(initialData?.alamat || "")
  const [telepon, setTelepon] = useState(initialData?.telepon || "")
  const [email, setEmail] = useState(initialData?.email || "")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isEdit, setIsEdit] = useState(!!initialData)

  useEffect(() => {
    if (initialData) {
      setNamaCustomer(initialData.nama_customer)
      setAlamat(initialData.alamat)
      setTelepon(initialData.telepon)
      setEmail(initialData.email)
      setIsEdit(true)
    } else {
      setNamaCustomer("")
      setAlamat("")
      setTelepon("")
      setEmail("")
      setIsEdit(false)
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const method = isEdit ? "PUT" : "POST"
      const endpoint = isEdit ? `/api/master/customers/${initialData?.id}` : "/api/master/customers"
      
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_customer: namaCustomer,
          alamat,
          telepon,
          email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: data.message })
        setNamaCustomer("")
        setAlamat("")
        setTelepon("")
        setEmail("")
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
          <UserPlus className="h-5 w-5" />
          {isEdit ? "Edit Customer" : "Tambah Customer Baru"}
        </CardTitle>
        <CardDescription>
          {isEdit 
            ? "Edit informasi customer yang sudah terdaftar" 
            : "Tambah customer baru ke dalam sistem"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama-customer">Nama Customer *</Label>
            <Input
              id="nama-customer"
              value={namaCustomer}
              onChange={(e) => setNamaCustomer(e.target.value)}
              placeholder="Contoh: PT. ABC Manufacturing"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea
              id="alamat"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Alamat lengkap customer"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telepon">Telepon</Label>
            <Input
              id="telepon"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              placeholder="Contoh: 021-12345678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contoh: info@company.com"
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
            {loading ? "Memproses..." : isEdit ? "Update Customer" : "Tambah Customer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}