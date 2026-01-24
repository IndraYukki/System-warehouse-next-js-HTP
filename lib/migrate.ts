// Script untuk menjalankan migrasi database
import { createUsersTable, addDefaultAdminUser } from "@/lib/db-migration";
import { runMaterialMigrations } from "@/lib/db-migration-material";

async function runMigrations() {
  console.log("Memulai migrasi database...");

  try {
    // Buat tabel users
    await createUsersTable();

    // Tambahkan user admin default jika belum ada
    await addDefaultAdminUser();

    // Migrasi tabel-tabel untuk departemen material
    await runMaterialMigrations();

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