"use client";

import { useEffect, useRef } from "react";

export function useSessionTimeout(timeoutMinutes: number, onTimeout: () => void, isActive: boolean) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Fungsi untuk mereset timer
    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Jika user aktif, atur timer untuk logout otomatis
      if (isActive) {
        timeoutRef.current = setTimeout(() => {
          onTimeout();
        }, timeoutMinutes * 60 * 1000); // Konversi menit ke milidetik
      }
    };

    // Tambahkan event listener untuk aktivitas pengguna
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'keydown'];

    // Inisialisasi timer
    resetTimer();

    // Tambahkan event listener untuk mereset timer saat ada aktivitas
    events.forEach(event => {
      window.addEventListener(event, resetTimer, true);
    });

    // Hapus event listener dan timer saat komponen unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      events.forEach(event => {
        window.removeEventListener(event, resetTimer, true);
      });
    };
  }, [timeoutMinutes, onTimeout, isActive]);
}