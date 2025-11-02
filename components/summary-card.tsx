"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PaymentModal } from "./payment-modal"

interface SummaryCardProps {
  totalAmount: number
  remainingAmount: number
  carryForward: number
  grandRemaining: number
  onPayment?: (amount: number) => void
}

export function SummaryCard({
  totalAmount,
  remainingAmount,
  carryForward,
  grandRemaining,
  onPayment,
}: SummaryCardProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const handlePaymentSubmit = (amount: number) => {
    onPayment?.(amount)
    setIsPaymentModalOpen(false)
  }

  return (
    <>
      <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-lg">
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Today's Summary</h2>

          {/* Main Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
              <p className="text-xs font-medium text-gray-300 uppercase mb-1">Total</p>
              <p className="text-lg font-bold">₹{totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg backdrop-blur-sm">
              <p className="text-xs font-medium text-green-300 uppercase mb-1">Amount Paid</p>
              <p className="text-lg font-bold text-green-300">₹{(totalAmount - remainingAmount).toFixed(2)}</p>
            </div>
            <div className="bg-red-500/20 p-3 rounded-lg backdrop-blur-sm">
              <p className="text-xs font-medium text-red-300 uppercase mb-1">Remaining</p>
              <p className="text-lg font-bold text-red-300">₹{remainingAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Carry Forward Info */}
          {carryForward > 0 && (
            <div className="bg-yellow-500/20 p-3 rounded-lg backdrop-blur-sm border border-yellow-500/30">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-yellow-300">Carry Forward from Previous Day</p>
                <span className="bg-yellow-500 text-slate-900 px-2 py-1 rounded text-xs font-bold">
                  ₹{carryForward.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Grand Remaining */}
          <div className="bg-white/15 p-3 rounded-lg border border-white/20">
            <p className="text-xs font-medium text-gray-300 uppercase mb-1">Total Due (Including Carry Forward)</p>
            <p className="text-2xl font-bold text-red-300">₹{grandRemaining.toFixed(2)}</p>
          </div>

          {grandRemaining > 0 && (
            <Button
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
            >
              💳 Pay Amount
            </Button>
          )}
        </div>
      </Card>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPay={handlePaymentSubmit}
        totalDue={grandRemaining}
      />
    </>
  )
}
