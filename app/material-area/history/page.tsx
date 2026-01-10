"use client";
import React, { useState, useEffect } from 'react';

export default function DetailedHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
  fetch('/api/material-transactions/history') // Pastikan slash-nya benar
    .then(res => {
      if (!res.ok) throw new Error("Halaman API tidak ditemukan (404)");
      return res.json();
    })
    .then(data => setHistory(data))
    .catch(err => console.error("Fetch error:", err));
}, []);

  return (
    <div className="p-4 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Detailed Stock Ledger</h1>
        <p className="text-sm text-gray-500">History pergerakan stok lengkap dengan saldo awal/akhir</p>
      </div>

      {/* Container Scroll Horizontal agar tabel lebar tidak berantakan */}
      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-[11px] text-left border-collapse min-w-[1200px]">
          <thead className="bg-gray-100 text-gray-600 font-bold uppercase border-b">
            <tr>
              <th className="p-3 border-r">Waktu</th>
              <th className="p-3 border-r">No. PO / Ref</th>
              <th className="p-3 border-r">Part No</th>
              <th className="p-3 border-r">Nama Part & Warna</th>
              <th className="p-3 border-r">Material</th>
              <th className="p-3 border-r text-center">Status</th>
              <th className="p-3 border-r text-center">Qty (Pcs)</th>
              <th className="p-3 border-r text-right bg-blue-50">Trans (Gram)</th>
              <th className="p-3 border-r text-right bg-blue-50">Trans (Kg)</th>
              <th className="p-3 border-r text-right bg-gray-50">Awal (Gram)</th>
              <th className="p-3 border-r text-right bg-green-50">Akhir (Gram)</th>
              <th className="p-3 text-right bg-green-50">Akhir (Kg)</th>
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
                  <td className="p-3 border-r whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 border-r font-bold text-blue-600">{log.po_number || '-'}</td>
                  <td className="p-3 border-r font-mono">{log.part_no || 'N/A'}</td>
                  <td className="p-3 border-r">
                    <div className="font-bold">{log.product_name || 'Inbound Material'}</div>
                    <div className="text-gray-400 italic">{log.product_color || '-'}</div>
                  </td>
                  <td className="p-3 border-r">{log.material_name}</td>
                  <td className="p-3 border-r text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                      log.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="p-3 border-r text-center font-bold">{log.qty_pcs || '-'}</td>
                  
                  {/* Gramasi & Kg Transaksi */}
                  <td className="p-3 border-r text-right font-semibold text-blue-700 bg-blue-50/30">
                    {transGram.toLocaleString('id-ID')} g
                  </td>
                  <td className="p-3 border-r text-right font-semibold text-blue-700 bg-blue-50/30">
                    {Number(log.quantity).toFixed(3)}
                  </td>

                  {/* Saldo Awal */}
                  <td className="p-3 border-r text-right text-gray-500 bg-gray-50/30">
                    {initialGram.toLocaleString('id-ID')} g
                  </td>

                  {/* Saldo Akhir Gram & Kg */}
                  <td className="p-3 border-r text-right font-bold text-emerald-700 bg-green-50/30">
                    {finalGram.toLocaleString('id-ID')} g
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-700 bg-green-50/30">
                    {Number(log.stock_final).toFixed(3)} Kg
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-[10px] text-yellow-800">
        <strong>Catatan:</strong> Data "Awal" dan "Akhir" dikonversi dari basis data Kilogram ke Gram ($1\ Kg = 1000\ Gram$) untuk ketelitian laporan audit.
      </div>
    </div>
  );
}