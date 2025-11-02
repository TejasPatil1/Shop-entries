"use client"

import { Card } from "@/components/ui/card"
import type { MilkRecord } from "@/lib/storage"

export function MilkCard({ record, onDelete }: { record: MilkRecord; onDelete?: () => void }) {
  return (
    <Card className="p-4 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header - Milk Type with Delete Button */}
        <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">{record.type}</h3>
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
              title="Delete record"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}</div>

        {/* Row 1: Quantity and Rate */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Quantity</p>
            <p className="text-xl font-bold text-slate-800">{record.quantity}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Rate</p>
            <p className="text-xl font-bold text-slate-800">₹{record.rate.toFixed(2)}</p>
          </div>
        </div>

        {/* Row 2: Total only */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p className="text-xs font-medium text-slate-500 uppercase mb-1">Total</p>
          <p className="text-lg font-bold text-slate-800">₹{record.total.toFixed(2)}</p>
        </div>
      </div>
    </Card>
  )
}
