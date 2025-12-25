// Script untuk menjalankan migrasi database
import { createUsersTable, addDefaultAdminUser } from "@/lib/db-migration";

async function runMigrations() {
  console.log("Memulai migrasi database...");
  
  try {
    // Buat tabel users
    await createUsersTable();
    
    // Tambahkan user admin default jika belum ada
    await addDefaultAdminUser();
    
    console.log("Migrasi database selesai!");
  } catch (error) {
    console.error("Error saat menjalankan migrasi:", error);
    process.exit(1);
  }
}

// Jalankan migrasi jika file ini dijalankan langsung
if (require.main === module) {
  runMigrations();
}

export default runMigrations;