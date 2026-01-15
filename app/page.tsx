import { Package, Layers } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto py-16">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Sistem Gudang HTP
        </h1>
        <p className="text-muted-foreground text-lg">
          Sistem terintegrasi untuk pengelolaan gudang Finished Goods dan Raw Material
          secara efisien, terstruktur, dan terdokumentasi.
        </p>
      </div>

      {/* DEPARTEMENT INFO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* FINISH GOOD */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-7 w-7 text-blue-600" />
            <h2 className="text-xl font-semibold">Finished Goods Area</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Area pengelolaan barang jadi yang siap disimpan dan dikirim ke customer.
          </p>

          <ul className="space-y-2 text-sm">
            <li>• Inbound barang jadi</li>
            <li>• Outbound / pengiriman</li>
            <li>• Monitoring stok & rak</li>
            <li>• Riwayat transaksi</li>
          </ul>
        </div>

        {/* MATERIAL */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="h-7 w-7 text-green-600" />
            <h2 className="text-xl font-semibold">Material Area</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Area pengelolaan material produksi dan proses manufaktur.
          </p>

          <ul className="space-y-2 text-sm">
            <li>• Inbound material</li>
            <li>• Bill of Material (BOM)</li>
            <li>• Proses produksi</li>
            <li>• Transaksi material</li>
          </ul>
        </div>
      </div>

      {/* FOOT NOTE */}
      <div className="text-center mt-14 text-sm text-muted-foreground">
        Gunakan menu navigasi di atas untuk mengakses masing-masing area kerja.
      </div>
    </div>
  )
}
