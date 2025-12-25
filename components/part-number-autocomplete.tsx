"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

interface PartOption {
  id: number;
  part_no: string;
  nama_part: string;
  deskripsi: string;
  satuan: string;
  customer_id: number | null;
  nama_customer: string | null;
}

interface PartNumberAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPartSelect: (part: PartOption | null) => void;
  placeholder?: string;
}

export function PartNumberAutocomplete({
  value,
  onChange,
  onPartSelect,
  placeholder = "Cari part number..."
}: PartNumberAutocompleteProps) {
  const [options, setOptions] = useState<PartOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fungsi untuk mencari part berdasarkan input
  const searchParts = useCallback(async (search: string) => {
    if (search.trim() === '') {
      setOptions([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/master/parts?search=${encodeURIComponent(search)}&limit=20`)
      if (!response.ok) {
        throw new Error('Gagal mengambil data part')
      }
      const data = await response.json()
      setOptions(data.data || [])
    } catch (err) {
      console.error('Error searching parts:', err)
      setError('Gagal memuat daftar part')
      setOptions([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Efek untuk pencarian dengan delay (debounce)
  useEffect(() => {
    if (value.trim() === '') {
      setOptions([])
      setIsOpen(false)
      setSearchTerm("")
      return
    }

    setSearchTerm(value)

    const delayDebounceFn = setTimeout(() => {
      searchParts(value)
    }, 300) // Delay 300ms untuk mencegah panggilan API yang terlalu sering

    return () => clearTimeout(delayDebounceFn)
  }, [value, searchParts])

  // Fungsi untuk menangani klik di luar dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (part: PartOption) => {
    onChange(part.part_no)
    onPartSelect(part)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase()
    onChange(newValue)

    // Tampilkan dropdown jika input tidak kosong
    if (newValue.trim() !== '') {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  const handleInputFocus = () => {
    if (value.trim() !== '') {
      setIsOpen(true)
    }
  }

  const handleClipboardRead = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText()
        if (text && text.trim() !== '') {
          onChange(text.trim().toUpperCase())
        } else {
          alert('Tidak ada teks di clipboard. Silakan salin hasil scan terlebih dahulu.')
        }
      } else {
        alert('Browser Anda tidak mendukung pembacaan clipboard.')
      }
    } catch (err) {
      console.error('Error reading clipboard:', err)
      alert('Gagal membaca dari clipboard. Silakan pastikan izin akses diberikan.')
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleClipboardRead}
          className="shrink-0"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      {isOpen && (options.length > 0 || loading || error) && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-2 text-center text-gray-500">Mencari...</div>
          ) : error ? (
            <div className="p-2 text-center text-red-500">{error}</div>
          ) : options.length === 0 ? (
            <div className="p-2 text-center text-gray-500">Part tidak ditemukan</div>
          ) : (
            <ul>
              {options.map((part) => (
                <li
                  key={part.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelect(part)}
                >
                  <div className="font-medium">{part.part_no}</div>
                  <div className="text-sm text-gray-600">{part.nama_part}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}