"use client";
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function DetailedHistory() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    let url = '/api/material-transactions/history';
    const params = new URLSearchParams();

    if (searchTerm) {
      params.append('search', searchTerm);
    }
    params.append('limit', itemsPerPage.toString());
    params.append('offset', (currentPage * itemsPerPage).toString());

    url += '?' + params.toString();

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Halaman API tidak ditemukan (404)");
        return res.json();
      })
      .then(data => {
        // Asumsikan API mengembalikan objek dengan properti data dan total
        if (data.data && typeof data.total !== 'undefined') {
          setHistory(data.data);
          setTotalItems(data.total);
        } else {
          // Jika API masih mengembalikan array langsung (sebelum update), gunakan data sebelumnya
          setHistory(data);
          // Untuk sementara, kita set totalItems sama dengan panjang array jika tidak ada info total
          setTotalItems(Array.isArray(data) ? data.length : 0);
        }
      })
      .catch(err => console.error("Fetch error:", err));
  }, [searchTerm, currentPage, itemsPerPage]);

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

  return (
    <div className="p-4 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Detailed Stock Ledger</h1>
        <p className="text-sm text-gray-500">History pergerakan stok lengkap dengan saldo awal/akhir</p>
      </div>

      {/* Input Pencarian dan Control Pagination */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan Part No, Nama Part, atau Material..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
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
      </div>

      {/* Container Scroll Horizontal agar tabel lebar tidak berantakan */}
      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-[11px] text-left border-collapse min-w-[1200px]">
          <thead className="bg-gray-100 text-gray-600 font-bold uppercase border-b">
            <tr>
              <th className="p-3 border-r">No. PO / Ref</th>
              <th className="p-3 border-r text-center">Status</th>
              <th className="p-3 border-r">Part No (OUT)</th>
              <th className="p-3 border-r">Nama Part & Warna (OUT)</th>
              <th className="p-3 border-r">Material & Kategori</th>
              <th className="p-3 border-r text-center">Status Material</th>
              <th className="p-3 border-r text-center">Qty (Pcs)</th>
              <th className="p-3 border-r text-right bg-blue-50">Trans (g/kg)</th>
              <th className="p-3 border-r text-right bg-gray-50">Awal (g/kg)</th>
              <th className="p-3 border-r text-right bg-green-50">Akhir (g/kg)</th>
              <th className="p-3 border-r">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {history.map((log: any) => {
              // Logika Konversi ke Gram untuk Display
              const transGram = Number(log.quantity) * 1000;
              const initialGram = Number(log.stock_initial) * 1000;
              const finalGram = Number(log.stock_final) * 1000;

              return (
                <tr key={log.id} className="hover:bg-gray-50 transition">

                  <td className="p-3 border-r font-bold text-blue-600">{log.po_number || '-'}</td>

                  <td className="p-3 border-r text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                      log.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  {/* Kolom Part No hanya ditampilkan untuk transaksi OUT */}
                  <td className="p-3 border-r font-mono">
                    {log.type === 'OUT' ? log.part_no || 'N/A' : '-'}
                  </td>

                  {/* Kolom Nama Part & Warna hanya ditampilkan untuk transaksi OUT */}
                  <td className="p-3 border-r">
                    {log.type === 'OUT' ? (
                      <>
                        <div className="font-bold">{log.product_name || 'Production'}</div>
                        <div className="text-gray-400 italic">{log.product_color || '-'}</div>
                      </>
                    ) : (
                      <div className="font-bold text-gray-500 italic">Inbound Material</div>
                    )}
                  </td>
                  <td className="p-3 border-r">
                    <div className="font-bold">{log.material_name}</div>
                    <div className="text-gray-400 italic">{log.category_name || '-'}</div>
                  </td>
                  <td className="p-3 border-r text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black ${
                        log.material_status === 'ORI'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {log.material_status}
                    </span>
                  </td>

                  <td className="p-3 border-r text-center font-bold">{log.qty_pcs || '-'}</td>

                  {/* Gabungan Transaksi (Gram & Kg) */}
                  <td className="p-3 border-r text-right font-semibold text-blue-700 bg-blue-50/30">
                    <div>{transGram.toLocaleString('id-ID')} g</div>
                    <div className="text-sm">{Number(log.quantity).toFixed(3)} kg</div>
                  </td>

                  {/* Gabungan Saldo Awal (Gram & Kg) */}
                  <td className="p-3 border-r text-right text-gray-500 bg-gray-50/30">
                    <div>{initialGram.toLocaleString('id-ID')} g</div>
                    <div className="text-sm">{Number(log.stock_initial).toFixed(3)} kg</div>
                  </td>

                  {/* Gabungan Saldo Akhir (Gram & Kg) */}
                  <td className="p-3 border-r text-right font-bold text-emerald-700 bg-green-50/30">
                    <div>{finalGram.toLocaleString('id-ID')} g</div>
                    <div className="text-sm">{Number(log.stock_final).toFixed(3)} kg</div>
                  </td>
                  <td className="p-3 border-r whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Informasi jumlah data */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Menampilkan {(currentPage * itemsPerPage) + 1} - {Math.min((currentPage + 1) * itemsPerPage, totalItems)} dari {totalItems} entri
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-[10px] text-yellow-800">
          <strong>Catatan:</strong> Data "Awal" dan "Akhir" dikonversi dari basis data Kilogram ke Gram ($1\ Kg = 1000\ Gram$) untuk ketelitian laporan audit.
        </div>
      </div>
    </div>
  );
}