"use client"

import { OutboundForm } from "@/components/outbound-form"

export default function OutboundPage() {
  const handleSuccess = () => {
    // Refresh bisa ditambahkan di sini jika diperlukan
  }

  return (
    <div className="container mx-auto py-6 sm:py-10 px-4">
      <div className="max-w-2xl mx-auto w-full">
        <OutboundForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
}