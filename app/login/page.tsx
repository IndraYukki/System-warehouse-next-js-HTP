"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, LockKeyhole, User } from "lucide-react"; // Pastikan lucide-react terinstall

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Login gagal, cek kembali kredensial Anda");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi ke server");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
  /* PEMBUNGKUS UTAMA: Menggunakan fixed inset-0 untuk mengunci layar */
  <div className="fixed inset-0 w-full h-full overflow-hidden bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-700 flex flex-col items-center justify-center p-4">
    
    {/* DEKORASI: Menggunakan absolute agar tidak merusak tata letak */}
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-black/20 rounded-full blur-[100px]"></div>
    </div>

    {/* KONTEN UTAMA: Card Login */}
    <Card className="w-full max-w-md z-10 backdrop-blur-xl bg-white/90 shadow-2xl border-none">
      <CardHeader className="space-y-1 pt-8">
        <div className="mx-auto bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner">
          <LockKeyhole className="w-8 h-8 text-cyan-600" />
        </div>
        <CardTitle className="text-3xl font-bold text-center tracking-tight text-slate-800">
          HTP Admin
        </CardTitle>
        <CardDescription className="text-center text-slate-500 font-medium">
          Sistem Manajemen Gudang
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-8">
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              <p className="flex items-center gap-2">
                <span className="font-bold">⚠️ Error:</span> {error}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-700 font-semibold ml-1">
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="username"
                type="text"
                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all duration-200"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin_FG"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 font-semibold ml-1">
              Password
            </Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-cyan-600 hover:bg-cyan-700 py-6 text-lg font-bold shadow-lg shadow-cyan-500/30 transition-all active:scale-[0.98]" 
            disabled={loading}
          >
            {loading ? "Membuka Gudang..." : "Masuk ke Dashboard"}
          </Button>
        </form>
      </CardContent>
    </Card>

    {/* FOOTER: Tetap di bawah tanpa mendorong layar */}
    <div className="mt-8 text-white/70 text-sm font-medium z-10">
      &copy; {new Date().getFullYear()} HTP Material & Finish Good System
    </div>
  </div>
);
}