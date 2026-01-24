"use client";
import React, { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';

export default function DetailedHistory() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let url = '/api/material-transactions/history';
    const params = new URLSearchParams();

    if (searchTerm) {
      params.append('search', searchTerm);
    }
    if (startDate) {
      params.append('start_date', startDate);
    }
    if (endDate) {
      params.append('end_date', endDate);
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
  }, [searchTerm, currentPage, itemsPerPage, startDate, endDate]);

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

  const openDetailModal = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <div className="p-4 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Detailed Stock Ledger</h1>
        <p className="text-sm text-gray-500">History pergerakan stok lengkap dengan saldo awal/akhir</p>
      </div>

      {/* Input Pencarian dan Filter Tanggal */}
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

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate || ""}
              onChange={(e) => {
                const value = e.target.value;
                setStartDate(value);
                // Jika tanggal mulai lebih besar dari tanggal akhir, reset tanggal akhir
                if (endDate && value && new Date(value) > new Date(endDate)) {
                  setEndDate(null);
                }
              }}
              className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">s.d</span>
            <input
              type="date"
              value={endDate || ""}
              onChange={(e) => {
                const value = e.target.value;
                // Hanya izinkan tanggal akhir yang sama atau setelah tanggal mulai
                if (!startDate || !value || new Date(value) >= new Date(startDate)) {
                  setEndDate(value);
                }
              }}
              min={startDate || undefined}
              className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
            }}
            className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Control Pagination dan Export */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => {
              let url = '/api/material-transactions/history/export';
              const params = new URLSearchParams();

              if (searchTerm) {
                params.append('search', searchTerm);
              }
              if (startDate) {
                params.append('start_date', startDate);
              }
              if (endDate) {
                params.append('end_date', endDate);
              }

              if (params.toString()) {
                url += '?' + params.toString();
              }

              window.open(url, '_blank');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Export CSV
          </button>

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
              <th className="p-3 border-r text-center">Customer</th>
              <th className="p-3 border-r">No. PO / Ref</th>
              <th className="p-3 border-r">Part No (OUT)</th>
              <th className="p-3 border-r text-center">Status</th>
              <th className="p-3 border-r">Material & Kategori</th>
              <th className="p-3 border-r text-center">Status Material</th>
              <th className="p-3 border-r text-right bg-blue-50">Trans (g/kg)</th>
              <th className="p-3 border-r text-right bg-gray-50">Awal (g/kg)</th>
              <th className="p-3 border-r text-right bg-green-50">Akhir (g/kg)</th>
              <th className="p-3 border-r">Waktu</th>
              <th className="p-3">Detail</th>
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

                  <td className="p-3 border-r text-center">
                    <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-[10px] font-bold">
                      {log.customer_name || '-'}
                    </span>
                  </td>

                  <td className="p-3 border-r font-bold text-blue-600">{log.po_number || '-'}</td>

                  {/* Kolom Part No hanya ditampilkan untuk transaksi OUT */}
                  <td className="p-3 border-r font-mono">
                    {log.type === 'OUT' ? log.part_no || 'N/A' : '-'}
                  </td>

                  <td className="p-3 border-r text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                      log.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.type}
                    </span>
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

                  {/* Gabungan Transaksi (Kg & Gram) */}
                  <td className="p-3 border-r text-right font-semibold text-blue-700 bg-blue-50/30">
                    <div>{Number(log.quantity).toFixed(Number(log.quantity) % 1 !== 0 ? 3 : 0).replace('.', ',')} kg</div>
                    <div className="text-sm">{transGram.toLocaleString('id-ID')} g</div>
                  </td>

                  {/* Gabungan Saldo Awal (Kg & Gram) */}
                  <td className="p-3 border-r text-right text-gray-500 bg-gray-50/30">
                    <div>{Number(log.stock_initial).toFixed(Number(log.stock_initial) % 1 !== 0 ? 3 : 0).replace('.', ',')} kg</div>
                    <div className="text-sm">{initialGram.toLocaleString('id-ID')} g</div>
                  </td>

                  {/* Gabungan Saldo Akhir (Kg & Gram) */}
                  <td className="p-3 border-r text-right font-bold text-emerald-700 bg-green-50/30">
                    <div>{Number(log.stock_final).toFixed(Number(log.stock_final) % 1 !== 0 ? 3 : 0).replace('.', ',')} kg</div>
                    <div className="text-sm">{finalGram.toLocaleString('id-ID')} g</div>
                  </td>

                  <td className="p-3 border-r whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => openDetailModal(log)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Detail */}
      {isModalOpen && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Detail Transaksi</h2>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informasi Umum */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-700 border-b pb-2">Informasi Umum</h3>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">ID Transaksi:</span>
                    <span className="font-medium">{selectedTransaction.id}</span>
                  </div>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Tanggal:</span>
                    <span className="font-medium">{new Date(selectedTransaction.created_at).toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                      selectedTransaction.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedTransaction.type}
                    </span>
                  </div>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">No. PO / Ref:</span>
                    <span className="font-medium">{selectedTransaction.po_number || '-'}</span>
                  </div>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{selectedTransaction.customer_name || '-'}</span>
                  </div>
                </div>

                {/* Informasi Material */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-700 border-b pb-2">Informasi Material</h3>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Part No:</span>
                    <span className="font-medium">{selectedTransaction.type === 'OUT' ? selectedTransaction.part_no || 'N/A' : '-'}</span>
                  </div>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Nama Part:</span>
                    <span className="font-medium">{selectedTransaction.type === 'OUT' ? selectedTransaction.product_name || 'Production' : 'Inbound Material'}</span>
                  </div>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Warna:</span>
                    <span className="font-medium">{selectedTransaction.type === 'OUT' ? selectedTransaction.product_color || '-' : '-'}</span>
                  </div>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Material:</span>
                    <span className="font-medium">{selectedTransaction.material_name}</span>
                  </div>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Kategori:</span>
                    <span className="font-medium">{selectedTransaction.category_name || '-'}</span>
                  </div>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Status Material:</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                      selectedTransaction.material_status === 'ORI'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {selectedTransaction.material_status}
                    </span>
                  </div>
                </div>

                {/* Informasi Stok */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-700 border-b pb-2">Informasi Stok</h3>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Qty (Pcs):</span>
                    <span className="font-medium">{selectedTransaction.qty_pcs || '-'}</span>
                  </div>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Transaksi (Kg):</span>
                    <span className="font-medium">{Number(selectedTransaction.quantity).toFixed(Number(selectedTransaction.quantity) % 1 !== 0 ? 3 : 0).replace('.', ',')} kg</span>
                  </div>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Transaksi (Gram):</span>
                    <span className="font-medium">{(Number(selectedTransaction.quantity) * 1000).toLocaleString('id-ID')} g</span>
                  </div>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Saldo Awal (Kg):</span>
                    <span className="font-medium">{Number(selectedTransaction.stock_initial).toFixed(Number(selectedTransaction.stock_initial) % 1 !== 0 ? 3 : 0).replace('.', ',')} kg</span>
                  </div>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Saldo Awal (Gram):</span>
                    <span className="font-medium">{(Number(selectedTransaction.stock_initial) * 1000).toLocaleString('id-ID')} g</span>
                  </div>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Saldo Akhir (Kg):</span>
                    <span className="font-medium">{Number(selectedTransaction.stock_final).toFixed(Number(selectedTransaction.stock_final) % 1 !== 0 ? 3 : 0).replace('.', ',')} kg</span>
                  </div>

                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Saldo Akhir (Gram):</span>
                    <span className="font-medium">{(Number(selectedTransaction.stock_final) * 1000).toLocaleString('id-ID')} g</span>
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-700 border-b pb-2">Deskripsi</h3>

                  <div className="border-b pb-1">
                    <span className="text-gray-600">Keterangan:</span>
                    <p className="font-medium mt-1 p-2 bg-gray-50 rounded-lg">{selectedTransaction.description || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t text-right">
              <button
                onClick={closeDetailModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

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