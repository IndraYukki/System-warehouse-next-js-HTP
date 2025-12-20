"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Edit, Trash2, Plus } from "lucide-react"
import { CustomerForm } from "@/components/customer-form"

interface Customer {
  id: number
  nama_customer: string
  alamat: string
  telepon: string
  email: string
  created_at: string
  updated_at: string
}

export function CustomerTable() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/master/customers")
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const response = await fetch(`/api/master/customers/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchCustomers() // Refresh data
        } else {
          alert("Gagal menghapus data")
        }
      } catch (error) {
        console.error("Error deleting customer:", error)
        alert("Terjadi kesalahan saat menghapus data")
      }
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingCustomer(null)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingCustomer(null)
    fetchCustomers() // Refresh data
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <CustomerForm 
          initialData={editingCustomer || undefined} 
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
            <Users className="h-5 w-5" />
            Data Customer
          </CardTitle>
          <CardDescription>Daftar semua customer yang terdaftar dalam sistem</CardDescription>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Customer
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Belum ada data customer</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Nama Customer</th>
                  <th className="text-left py-3 px-4 font-medium">Alamat</th>
                  <th className="text-left py-3 px-4 font-medium">Telepon</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {customers && Array.isArray(customers) ? (
                  customers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{customer.nama_customer}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{customer.alamat}</td>
                      <td className="py-3 px-4 text-sm">{customer.telepon}</td>
                      <td className="py-3 px-4 text-sm">{customer.email}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(customer)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(customer.id)}
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
                      Tidak ada data customer
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