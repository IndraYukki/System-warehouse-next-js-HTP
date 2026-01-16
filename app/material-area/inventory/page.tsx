"use client";

import React, { useState, useEffect } from 'react';
import AddMaterialModal from '@/components/material/AddMaterialModal';

export default function MaterialInventory() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/material');
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      setMaterials(data);
    } catch (err) {
      console.error("Gagal load material:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  if (loading) return <div className="p-10 text-center italic text-gray-500">Memuat data inventory...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 uppercase">Material Inventory</h1>
          <p className="text-sm text-gray-500">Stok biji plastik dan lokasi penyimpanan</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-emerald-700 transition"
        >
          + Tambah Material
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-[11px] font-black uppercase">
            <tr>
              <th className="p-4 border-r">Nama Material</th>
              <th className="p-4 border-r">Kategori</th>
              <th className="p-4 border-r text-center">Lokasi</th>
              <th className="p-4 text-right bg-blue-50/30">Stok (g/kg)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {materials.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-400">Belum ada data material.</td>
              </tr>
            ) : (
              materials.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-r font-bold text-gray-800">{m.material_name}</td>
                  <td className="p-4 border-r uppercase text-xs text-gray-500">{m.category_name}</td>
                  <td className="p-4 border-r text-center">
                    <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-[10px] font-bold">
                      {m.location || '-'}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono text-blue-600">
                    <div>{(Number(m.stock_kg) * 1000).toLocaleString('id-ID')} g</div>
                    <div className="text-sm">{Number(m.stock_kg).toFixed(3)} kg</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddMaterialModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchMaterials} 
      />
    </div>
  );
}