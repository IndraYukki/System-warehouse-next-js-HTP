"use client";
import React, { useState, useEffect } from "react";


export default function MaterialSimulation() {
  const [boms, setBoms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBom, setSelectedBom] = useState<any>(null);

  // === SIMULATION INPUT STATE ===
  const [mode, setMode] = useState<"QTY" | "KG">("QTY");
  const [qty, setQty] = useState(0);
  const [availableKg, setAvailableKg] = useState(0);
  const [oriPercent, setOriPercent] = useState(100);
  const [cutLossPercent, setCutLossPercent] = useState(3);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");



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



useEffect(() => {
  if (mode === "QTY") {
    setAvailableKg(0);
  }

  if (mode === "KG") {
    setQty(0);
  }
}, [mode]);

  // === SIMULATION CALCULATION ===
let baseKg = 0;
let totalKg = 0;
let oriKg = 0;
let scrapKg = 0;
let estimatedQty = 0;

if (selectedBom) {
  const weightPerPcs =
    Number(selectedBom.weight_part) +
    Number(selectedBom.weight_runner) / Number(selectedBom.cavity);

  // MODE QTY → sama dengan produksi
  if (mode === "QTY" && qty > 0) {
    baseKg = (weightPerPcs * qty) / 1000;
    totalKg = baseKg * (1 + cutLossPercent / 100);
    estimatedQty = qty;
  }

  // MODE KG → inverse rumus
  if (mode === "KG" && availableKg > 0) {
    totalKg = availableKg;
    baseKg = totalKg / (1 + cutLossPercent / 100);
    estimatedQty = (baseKg * 1000) / weightPerPcs;
  }

  oriKg = totalKg * (oriPercent / 100);
  scrapKg = totalKg * ((100 - oriPercent) / 100);
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
          <h1 className="text-2xl font-bold">SIMULATION</h1>
          <p className="text-blue-100 italic text-sm">
            🧪 Simulation Only – does not affect stock
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

           

            <div className="grid grid-cols-2 gap-4">
              {mode === "QTY" ? (
                <div>
                    <label className="block text-sm font-bold mb-2">
                    Qty Produksi (pcs)
                    </label>
                    <input
                    type="number"
                    className="w-full p-3 border-2 rounded-xl"
                    value={qty || ""}
                    onChange={e => setQty(Number(e.target.value))}
                    />
                </div>
                ) : (
                <div>
                    <label className="block text-sm font-bold mb-2">
                    Available Material (Kg)
                    </label>
                    <input
                    type="number"
                    className="w-full p-3 border-2 rounded-xl"
                    value={availableKg || ""}
                    onChange={e => setAvailableKg(Number(e.target.value))}
                    />
                </div>
                )}


              <div className="grid grid-cols-2 gap-4">
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
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">
                        Cut Loss (%)
                        </label>
                        <input
                        type="number"
                        min={0}
                        max={100}
                        value={cutLossPercent}
                        onChange={e => setCutLossPercent(Number(e.target.value))}
                        className="w-full p-3 border-2 rounded-xl"
                        />
                    </div>
                    </div>


            </div>

            <button
                disabled
                className="w-full py-4 bg-gray-400 text-white font-bold rounded-2xl cursor-not-allowed"
                >
                Simulasi Saja (Tidak Bisa Submit)
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
                    <div>{selectedBom.stock_ori_kg} Kg</div>
                    </div>

                    <div className="bg-orange-100 p-3 rounded-lg">
                    <div className="font-bold text-orange-700">Stock SCRAP</div>
                    <div>{selectedBom.stock_scrap_kg} Kg</div>
                    </div>
                </div>

                <hr />

                {/* KALKULASI */}
                <div className="space-y-2">

                    {mode === "KG" && (
                    <div className="flex justify-between text-lg font-black text-blue-700">
                        <span>Estimated Qty</span>
                        <span>{Math.floor(estimatedQty)} Pcs</span>
                    </div>
                    )}

                    {mode === "QTY" && (
                    <div className="flex justify-between text-lg font-black text-blue-700">
                        <span>Qty Produksi</span>
                        <span>{estimatedQty} Pcs</span>
                    </div>
                    )}

                    <hr />

                    <div className="flex justify-between">
                    <span>ORI</span>
                    <span className="font-bold text-emerald-600">
                        {oriKg.toFixed(3)} Kg
                    </span>
                    </div>

                    <div className="flex justify-between">
                    <span>SCRAP</span>
                    <span className="font-bold text-orange-600">
                        {scrapKg.toFixed(3)} Kg
                    </span>
                    </div>

                    <hr />

                    <div className="flex justify-between text-lg font-black">
                    <span>TOTAL</span>
                    <span>{totalKg.toFixed(3)} Kg</span>
                    </div>

                    <p className="text-xs text-gray-400 italic text-center">
                    Termasuk cut loss {cutLossPercent}%
                    </p>
                </div>

                </div>
            ) : (
                <p className="text-center text-gray-400 italic">
                Pilih Part No terlebih dahulu
                </p>
            )}
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border space-y-2">
                <div className="text-sm font-bold">Mode Perhitungan</div>

                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        checked={mode === "QTY"}
                        onChange={() => setMode("QTY")}
                    />
                    Berdasarkan Qty (pcs)
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        checked={mode === "KG"}
                        onChange={() => setMode("KG")}
                    />
                    Berdasarkan Kg
                    </label>
                </div>
                </div>


        </form>
      </div>
    </div>
  );
}
