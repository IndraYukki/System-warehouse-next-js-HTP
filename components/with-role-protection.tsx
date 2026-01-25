"use client";

import { useAuth } from "@/components/hooks/useAuth";
import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation"; // Tidak digunakan untuk kontrol akses

interface WithRoleProtectionOptions {
  allowedRoles: string[];
  redirectPath?: string;
}

export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: WithRoleProtectionOptions
) {
  // --- BYPASS ACCESS CONTROL ---
  // Nonaktifkan pengecekan role dan redirect. Selalu tampilkan komponen.
  // useAuth() mungkin masih dipanggil untuk keperluan lain di dalam Component,
  // tetapi hasilnya tidak digunakan untuk kontrol akses dalam HOC ini.

  // const { user, loading, isLoggedIn } = useAuth(); // Tidak digunakan untuk kontrol akses
  // const router = useRouter(); // Tidak digunakan untuk kontrol akses
  // const [hasAccess, setHasAccess] = useState<boolean | null>(null); // Tidak digunakan untuk kontrol akses

  // useEffect(() => { ... }, [...]); // Tidak digunakan untuk kontrol akses

  // Langsung render komponen tanpa pengecekan
  return function RoleProtectedComponent(props: P) {
    return <Component {...props} />;
  };
}