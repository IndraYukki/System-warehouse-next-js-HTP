"use client"

import { ProductTable } from "@/components/product-table"
import { useEffect } from "react"

export default function AdminEditProductPage() {
  useEffect(() => {
    // Clear any previous notifications on page load
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      // Optional: handle success messages passed via URL parameters
    }
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Update Product</h1>
        <p className="text-muted-foreground">Mengedit dan Menambah Produk baru</p>
      </div>
      <ProductTable />
    </div>
  )
}