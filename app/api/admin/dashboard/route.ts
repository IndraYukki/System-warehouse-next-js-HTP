import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(request: Request) {
  const pool = getPool();

  try {
    // Hitung total produk
    const [productsResult] = await pool.query(
      `SELECT COUNT(*) as total FROM master_parts`
    );
    const totalProducts = (productsResult as any)[0].total;

    // Hitung total qty produk
    const [qtyResult] = await pool.query(
      `SELECT COALESCE(SUM(jumlah), 0) as total_qty FROM inventory`
    );
    const totalQty = (qtyResult as any)[0].total_qty || 0;

    // Hitung total customer
    const [customersResult] = await pool.query(
      `SELECT COUNT(*) as total FROM customers`
    );
    const totalCustomers = (customersResult as any)[0].total;

    // Hitung total rak dari tabel master_racks
    const [racksResult] = await pool.query(
      `SELECT COUNT(*) as total_racks FROM master_racks`
    );
    const totalRacks = (racksResult as any)[0].total_racks || 0;

    // Hitung rak yang terisi (rak yang digunakan di inventory dengan jumlah > 0)
    // Ini memberikan informasi sebenarnya tentang rak yang sedang digunakan
    const [filledRacksResult] = await pool.query(
      `SELECT COUNT(DISTINCT alamat_rak) as filled_racks FROM inventory
       WHERE alamat_rak IS NOT NULL AND jumlah > 0`
    );
    const filledRacks = (filledRacksResult as any)[0].filled_racks || 0;

    // Hitung rak kosong (total rak dikurangi rak terisi)
    // Ini adalah rak-rak yang terdaftar di master_racks tapi tidak sedang digunakan
    const emptyRacks = totalRacks - filledRacks;

    return NextResponse.json({
      totalProducts: parseInt(totalProducts),
      totalQty: parseInt(totalQty),
      totalCustomers: parseInt(totalCustomers),
      totalRacks: parseInt(totalRacks),
      filledRacks: parseInt(filledRacks),
      emptyRacks: parseInt(emptyRacks)
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}