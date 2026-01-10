"use client";
import React, { useState, useEffect } from 'react';

export default function ProductionOutbound() {
  const [boms, setBoms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBom, setSelectedBom] = useState<any>(null);
  const [qty, setQty] = useState(0);
  const [scrap, setScrap] = useState(2); // Default 2%
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/material-bom').then(res => res.json()).then(setBoms);
  }, []);

  // Fungsi untuk handle pencarian Autocomplete
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedBom(null); // Reset jika user mengubah input
    setShowSuggestions(true);
  };

  const selectProduct = (item: any) => {
    setSearchTerm(item.part_no);
    setSelectedBom(item);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBom) return;
    
    setLoading(true);
    const res = await fetch('/api/material-production', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        bom_id: selectedBom.id, 
        qty_produced: qty, 
        scrap_percentage: scrap 
      })
    });

    if (res.ok) {
      alert("Transaksi Berhasil! Stok telah dipotong otomatis.");
      window.location.reload(); // Refresh untuk update data terbaru
    } else {
      alert("Terjadi kesalahan saat memproses data.");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
        <div className="bg-blue-600 p-6">
          <h1 className="text-2xl font-bold text-white">Production Report (Outbound)</h1>
          <p className="text-blue-100 italic">Sistem akan memotong stok material otomatis berdasarkan resep BOM</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* SISI KIRI: INPUT DATA */}
          <div className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">Input Part Number</label>
              <input 
                type="text" 
                placeholder="Ketik Part No..." 
                className={`w-full p-3 border-2 rounded-xl outline-none transition ${selectedBom ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 focus:border-blue-500'}`}
                value={searchTerm}
                onChange={handleSearch}
                required
              />
              
              {/* Pesan Validasi */}
              {searchTerm && !selectedBom && (
                <p className="text-red-500 text-xs mt-1 font-semibold animate-pulse">⚠ Masukkan Part No yang benar</p>
              )}

              {/* Dropdown Autocomplete */}
              {showSuggestions && searchTerm && !selectedBom && (
                <div className="absolute z-10 w-full bg-white border rounded-xl mt-1 shadow-2xl max-h-60 overflow-y-auto">
                  {boms.filter((b:any) => b.part_no.toLowerCase().includes(searchTerm.toLowerCase())).map((item: any) => (
                    <div 
                      key={item.id} 
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                      onClick={() => selectProduct(item)}
                    >
                      <p className="font-bold text-blue-700">{item.part_no}</p>
                      <p className="text-xs text-gray-500">{item.product_name} - {item.product_color}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nama Part (Read Only sebagai Validasi) */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="text-xs font-bold text-gray-400 uppercase">Nama Part Terdeteksi</label>
              <p className={`text-lg font-black ${selectedBom ? 'text-gray-800' : 'text-gray-300'}`}>
                {selectedBom ? selectedBom.product_name : "---"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Qty Produksi (Pcs)</label>
                <input 
                  type="number" 
                  className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none"
                  onChange={e => setQty(parseInt(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Scrap (%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={scrap}
                  className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none"
                  onChange={e => setScrap(parseFloat(e.target.value))}
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={!selectedBom || loading}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition ${selectedBom ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              {loading ? "Memproses..." : "Konfirmasi & Potong Stok"}
            </button>
          </div>

          {/* SISI KANAN: PREVIEW PERHITUNGAN */}
          <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200">
            <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2 text-center uppercase">Detail Kalkulasi Material</h2>
            
            {selectedBom ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Material Utama:</span>
                  <span className="font-bold text-emerald-600">{selectedBom.material_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Warna:</span>
                  <span className="font-bold">{selectedBom.product_color}</span>
                </div>
                <hr />
                <div className="grid grid-cols-2 gap-2 text-xs text-center">
                  <div className="bg-white p-2 rounded shadow-sm">
                    <p className="text-gray-400">Weight Part</p>
                    <p className="font-bold">{selectedBom.weight_part} g</p>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <p className="text-gray-400">Runner/Cav</p>
                    <p className="font-bold">{(selectedBom.weight_runner / selectedBom.cavity).toFixed(2)} g</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border-2 border-blue-500 mt-6 shadow-inner">
                  <p className="text-xs font-bold text-blue-500 text-center uppercase mb-1">Total Estimasi Keluar</p>
                  <p className="text-4xl font-black text-blue-900 text-center">
                    {(( (Number(selectedBom.weight_part) + (Number(selectedBom.weight_runner) / selectedBom.cavity)) * qty / 1000) * (1 + scrap/100)).toFixed(3)}
                    <span className="text-lg ml-2">Kg</span>
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 text-center italic">
                  *Rumus: (Weight Part + (Runner/Cavity)) × Qty + Scrap%
                </p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>Silakan masukkan Part No untuk melihat detail</p>
              </div>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}