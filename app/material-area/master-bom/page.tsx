"use client";
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function MasterBOM() {
  const [bomData, setBomData] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
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

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(0); // Reset ke halaman pertama saat mengganti jumlah item per halaman
  };

  useEffect(() => {
    fetchData();
    fetchMaterials();
  }, [searchTerm, currentPage, itemsPerPage]);

  const fetchData = () => {
    let url = '/api/material-bom';
    const params = new URLSearchParams();

    if (searchTerm) {
      params.append('search', encodeURIComponent(searchTerm));
    }
    params.append('limit', itemsPerPage.toString());
    params.append('offset', (currentPage * itemsPerPage).toString());

    url += '?' + params.toString();

    fetch(url).then(res => res.json()).then(data => {
      // Jika API mengembalikan format dengan data dan total
      if (data.data && typeof data.total !== 'undefined') {
        setBomData(data.data);
        setTotalItems(data.total);
      } else {
        // Jika API masih mengembalikan array langsung
        setBomData(data);
        setTotalItems(Array.isArray(data) ? data.length : 0);
      }
    });
  };

  const fetchMaterials = () => {
    fetch('/api/material').then(res => res.json()).then(data => {
      // Jika API mengembalikan format dengan data dan total (pagination), gunakan data.data
      // Jika API mengembalikan array langsung, gunakan data langsung
      if (data.data && Array.isArray(data.data)) {
        setMaterials(data.data);
      } else {
        setMaterials(data);
      }
    });
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Bill Of Material (BOM)</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan Part No, Nama Produk, atau Material..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-4 py-2 rounded">
            + Tambah Produk
          </button>
        </div>
      </div>

      {/* Kontrol Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Tampilkan:</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
            className={`p-2 rounded-md ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="text-sm">
            Halaman {currentPage + 1} dari {totalPages || 1}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1 || totalPages === 0}
            className={`p-2 rounded-md ${currentPage === totalPages - 1 || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
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

      {/* Informasi jumlah data */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Menampilkan {(currentPage * itemsPerPage) + 1} - {Math.min((currentPage + 1) * itemsPerPage, totalItems)} dari {totalItems} entri
        </div>
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