import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PackagePlus, PackageMinus, Package, History } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Sistem Gudang FG</h1>
          <p className="text-muted-foreground">Sistem manajemen gudang untuk barang finished goods</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="text-center">
              <PackagePlus className="h-10 w-10 mx-auto text-blue-500 mb-3" />
              <CardTitle>Inbound</CardTitle>
              <CardDescription>Pemasukan barang ke gudang</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/inbound">Tambah Barang Masuk</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <PackageMinus className="h-10 w-10 mx-auto text-red-500 mb-3" />
              <CardTitle>Outbound</CardTitle>
              <CardDescription>Pengeluaran barang dari gudang</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/outbound">Keluarkan Barang</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Package className="h-10 w-10 mx-auto text-green-500 mb-3" />
              <CardTitle>Inventory</CardTitle>
              <CardDescription>Daftar barang yang tersedia</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/inventory">Lihat Inventory</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <History className="h-10 w-10 mx-auto text-purple-500 mb-3" />
              <CardTitle>History</CardTitle>
              <CardDescription>Riwayat transaksi barang</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/history">Lihat Riwayat</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 text-center text-sm text-muted-foreground">
          <p>Sistem manajemen gudang untuk memudahkan pengelolaan barang finished goods</p>
        </div>
      </div>
    </div>
  )
}
