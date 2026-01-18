"use client";
import { useState } from "react";

export default function AddMaterialModal({ isOpen, onClose, onRefresh }: any) {
  const [form, setForm] = useState({
    material_name: "",
    category_name: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/material", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      onRefresh();
      onClose();
      setForm({ material_name: "", category_name: "" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-emerald-700">Tambah Master Biji Plastik</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Grade Material</label>
            <input 
              type="text" 
              placeholder="Contoh: ABS LG HI-121" 
              className="w-full border p-2 rounded-lg mt-1" 
              required
              value={form.material_name}
              onChange={(e) => setForm({ ...form, material_name: e.target.value })} 
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Kategori / Jenis</label>
            <input 
              type="text" 
              placeholder="Contoh: ABS / PP / NYLON" 
              className="w-full border p-2 rounded-lg mt-1"
              value={form.category_name}
              onChange={(e) => setForm({ ...form, category_name: e.target.value })} 
            />
          </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Alamat / Lokasi Penyimpanan</label>
              <input 
                type="text" 
                placeholder="Ketik lokasi (contoh: Rak A-01)" 
                className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-emerald-500 outline-none transition"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                // Tidak wajib diisi (optional) agar fleksibel
              />
            </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-md">
              Simpan Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}