"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPay: (amount: number) => void
  totalDue: number
}

export function PaymentModal({ isOpen, onClose, onPay, totalDue }: PaymentModalProps) {
  const [amount, setAmount] = useState("")

  const handlePay = () => {
    const payAmount = Number.parseFloat(amount)
    if (payAmount > 0 && payAmount <= totalDue) {
      onPay(payAmount)
      setAmount("")
    }
  }

  if (!isOpen) return null

  const payAmount = Number.parseFloat(amount) || 0
  const remaining = totalDue - payAmount

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <Card className="w-full max-w-sm bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Record Payment</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Amount Due */}
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-xs font-medium text-red-700 uppercase">Total Due</p>
            <p className="text-2xl font-bold text-red-700">₹{totalDue.toFixed(2)}</p>
          </div>

          {/* Payment Input */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Enter Payment Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-500 font-semibold">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                step="0.01"
                min="0"
                max={totalDue}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Max: ₹{totalDue.toFixed(2)}</p>
          </div>

          {/* After Payment */}
          {payAmount > 0 && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-xs font-medium text-green-700 uppercase">After Payment</p>
              <p className="text-xl font-bold text-green-700">₹{remaining.toFixed(2)} remaining</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handlePay}
              disabled={payAmount <= 0 || payAmount > totalDue}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Pay ₹{payAmount.toFixed(2)}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
