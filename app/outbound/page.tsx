"use client"

import { OutboundForm } from "@/components/outbound-form"

export default function OutboundPage() {
  const handleSuccess = () => {
    // Refresh bisa ditambahkan di sini jika diperlukan
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <OutboundForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
}