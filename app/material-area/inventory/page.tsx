"use client";

import React, { useState, useEffect } from 'react';
// Pastikan path import ini benar sesuai tempat kamu membuat file modalnya
import AddMaterialModal from '@/components/material/AddMaterialModal'; 

export default function MaterialInventory() {
  // 1. SEMUA HOOKS (useState) HARUS DI SINI (DI DALAM FUNGSI)
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // <--- PINDAH KE SINI

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/material');
      const data = await res.json();
      setMaterials(data);
      setLoading(false);
    } catch (err) {
      console.error("Gagal load material:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  if (loading) return <p className="p-10">Memuat data material...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Biji Plastik</h1>
        <button 
          onClick={() => setIsModalOpen(true)} // Membuka Modal
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
        >
          + Tambah Material
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
            <tr>
              <th className="p-4">Nama Material</th>
              <th className="p-4">Kategori</th>
              <th className="p-4 text-center">Part (gr)</th>
              <th className="p-4 text-center">Runner (gr)</th>
              <th className="p-4 text-center">Cavity</th>
              <th className="p-4 text-right">Stok (Kg)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {materials.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">Belum ada data material.</td></tr>
            ) : (
              materials.map((m: any) => (
                <tr key={m.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{m.material_name}</td>
                  <td className="p-4 text-gray-600">{m.category_name}</td>
                  <td className="p-4 text-center">{m.weight_part}</td>
                  <td className="p-4 text-center">{m.weight_runner}</td>
                  <td className="p-4 text-center">{m.cavity}</td>
                  <td className="p-4 text-right font-bold text-emerald-600">{m.stock_kg} Kg</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 2. MODAL DITARUH DI BAGIAN BAWAH SEBELUM PENUTUP DIV UTAMA */}
      <AddMaterialModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchMaterials} 
      />
    </div>
  );
}