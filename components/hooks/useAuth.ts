"use client";

import { useState, useEffect } from "react";
import { useSessionTimeout } from "./useSessionTimeout";

interface User {
  id: number;
  username: string;
  nama_panggilan: string;
  role: string;
  email: string;
  nomor_telepon: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
}

// Fungsi global untuk mengecek apakah pengguna berada di halaman admin
function isAdminPage() {
  if (typeof window !== 'undefined') {
    return window.location.pathname.startsWith('/admin');
  }
  return false;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    loading: true,
  });

  // Fungsi logout
  const logout = async () => {
    try {
      // Panggil API logout
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Reset state
      setAuthState({
        isLoggedIn: false,
        user: null,
        loading: false,
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Gunakan session timeout hanya di halaman admin
  const handleTimeout = async () => {
    await logout(); // Pastikan logout dipanggil dulu
    window.location.href = '/'; // Redirect ke dashboard utama
  };

  useSessionTimeout(2, handleTimeout, authState.isLoggedIn); // Ubah menjadi 2 menit dan aktif di semua halaman yang login

  useEffect(() => {
    // Cek status login dari cookie atau localStorage
    const checkAuthStatus = async () => {
      try {
        // Cek apakah cookie isLoggedIn ada dan bernilai true
        // Kita akan menggunakan fetch ke endpoint khusus untuk memeriksa status login
        const response = await fetch("/api/auth/status");
        const data = await response.json();

        if (response.ok && data.isLoggedIn) {
          setAuthState({
            isLoggedIn: true,
            user: data.user || null,
            loading: false,
          });
        } else {
          setAuthState({
            isLoggedIn: false,
            user: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setAuthState({
          isLoggedIn: false,
          user: null,
          loading: false,
        });
      }
    };

    checkAuthStatus();

    // Tambahkan event listener untuk memperbarui status jika login/logout dari tempat lain
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = (userData: User) => {
    setAuthState({
      isLoggedIn: true,
      user: userData,
      loading: false,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
}