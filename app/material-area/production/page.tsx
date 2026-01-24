"use client";
import React, { useState, useEffect } from "react";

export default function ProductionOutbound() {
  const [boms, setBoms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBom, setSelectedBom] = useState<any>(null);
  const [qty, setQty] = useState(0);
  const [poNumber, setPoNumber] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  // === FIXED RULES ===
  const CUT_LOSS_PERCENT = 3;
  const [oriPercent, setOriPercent] = useState(100);

  // State untuk menyimpan hasil pencarian part no
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Ambil semua BOM saat komponen dimuat (untuk kebutuhan lain jika diperlukan)
  useEffect(() => {
    fetch("/api/material-bom")
      .then(res => res.json())
      .then(data => {
        // Jika API mengembalikan format dengan data dan total (pagination), gunakan data.data
        // Jika API mengembalikan array langsung, gunakan data langsung
        if (data.data && Array.isArray(data.data)) {
          setBoms(data.data);
        } else {
          setBoms(data);
        }
      });
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedBom(null);
    setShowSuggestions(true);

    // Tampilkan pesan validasi secara otomatis
    if (value.trim() === "") {
      setValidationMessage("");
      setSearchResults([]);
    } else {
      try {
        // Lakukan pencarian langsung ke server
        const response = await fetch(`/api/material-bom?search=${encodeURIComponent(value)}`);
        const data = await response.json();

        // Handle both paginated and non-paginated responses
        const bomData = data.data && Array.isArray(data.data) ? data.data : data;
        setSearchResults(bomData);

        // Cek apakah part no yang diketik persis cocok dengan hasil pencarian
        const foundBom = bomData.find((bom: any) =>
          bom.part_no.toLowerCase() === value.toLowerCase()
        );

        if (!foundBom) {
          setValidationMessage("masukan part no yang benar!");
        } else {
          setValidationMessage(foundBom.product_name);
        }
      } catch (error) {
        console.error("Error fetching BOM data:", error);
        setSearchResults([]);
        setValidationMessage("masukan part no yang benar!");
      }
    }
  };

  const selectProduct = (item: any) => {
    setSearchTerm(item.part_no);
    setSelectedBom(item);
    setShowSuggestions(false);
    // Set validasi pesan ketika part no dipilih
    setValidationMessage(item.product_name);
  };

  // === KALKULASI ===
  let baseKg = 0;
  let totalKg = 0;
  let scrapPercent = 100 - oriPercent;
  let oriKg = 0;
  let scrapKg = 0;

  if (selectedBom && qty > 0) {
    const weightPerPcs =
      Number(selectedBom.weight_part) +
      Number(selectedBom.weight_runner) / Number(selectedBom.cavity);

    baseKg = (weightPerPcs * qty) / 1000;
    totalKg = baseKg * (1 + CUT_LOSS_PERCENT / 100);
    oriKg = totalKg * (oriPercent / 100);
    scrapKg = totalKg * (scrapPercent / 100);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBom) return;

    // Validasi tambahan jika part no tidak valid
    if (validationMessage === "masukan part no yang benar!") {
      alert("Silakan masukkan part no yang benar sebelum melanjutkan.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/material-production", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bom_id: selectedBom.id,
        qty_produced: qty,
        ori_percent: oriPercent,
        po_number: poNumber
      })
    });

    if (res.ok) {
      alert("Transaksi produksi berhasil!");
      window.location.reload();
    } else {
      alert("Terjadi kesalahan.");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Production Outbound</h1>
          <p className="text-blue-100 italic text-sm">
            Pemakaian material produksi (ORI / SCRAP)
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* LEFT */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">
                Nama Part
              </label>
              <input
                type="text"
                className="w-full p-3 border-2 rounded-xl bg-gray-100"
                value={validationMessage || "-"}
                readOnly
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-bold mb-2">Part No</label>
              <input
                type="text"
                className="w-full p-3 border-2 rounded-xl"
                value={searchTerm}
                onChange={handleSearch}
                required
              />
              {showSuggestions && searchTerm && !selectedBom && (
                <div className="absolute z-10 w-full bg-white border rounded-xl mt-1 shadow">
                  {searchResults.length > 0 ? (
                    searchResults.map(item => (
                      <div
                        key={item.id}
                        className="p-3 hover:bg-blue-50 cursor-pointer"
                        onClick={() => selectProduct(item)}
                      >
                        <b>{item.part_no}</b>
                        <div className="text-xs text-gray-500">
                          {item.product_name}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500">Part No tidak ditemukan</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                No Produksi / PO
              </label>
              <input
                type="text"
                className="w-full p-3 border-2 rounded-xl"
                value={poNumber}
                onChange={e => setPoNumber(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Qty Produksi (pcs)
                </label>
                <input
                  type="number"
                  className="w-full p-3 border-2 rounded-xl"
                  onChange={e => setQty(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  ORI (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={oriPercent}
                  onChange={e => setOriPercent(Number(e.target.value))}
                  className="w-full p-3 border-2 rounded-xl"
                  required
                />
              </div>
            </div>

            <button
              disabled={
                !selectedBom ||
                loading ||
                oriPercent < 0 ||
                oriPercent > 100
              }
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl"
            >
              {loading ? "Memproses..." : "Konfirmasi Produksi"}
            </button>
          </div>

          {/* RIGHT */}
            <div className="bg-gray-50 rounded-2xl p-6 border">
              <h2 className="font-bold mb-4 text-center">
                Kalkulasi Material
              </h2>

              {selectedBom ? (
                <div className="space-y-4 text-sm">

                  {/* INFO MATERIAL */}
                  <div className="border rounded-lg p-3 bg-white">
                    <div className="font-bold">Material</div>
                    <div>{selectedBom.material_name}</div>
                    <div className="text-xs text-gray-500">
                      {selectedBom.category_name}
                    </div>
                  </div>

                  {/* STOCK */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-100 p-3 rounded-lg">
                      <div className="font-bold text-emerald-700">Stock ORI</div>
                      <div>{Number(selectedBom.stock_ori_kg).toFixed(Number(selectedBom.stock_ori_kg) % 1 !== 0 ? 3 : 0).replace('.', ',')} kg</div>
                    </div>

                    <div className="bg-orange-100 p-3 rounded-lg">
                      <div className="font-bold text-orange-700">Stock SCRAP</div>
                      <div>{Number(selectedBom.stock_scrap_kg).toFixed(Number(selectedBom.stock_scrap_kg) % 1 !== 0 ? 3 : 0).replace('.', ',')} kg</div>
                    </div>
                  </div>

                  <hr />

                  {/* KALKULASI */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>ORI</span>
                      <span className="font-bold text-emerald-600">
                        {Number(oriKg).toFixed(Number(oriKg) % 1 !== 0 ? 3 : 0).replace('.', ',')} kg
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>SCRAP</span>
                      <span className="font-bold text-orange-600">
                        {Number(scrapKg).toFixed(Number(scrapKg) % 1 !== 0 ? 3 : 0).replace('.', ',')} kg
                      </span>
                    </div>

                    <hr />

                    <div className="flex justify-between text-lg font-black">
                      <span>TOTAL</span>
                      <span>{Number(totalKg).toFixed(Number(totalKg) % 1 !== 0 ? 3 : 0).replace('.', ',')} kg</span>
                    </div>

                    <p className="text-xs text-gray-400 italic text-center">
                      Termasuk cut loss 3%
                    </p>
                  </div>

                </div>
              ) : (
                <p className="text-center text-gray-400 italic">
                  Pilih Part No terlebih dahulu
                </p>
              )}
            </div>

        </form>
      </div>
    </div>
  );
}
