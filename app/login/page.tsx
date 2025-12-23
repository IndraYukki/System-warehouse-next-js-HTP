"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi sederhana - dalam produksi, ini harus dicek ke backend
    if (username === "admin" && password === "admin123") {
      // Simpan status login di cookie
      document.cookie = "isLoggedIn=true; path=/; max-age=3600"; // 1 jam

      // Redirect ke halaman edit inventory
      router.push("/edit-inventory")
      router.refresh() // Refresh untuk memastikan middleware mendeteksi perubahan
    } else {
      setError("Username atau password salah")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Login Admin</CardTitle>
          <CardDescription>Masukkan kredensial admin untuk mengakses fitur edit inventory</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>

          <div className="mt-6 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
            <p><strong>Catatan:</strong></p>
            <p>Username: admin</p>
            <p>Password: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}