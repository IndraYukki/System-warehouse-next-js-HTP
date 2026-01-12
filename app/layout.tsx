import "./globals.css";
import { Inter } from "next/font/google"; // Tambahkan ini
import { NavbarSwitcher } from "@/components/navbar-switcher";

const inter = Inter({ subsets: ["latin"] }); // Inisialisasi font

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Next.js otomatis mengurus charset dan viewport, tapi tidak apa-apa jika ada */}
      </head>
      <body className={inter.className}> {/* Gunakan font class di sini */}
        <div className="min-h-screen bg-background">
          <NavbarSwitcher />
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}