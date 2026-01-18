"use client";
import React, { useState, useEffect, useRef } from 'react';

export default function MaterialInbound() {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const [form, setForm] = useState({
  material_id: "",
  material_status: "ORI", // default aman
  quantity: 0,
  description: "",
  po_number: ""
});

  useEffect(() => {
    fetch('/api/material')
      .then(res => res.json())
      .then(data => {
        // Jika API mengembalikan format dengan data dan total (pagination), gunakan data.data
        // Jika API mengembalikan array langsung, gunakan data langsung
        if (data.data && Array.isArray(data.data)) {
          setMaterials(data.data);
          setFilteredMaterials(data.data);
        } else {
          setMaterials(data);
          setFilteredMaterials(data);
        }
      });
  }, []);

  // Fungsi untuk menangani pencarian material
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === "") {
      setFilteredMaterials(materials);
      setShowSuggestions(false);
    } else {
      const filtered = materials.filter((material: any) =>
        material.material_name.toLowerCase().includes(term.toLowerCase()) ||
        material.category_name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredMaterials(filtered);
      setShowSuggestions(true);
    }
  };

  // Fungsi untuk memilih material dari suggestion
  const selectMaterial = (material: any) => {
    setForm({ ...form, material_id: material.id });
    setSearchTerm(`${material.material_name} (${material.category_name})`);
    setShowSuggestions(false);
  };

  // Fungsi untuk menangani klik di luar elemen autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
        setForm({
          material_id: "",
          material_status: "ORI",
          quantity: 0,
          description: "",
          po_number: ""
        });
        setSearchTerm(""); // Reset juga search term

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
            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Material</label>
              <input
                type="text"
                className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-emerald-500 outline-none transition"
                placeholder="-- Pilih Biji Plastik --"
                value={searchTerm}
                onChange={handleSearch}
                onFocus={() => {
                  if (searchTerm) setShowSuggestions(true);
                }}
                required
              />
              {showSuggestions && (
                <div 
                  ref={suggestionsRef}
                  className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto"
                >
                  {filteredMaterials.length > 0 ? (
                    filteredMaterials.map((m: any) => (
                      <div
                        key={m.id}
                        className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => selectMaterial(m)}
                      >
                        <div className="font-bold">{m.material_name}</div>
                        <div className="text-sm text-gray-500">{m.Category_name}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500">Material tidak ditemukan</div>
                  )}
                </div>
              )}
            </div>
            {/* Status Material */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Status Material
                </label>
                <select
                  className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-emerald-500 outline-none transition"
                  value={form.material_status}
                  onChange={e =>
                    setForm({ ...form, material_status: e.target.value })
                  }
                  required
                >
                  <option value="ORI">ORI (Virgin / Original)</option>
                  <option value="SCRAP">SCRAP (Recycle / Afalan)</option>
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