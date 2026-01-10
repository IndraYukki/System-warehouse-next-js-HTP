import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Factory } from "lucide-react";

export default function InventoryGuidePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Panduan Inventory</h1>
          <p className="text-muted-foreground">Pilih jenis inventory yang sesuai dengan kebutuhan Anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Package className="h-10 w-10 mx-auto text-blue-500 mb-3" />
              <CardTitle>Inventory Finish Goods</CardTitle>
              <CardDescription>Untuk barang-barang yang sudah selesai diproduksi</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/inventory">Akses Inventory FG</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Factory className="h-10 w-10 mx-auto text-green-500 mb-3" />
              <CardTitle>Inventory Material</CardTitle>
              <CardDescription>Untuk bahan baku dan material produksi</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/material-inventory">Akses Inventory Material</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button variant="secondary" asChild>
            <Link href="/finishgood">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}