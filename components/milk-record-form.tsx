"use client"

import { Card } from "@/components/ui/card"

interface MilkRecordFormProps {
  product: { id: number; name: string; type: string }
  record: { quantity: number; rate: number }
  onChange: (record: { quantity: number; rate: number }) => void
}

export function MilkRecordForm({ product, record, onChange }: MilkRecordFormProps) {
  const total = record.quantity * record.rate

  const handleChange = (field: "quantity" | "rate", value: number) => {
    onChange({
      ...record,
      [field]: value,
    })
  }

  return (
    <Card className="p-3 sm:p-4 bg-white border border-slate-200">
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-800 text-sm sm:text-base">{product.name}</h3>

        {/* Quantity and Rate */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
            <input
              type="number"
              value={record.quantity}
              onChange={(e) => handleChange("quantity", Number.parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="0"
              min="0"
              step="0.5"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Rate per Unit</label>
            <input
              type="number"
              value={record.rate}
              onChange={(e) => handleChange("rate", Number.parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Total Display */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-600 mb-1">Total Amount</p>
          <p className="text-lg font-bold text-slate-800">₹{total.toFixed(2)}</p>
        </div>
      </div>
    </Card>
  )
}
