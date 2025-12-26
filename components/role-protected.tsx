"use client";

import { useAuth } from "@/components/hooks/useAuth";
import { ReactNode } from "react";

interface RoleProtectedProps {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleProtected({ allowedRoles, children, fallback = null }: RoleProtectedProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback;
  }

  return <>{children}</>;
}