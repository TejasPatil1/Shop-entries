"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MilkRecordForm } from "@/components/milk-record-form"
import { getCurrentDateString, saveDayData } from "@/lib/storage"
import { formatDate } from "@/lib/date-utils"
import { ChevronLeft, Save, X } from "lucide-react"

const MILK_PRODUCTS = [
  { id: 1, name: "Amul Gold (500ml)", type: "Amul Gold" },
  { id: 2, name: "TIP TOP (500ml)", type: "TIP TOP 500ml" },
  { id: 3, name: "Taza (150ml)", type: "Taza" },
  { id: 4, name: "TIP TOP (150ml)", type: "TIP TOP 150ml" },
  { id: 5, name: "Chhas (500ml)", type: "Chhas" },
]

export function AddRecord({ onBack }: { onBack: () => void }) {
  const selectedDate = getCurrentDateString()
  const [records, setRecords] = useState<Record<string, { quantity: number; rate: number }>>(
    MILK_PRODUCTS.reduce(
      (acc, product) => {
        acc[product.type] = { quantity: 0, rate: 0 }
        return acc
      },
      {} as Record<string, { quantity: number; rate: number }>,
    ),
  )
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    // Convert records to milk record format
    const recordsArray = MILK_PRODUCTS.filter((product) => records[product.type].quantity > 0).map((product) => {
      const r = records[product.type]
      return {
        id: product.id.toString(),
        type: product.type,
        quantity: r.quantity,
        rate: r.rate,
        total: r.quantity * r.rate,
      }
    })

    // Save to storage
    setLoading(true)
    await saveDayData(selectedDate, recordsArray)
    setLoading(false)

    // Redirect back
    onBack()
  }

  const hasAnyRecord = Object.values(records).some((r) => r.quantity > 0)

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 pb-24">
      {/* Header */}
      <div className="bg-white shadow-md p-3 sm:p-4 border-b border-slate-200">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Add Records</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">{formatDate(selectedDate)}</p>
        </div>
      </div>

      {/* Forms */}
      <div className="p-3 sm:p-4 max-w-2xl mx-auto space-y-3">
        {MILK_PRODUCTS.map((product) => (
          <MilkRecordForm
            key={product.id}
            product={product}
            record={records[product.type]}
            onChange={(updatedRecord) => {
              setRecords((prev) => ({
                ...prev,
                [product.type]: updatedRecord,
              }))
            }}
          />
        ))}

        {/* Summary while adding */}
        {hasAnyRecord && (
          <Card className="p-4 bg-slate-50 border border-slate-200 sticky top-24 sm:top-20">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm sm:text-base">Preview Summary</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {MILK_PRODUCTS.map((product) => {
                const r = records[product.type]
                if (r.quantity === 0) return null
                const total = r.quantity * r.rate

                return (
                  <div
                    key={product.id}
                    className="flex justify-between text-xs sm:text-sm py-2 border-b border-slate-200"
                  >
                    <span className="text-slate-700">{product.type}</span>
                    <span className="font-semibold text-slate-800 text-right">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 pt-3 border-t-2 border-slate-300 flex justify-between font-bold text-slate-800">
              <span className="text-sm sm:text-base">Grand Total</span>
              <span className="text-base sm:text-lg">
                ₹
                {MILK_PRODUCTS.reduce((sum, product) => {
                  const r = records[product.type]
                  return sum + r.quantity * r.rate
                }, 0).toFixed(2)}
              </span>
            </div>
          </Card>
        )}
      </div>

      {/* Save Button - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 sm:p-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 border-slate-300 text-slate-600 hover:bg-slate-50 bg-transparent gap-2"
            disabled={loading}
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Cancel</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasAnyRecord || loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white gap-2"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">{loading ? "Saving..." : "Save Records"}</span>
            <span className="sm:hidden">{loading ? "..." : "Save"}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
