"use client"

import { InboundForm } from "@/components/inbound-form"
import { ScrollingText } from "@/components/ui/scrolling-text"

export default function InboundPage() {
  const handleSuccess = () => {
    // Refresh bisa ditambahkan di sini jika diperlukan
  }

  return (
    <div className="container mx-auto py-6 sm:py-10 px-4">
      <div className="max-w-2xl mx-auto w-full">
        <InboundForm onSuccess={handleSuccess} />
        <div className="mt-8">
          <ScrollingText text="PASTIKAN QTY YANG DI MASUKAN SESUAI!! " />
        </div>
      </div>
    </div>
  )
}