"use client";

import { useAuth } from "@/components/hooks/useAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface WithRoleProtectionOptions {
  allowedRoles: string[];
  redirectPath?: string;
}

export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: WithRoleProtectionOptions
) {
  return function RoleProtectedComponent(props: P) {
    const { user, loading, isLoggedIn } = useAuth();
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);

    useEffect(() => {
      if (!loading) {
        if (!isLoggedIn) {
          // Jika belum login, redirect ke login
          router.push('/login');
        } else if (user && options.allowedRoles.includes(user.role)) {
          // Jika sudah login dan memiliki role yang diizinkan
          setHasAccess(true);
        } else {
          // Jika tidak memiliki akses, redirect ke path yang ditentukan
          router.push(options.redirectPath || '/');
          setHasAccess(false);
        }
      }
    }, [user, loading, isLoggedIn, router, options.allowedRoles, options.redirectPath]);

    if (hasAccess === null || loading) {
      return <div>Loading...</div>;
    }

    if (hasAccess) {
      return <Component {...props} />;
    }

    // Ini hanya akan muncul sebentar sebelum redirect
    return <div>Checking access...</div>;
  };
}