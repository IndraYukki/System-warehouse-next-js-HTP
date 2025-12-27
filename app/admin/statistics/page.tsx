"use client"

import { RoleProtected } from "@/components/role-protected"

export default function AdminStatisticsPage() {
  return (
    <RoleProtected
      allowedRoles={['admin', 'manager']}
      fallback={
        <div className="container mx-auto py-10 px-4">
          <div className="text-center py-10 text-red-500">
            Anda tidak memiliki akses ke halaman ini.
          </div>
        </div>
      }
    >
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Statistik Admin</h1>
          <p className="text-muted-foreground">Informasi statistik sistem gudang</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <p className="text-center text-lg text-muted-foreground">Sabar Masih Tahap Pengembangan Ges!!</p>
        </div>
      </div>
    </RoleProtected>
  )
}