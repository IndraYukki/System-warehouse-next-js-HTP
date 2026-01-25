"use client";

import { useAuth } from "@/components/hooks/useAuth";
import { ReactNode } from "react";

interface RoleProtectedProps {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleProtected({ allowedRoles, children, fallback = null }: RoleProtectedProps) {
  // --- BYPASS ACCESS CONTROL ---
  // Nonaktifkan pengecekan role. Selalu tampilkan children.
  // useAuth() mungkin masih dipanggil untuk keperluan lain, tetapi
  // hasilnya tidak digunakan untuk kontrol akses dalam komponen ini.

  // const { user, loading } = useAuth(); // Tidak digunakan untuk kontrol akses

  // Izinkan semua children untuk ditampilkan
  return <>{children}</>;
}