"use client"

import { useAuth } from "@/components/hooks/useAuth"
import { usePathname } from "next/navigation"
import { ACCESS_POLICY } from "@/lib/access-policy"

export function PageGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()

  // 1️⃣ Publik total (tidak login)
  if (!user) return <>{children}</>

  // 2️⃣ Ambil daftar halaman yg dia BOLEH buka
  const allowedPages = ACCESS_POLICY[user.role] || []


  // 3️⃣ Kalau halaman ini miliknya → boleh
  if (allowedPages.includes(pathname)) {
    return <>{children}</>
  }

  // 4️⃣ Kalau halaman ini dilindungi tapi bukan miliknya → tolak
  const allProtectedPages = Object.values(ACCESS_POLICY).flat()

  if (allProtectedPages.includes(pathname)) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        🚫 Kamu tidak memiliki akses ke halaman ini
      </div>
    )
  }

  // 5️⃣ Halaman publik
  return <>{children}</>
}
