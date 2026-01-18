"use client";

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import AddMaterialModal from '@/components/material/AddMaterialModal';

export default function MaterialInventory() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchMaterials = async () => {
    try {
      let url = '/api/material';
      const params = new URLSearchParams();

      if (searchTerm) {
        params.append('search', encodeURIComponent(searchTerm));
      }
      params.append('limit', itemsPerPage.toString());
      params.append('offset', (currentPage * itemsPerPage).toString());

      url += '?' + params.toString();

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const result = await res.json();

      // Jika API mengembalikan format dengan data dan total
      if (result.data && typeof result.total !== 'undefined') {
        setMaterials(result.data);
        setTotalItems(result.total);
      } else {
        // Jika API masih mengembalikan array langsung
        setMaterials(result);
        setTotalItems(Array.isArray(result) ? result.length : 0);
      }
    } catch (err) {
      console.error("Gagal load material:", err);
    } finally {
      setLoading(false);
    }
  };

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
    fetchMaterials();
  }, [searchTerm, currentPage, itemsPerPage]);

  if (loading) return <div className="p-10 text-center italic text-gray-500">Memuat data inventory...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 uppercase">Material Inventory</h1>
          <p className="text-sm text-gray-500">Stok biji plastik dan lokasi penyimpanan</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan Nama Material atau Kategori..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-emerald-700 transition"
          >
            + Tambah Material
          </button>
        </div>
      </div>

      {/* Kontrol Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-[11px] font-black uppercase">
            <tr>
              <th className="p-4 border-r">Grade Material</th>
              <th className="p-4 border-r">Jenis</th>
              <th className="p-4 border-r text-center">Lokasi</th>
              <th className="p-4 text-right bg-blue-50/30">ORI (kg)</th>
              <th className="p-4 text-right bg-orange-50/30">SCRAP (kg)</th>
              <th className="p-4 text-right bg-gray-50">TOTAL (kg)</th>

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
                  <td className="p-4 text-right font-mono text-blue-700">
                    {Number(m.stock_ori_kg).toFixed(3)} kg
                  </td>

                  <td className="p-4 text-right font-mono text-orange-700">
                    {Number(m.stock_scrap_kg).toFixed(3)} kg
                  </td>

                  <td className="p-4 text-right font-mono font-bold text-gray-800">
                    {(Number(m.stock_ori_kg) + Number(m.stock_scrap_kg)).toFixed(3)} kg
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Informasi jumlah data */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Menampilkan {(currentPage * itemsPerPage) + 1} - {Math.min((currentPage + 1) * itemsPerPage, totalItems)} dari {totalItems} entri
        </div>
      </div>

      <AddMaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchMaterials}
      />
    </div>
  );
}