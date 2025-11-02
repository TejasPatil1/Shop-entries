"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MilkCard } from "@/components/milk-card"
import { SummaryCard } from "@/components/summary-card"
import { formatDate, getCurrentDateString } from "@/lib/date-utils"
import { getDayData, saveDayData, type MilkRecord } from "@/lib/storage"

export function Dashboard({ onAddRecord }: { onAddRecord: () => void }) {
  const [selectedDate, setSelectedDate] = useState(getCurrentDateString())
  const [dayData, setDayData] = useState<{ records: MilkRecord[]; totalPaid: number; carryForward: number } | null>(
    null,
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const data = await getDayData(selectedDate)
        console.log("[v0] Loaded data for", selectedDate, data)
        setDayData(data)
      } catch (error) {
        console.error("[v0] Failed to load data:", error)
        setDayData({ records: [], totalPaid: 0, carryForward: 0 })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [selectedDate])

  const totalAmount = dayData?.records.reduce((sum, r) => sum + r.total, 0) || 0
  const totalPaid = dayData?.totalPaid || 0
  const remainingAmount = totalAmount - totalPaid
  const carryForward = dayData?.carryForward || 0
  const grandRemaining = remainingAmount + carryForward

  const handlePayment = async (paymentAmount: number) => {
    if (!dayData) return

    const newTotalPaid = dayData.totalPaid + paymentAmount

    await saveDayData(selectedDate, dayData.records, newTotalPaid)

    const updatedData = await getDayData(selectedDate)
    setDayData(updatedData)
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!dayData || !dayData.records) return

    const updatedRecords = dayData.records.filter(record => record.id !== recordId)
    await saveDayData(selectedDate, updatedRecords, dayData.totalPaid)

    setDayData(prev => prev ? {
      ...prev,
      records: updatedRecords
    } : null)
  }

  const goToPreviousDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() - 1)
    setSelectedDate(date.toISOString().split("T")[0])
  }

  const goToNextDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + 1)
    setSelectedDate(date.toISOString().split("T")[0])
  }

  const goToToday = () => {
    setSelectedDate(getCurrentDateString())
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sticky Header with Date Picker */}
      <div className="sticky top-0 z-50 bg-white shadow-md p-3 sm:p-4 border-b border-slate-200">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={goToPreviousDay}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Previous day"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />

            <button
              onClick={goToNextDay}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Next day"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-xs sm:text-sm text-slate-600">{formatDate(selectedDate)}</p>
            <button
              onClick={goToToday}
              className="text-xs sm:text-sm px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Added proper bottom padding and removed overflow-auto */}
      <div className="flex-1 p-3 sm:p-4 pb-80">
        <div className="max-w-2xl mx-auto space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-600">Loading...</p>
            </div>
          ) : dayData?.records && dayData.records.length > 0 ? (
            <>
              {dayData.records.map((record) => (
                <MilkCard 
                  key={record.id} 
                  record={record} 
                  onDelete={() => handleDeleteRecord(record.id)}
                />
              ))}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">No records for this date</p>
              <Button onClick={onAddRecord} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Record
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Card - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg p-3 sm:p-4">
        <div className="max-w-2xl mx-auto">
          <SummaryCard
            totalAmount={totalAmount}
            remainingAmount={remainingAmount}
            carryForward={carryForward}
            grandRemaining={grandRemaining}
            onPayment={handlePayment}
          />
          {dayData?.records && dayData.records.length > 0 && (
            <Button onClick={onAddRecord} className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add More Records
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
