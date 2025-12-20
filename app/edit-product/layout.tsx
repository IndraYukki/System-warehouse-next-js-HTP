import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CommonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="text-xl">🏠</span>
            <span>Sistem Gudang FG</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/inbound">Inbound</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/outbound">Outbound</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/inventory">Inventory</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/history">History</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/edit-product">Edit Produk</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}