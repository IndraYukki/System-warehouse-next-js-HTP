import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(request: Request) {
  const pool = getPool();
  const { searchParams } = new URL(request.url);

  // Ambil parameter untuk pagination
  const limit = parseInt(searchParams.get("limit") || "1000") // Ambil semua data untuk client-side pagination
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    // Dapatkan semua rak dari master_racks
    const [racksResult] = await pool.query(
      `SELECT
        id,
        alamat_rak as rack_code,
        zona,
        status,
        max_capacity,
        notes,
        created_at,
        updated_at
      FROM master_racks
      ORDER BY zona, alamat_rak`
    );

    const racks = Array.isArray(racksResult) ? racksResult : [];

    // Dapatkan informasi inventory untuk setiap rak
    const [inventoryResult] = await pool.query(
      `SELECT
        alamat_rak,
        part_no,
        jumlah
      FROM inventory
      WHERE alamat_rak IS NOT NULL AND jumlah > 0`
    );

    const inventoryMap: { [key: string]: any } = {};
    if (Array.isArray(inventoryResult)) {
      inventoryResult.forEach((item: any) => {
        // Jika ada beberapa item di rak yang sama, kita ambil salah satu
        inventoryMap[item.alamat_rak] = item;
      });
    }

    // Dapatkan informasi master_parts untuk mendapatkan nama_part
    let partMap: { [key: string]: any } = {};

    if (inventoryResult.length > 0) {
      const partNos = inventoryResult.map((inv: any) => `'${inv.part_no}'`).join(',');
      if (partNos) {
        const [partResult] = await pool.query(
          `SELECT part_no, nama_part FROM master_parts WHERE part_no IN (${partNos})`
        );
        const partInfo = Array.isArray(partResult) ? partResult : [];

        // Buat mapping dari part_no ke nama_part
        partMap = {};
        partInfo.forEach((part: any) => {
          partMap[part.part_no] = part;
        });
      }
    }

    // Gabungkan informasi rak dengan informasi inventory
    const rackStatus = racks.map((rack: any) => {
      const inv = inventoryMap[rack.rack_code] || null;
      const partInfo = inv ? partMap[inv.part_no] : null;

      // Status rak ditentukan berdasarkan apakah ada produk di inventory atau tidak
      const actualStatus = inv ? 'occupied' : 'available';

      return {
        id: rack.id,
        rack_code: rack.rack_code,
        rack_name: rack.rack_code,
        zone: rack.zona,
        status: actualStatus,
        product_info: inv && partInfo ? `${inv.part_no} - ${partInfo.nama_part} (${inv.jumlah} pcs)` : null,
        nama_part: partInfo ? partInfo.nama_part : null
      };
    });

    // Kembalikan semua data untuk client-side pagination
    return NextResponse.json(rackStatus);
  } catch (error) {
    console.error("Error fetching rack status:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}