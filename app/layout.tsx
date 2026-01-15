import "./globals.css";
import styles from "./layout.module.css";
import { Inter } from "next/font/google";
import { NavbarSwitcher } from "@/components/navbar-switcher";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className={styles.container}>
          <NavbarSwitcher />
          <main className={styles.main}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
