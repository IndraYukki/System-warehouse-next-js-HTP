"use client";
import React, { useState, useEffect } from 'react';

export default function MasterBOM() {
  const [bomData, setBomData] = useState([]);
  const [materials, setMaterials] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 1. UPDATE STATE: Tambahkan part_no dan product_color
  const [form, setForm] = useState({
    part_no: "", 
    product_name: "", 
    product_category: "", 
    product_color: "", 
    material_id: "",
    weight_part: 0, 
    weight_runner: 0, 
    cavity: 1
  });

  useEffect(() => {
    fetchData();
    fetchMaterials();
  }, []);

  const fetchData = () => {
    fetch('/api/material-bom').then(res => res.json()).then(setBomData);
  };

  const fetchMaterials = () => {
    fetch('/api/material').then(res => res.json()).then(setMaterials);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/material-bom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setIsModalOpen(false);
      fetchData();
      // Reset form setelah simpan
      setForm({
        part_no: "", product_name: "", product_category: "", product_color: "",
        material_id: "", weight_part: 0, weight_runner: 0, cavity: 1
      });
    } else {
      alert("Gagal simpan! Pastikan Part No unik dan semua field terisi.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Master BOM (Resep Produk)</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-4 py-2 rounded">
          + Tambah Produk
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Part No</th> {/* Kolom Baru */}
              <th className="p-3">Nama Produk</th>
              <th className="p-3">Warna</th> {/* Kolom Baru */}
              <th className="p-3">Material</th>
              <th className="p-3 text-center">Part(g)</th>
              <th className="p-3 text-center">Runner(g)</th>
              <th className="p-3 text-center">Cav</th>
            </tr>
          </thead>
          <tbody>
            {bomData.map((item: any) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono text-blue-600 font-bold">{item.part_no}</td>
                <td className="p-3 font-semibold">{item.product_name}</td>
                <td className="p-3">{item.product_color || '-'}</td>
                <td className="p-3 text-emerald-600">{item.material_name || 'Tidak ada'}</td>
                <td className="p-3 text-center">{item.weight_part}</td>
                <td className="p-3 text-center">{item.weight_runner}</td>
                <td className="p-3 text-center">{item.cavity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Input */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold border-b pb-2">Tambah Resep Produk</h2>
            
            {/* Input Part No & Warna (Baru) */}
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Part Number (Unik)" className="border p-2 rounded" required
                value={form.part_no}
                onChange={e => setForm({...form, part_no: e.target.value})} />
              <input placeholder="Warna Produk" className="border p-2 rounded"
                value={form.product_color}
                onChange={e => setForm({...form, product_color: e.target.value})} />
            </div>

            <input placeholder="Nama Produk" className="w-full border p-2 rounded" required
              value={form.product_name}
              onChange={e => setForm({...form, product_name: e.target.value})} />
            
            <input placeholder="Kategori (Otomotif/Elektronik)" className="w-full border p-2 rounded"
              value={form.product_category}
              onChange={e => setForm({...form, product_category: e.target.value})} />
            
            <select className="w-full border p-2 rounded bg-yellow-50" required
              value={form.material_id}
              onChange={e => setForm({...form, material_id: e.target.value})}>
              <option value="">-- Pilih Jenis Biji Plastik --</option>
              {materials.map((m: any) => (
                <option key={m.id} value={m.id}>{m.material_name} ({m.category_name})</option>
              ))}
            </select>

            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded">
              <div>
                <label className="text-[10px] font-bold">Part (gr)</label>
                <input type="number" placeholder="0.00" className="w-full border p-1 rounded" step="0.01" required
                  onChange={e => setForm({...form, weight_part: parseFloat(e.target.value)})}/>
              </div>
              <div>
                <label className="text-[10px] font-bold">Runner (gr)</label>
                <input type="number" placeholder="0.00" className="w-full border p-1 rounded" step="0.01" required
                  onChange={e => setForm({...form, weight_runner: parseFloat(e.target.value)})}/>
              </div>
              <div>
                <label className="text-[10px] font-bold">Cavity</label>
                <input type="number" placeholder="1" className="w-full border p-1 rounded" required
                  onChange={e => setForm({...form, cavity: parseInt(e.target.value)})}/>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 px-4">Batal</button>
              <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded font-bold shadow-md">Simpan Master BOM</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}