"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export default function MasterBOM() {
  const [bomData, setBomData] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null as number | null,
    part_no: "",
    product_name: "",
    product_category: "",
    product_color: "",
    material_id: "",
    weight_part: 0,
    weight_runner: 0,
    cavity: 1
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMaterialTerm, setSearchMaterialTerm] = useState("");
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  // Update filteredMaterials ketika materials berubah
  useEffect(() => {
    setFilteredMaterials(materials);
  }, [materials]);

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
        setFilteredMaterials(data.data);
      } else {
        setMaterials(data);
        setFilteredMaterials(data);
      }
    });
  };

  // Fungsi untuk menangani pencarian material
  const handleMaterialSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchMaterialTerm(term);

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
    setSearchMaterialTerm(`${material.material_name} (${material.category_name})`);
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

  const openEditModal = (bomItem: any) => {
    // Ambil nama material berdasarkan ID
    const material = materials.find((m: any) => m.id === bomItem.material_id);
    setEditFormData({
      id: bomItem.id,
      part_no: bomItem.part_no,
      product_name: bomItem.product_name,
      product_category: bomItem.product_category,
      product_color: bomItem.product_color || '',
      material_id: bomItem.material_id,
      weight_part: bomItem.weight_part,
      weight_runner: bomItem.weight_runner,
      cavity: bomItem.cavity
    });
    // Update searchMaterialTerm to show the selected material
    if (material) {
      setSearchMaterialTerm(`${material.material_name} (${material.category_name})`);
    } else {
      setSearchMaterialTerm('');
    }
    setIsEditModalOpen(true);
  };

  const updateBom = async (e: React.FormEvent) => {
    e.preventDefault();

    // Log data yang akan dikirim
    console.log("Updating BOM with data:", {
      id: editFormData.id,
      part_no: editFormData.part_no,
      product_name: editFormData.product_name,
      product_category: editFormData.product_category,
      product_color: editFormData.product_color,
      material_id: editFormData.material_id,
      weight_part: editFormData.weight_part,
      weight_runner: editFormData.weight_runner,
      cavity: editFormData.cavity
    });

    try {
      const response = await fetch(`/api/material-bom/${editFormData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          part_no: editFormData.part_no, // Tetap kirim untuk keperluan logging/internal, tapi tidak digunakan di server
          product_name: editFormData.product_name,
          product_category: editFormData.product_category,
          product_color: editFormData.product_color,
          material_id: editFormData.material_id,
          weight_part: editFormData.weight_part,
          weight_runner: editFormData.weight_runner,
          cavity: editFormData.cavity
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`BOM untuk ${editFormData.product_name} (${editFormData.part_no}) berhasil diperbarui!`);
        setIsEditModalOpen(false);
        fetchData(); // Refresh data
      } else {
        let errorMessage = 'Unknown error';

        try {
          // Clone response to read body twice if needed
          const responseClone = response.clone();
          const errorData = await responseClone.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        // Special handling for 400 error (validation error)
        if (response.status === 400) {
          alert(`Tidak dapat memperbarui BOM ${editFormData.product_name}: ${errorMessage}`);
        } else {
          alert(`Gagal memperbarui BOM untuk ${editFormData.product_name}: ${errorMessage}`);
        }
      }
    } catch (error) {
      alert(`Gagal memperbarui BOM untuk ${editFormData.product_name}: ${(error as Error).message}`);
    }
  };

  const deleteBom = async (id: number, productName: string, partNo: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus BOM "${productName}" (${partNo})?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/material-bom/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        alert(`BOM ${productName} (${partNo}) berhasil dihapus!`);
        fetchData(); // Refresh data
      } else {
        // Clone response to read body twice if needed
        const responseClone = response.clone();
        let errorMessage = 'Unknown error';

        try {
          const errorData = await responseClone.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        // Special handling for 400 error (constraint violation)
        if (response.status === 400) {
          alert(`Tidak dapat menghapus BOM ${productName}: ${errorMessage}`);
        } else {
          alert(`Gagal menghapus BOM ${productName}: ${errorMessage}`);
        }
      }
    } catch (error) {
      alert(`Gagal menghapus BOM ${productName}: ${(error as Error).message}`);
    }
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
      setSearchMaterialTerm(""); // Reset juga search term
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

      {/* Kontrol Pagination dan Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              // Buka URL export tanpa parameter pencarian atau pagination
              const url = '/api/material-bom/export';
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
              <th className="p-3">Part No</th>
              <th className="p-3">Nama Produk</th>
              <th className="p-3">Warna</th>
              <th className="p-3">Material</th>
              <th className="p-3 text-center">Part(g)</th>
              <th className="p-3 text-center">Runner(g)</th>
              <th className="p-3 text-center">Cav</th>
              <th className="p-3 text-center">Aksi</th>
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
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      onClick={() => openEditModal(item)}
                    >
                      Edit
                    </button>
                    <button 
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      onClick={() => deleteBom(item.id, item.product_name, item.part_no)}
                    >
                      Hapus
                    </button>
                  </div>
                </td>
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

            <div className="relative">
              <input
                type="text"
                className="w-full border p-2 rounded bg-yellow-50"
                placeholder="-- Pilih Jenis Biji Plastik --"
                value={searchMaterialTerm}
                onChange={handleMaterialSearch}
                onFocus={() => {
                  if (searchMaterialTerm) setShowSuggestions(true);
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

      {/* Modal Edit BOM */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={updateBom} className="bg-white p-6 rounded-lg w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold border-b pb-2">Edit Resep Produk</h2>

            {/* Input Part No & Warna (Baru) */}
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Part Number (Unik)" className="border p-2 rounded bg-gray-100" readOnly
                value={editFormData.part_no} />
              <input placeholder="Warna Produk" className="border p-2 rounded"
                value={editFormData.product_color}
                onChange={e => setEditFormData({...editFormData, product_color: e.target.value})} />
            </div>

            <input placeholder="Nama Produk" className="w-full border p-2 rounded" required
              value={editFormData.product_name || ''}
              onChange={e => setEditFormData({...editFormData, product_name: e.target.value})} />

            <input placeholder="Kategori (Otomotif/Elektronik)" className="w-full border p-2 rounded"
              value={editFormData.product_category || ''}
              onChange={e => setEditFormData({...editFormData, product_category: e.target.value})} />

            <div className="relative">
              <input
                type="text"
                className="w-full border p-2 rounded bg-yellow-50"
                placeholder="-- Pilih Jenis Biji Plastik --"
                value={searchMaterialTerm || ''}
                onChange={handleMaterialSearch}
                onFocus={() => {
                  if (searchMaterialTerm) setShowSuggestions(true);
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
                        onClick={() => {
                          setEditFormData({...editFormData, material_id: m.id});
                          setSearchMaterialTerm(`${m.material_name} (${m.category_name})`);
                          setShowSuggestions(false);
                        }}
                      >
                        <div className="font-bold">{m.material_name}</div>
                        <div className="text-sm text-gray-500">{m.category_name}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500">Material tidak ditemukan</div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded">
              <div>
                <label className="text-[10px] font-bold">Part (gr)</label>
                <input type="number" placeholder="0.00" className="w-full border p-1 rounded" step="0.01" required
                  value={editFormData.weight_part}
                  onChange={e => setEditFormData({...editFormData, weight_part: parseFloat(e.target.value) || 0})}/>
              </div>
              <div>
                <label className="text-[10px] font-bold">Runner (gr)</label>
                <input type="number" placeholder="0.00" className="w-full border p-1 rounded" step="0.01" required
                  value={editFormData.weight_runner}
                  onChange={e => setEditFormData({...editFormData, weight_runner: parseFloat(e.target.value) || 0})}/>
              </div>
              <div>
                <label className="text-[10px] font-bold">Cavity</label>
                <input type="number" placeholder="1" className="w-full border p-1 rounded" required
                  value={editFormData.cavity}
                  onChange={e => setEditFormData({...editFormData, cavity: parseInt(e.target.value) || 1})}/>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-gray-400 px-4">Batal</button>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold shadow-md">Update BOM</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}