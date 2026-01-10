export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="py-6 sm:py-10 px-4">
      <div className="max-w-6xl mx-auto w-full">
        {children}
      </div>
    </div>
  )
}