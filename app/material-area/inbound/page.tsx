"use client";
import React, { useState, useEffect } from 'react';

export default function MaterialInbound() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    material_id: "",
    quantity: 0,
    description: "",
    po_number: ""
  });

  useEffect(() => {
    fetch('/api/material')
      .then(res => res.json())
      .then(setMaterials);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/material-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'IN' }) // Tipe 'IN' untuk barang masuk
      });

      if (res.ok) {
        alert("Stok berhasil ditambahkan!");
        setForm({ material_id: "", quantity: 0, description: "" });
      } else {
        alert("Gagal menambahkan stok.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-emerald-600 p-6">
          <h1 className="text-2xl font-bold text-white">Material Inbound</h1>
          <p className="text-emerald-100 italic text-sm">Input kedatangan biji plastik dari supplier</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pilih Material */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Material</label>
              <select 
                className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-emerald-500 outline-none transition"
                required
                value={form.material_id}
                onChange={e => setForm({...form, material_id: e.target.value})}
              >
                <option value="">-- Pilih Biji Plastik --</option>
                {materials.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.material_name} ({m.category_name})</option>
                ))}
              </select>
            </div>

            {/* Jumlah Kg */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Jumlah Masuk (Kg)</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-emerald-500 outline-none transition"
                  required
                  value={form.quantity}
                  onChange={e => setForm({...form, quantity: parseFloat(e.target.value)})}
                />
                <span className="absolute right-4 top-3 text-gray-400 font-bold">Kg</span>
              </div>
            </div>
          </div>
            
                        <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nomor PO / Surat Jalan</label>
              <input 
                type="text" 
                placeholder="Contoh: PO-2024-0001"
                className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-emerald-500 outline-none"
                value={form.po_number}
                onChange={e => setForm({...form, po_number: e.target.value})}
                required
              />
            </div>
          {/* Keterangan */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Keterangan / Supplier / No. PO</label>
            <textarea 
              placeholder="Contoh: Masuk dari Supplier PT. Maju Jaya - No PO: 12345"
              className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-emerald-500 outline-none transition"
              rows={3}
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            ></textarea>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className={`bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? 'Memproses...' : 'Konfirmasi Barang Masuk'}
            </button>
          </div>
        </form>
      </div>
      
      <p className="mt-6 text-center text-gray-400 text-sm">
        Catatan: Setiap inputan di sini akan otomatis menambah saldo stok di halaman Inventory.
      </p>
    </div>
  );
}