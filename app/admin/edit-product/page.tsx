import { ProductTable } from "@/components/product-table"

export default function AdminEditProductPage() {
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