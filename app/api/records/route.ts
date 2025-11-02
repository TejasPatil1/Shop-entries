import { NextResponse } from "next/server"
import { put, list } from "@vercel/blob"

interface MilkRecord {
  id: string
  type: string
  quantity: number
  rate: number
  total: number
}

interface DayData {
  date: string
  records: MilkRecord[]
  totalPaid: number
  carryForward: number
}

function getPreviousDateString(dateString: string): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() - 1)
  return date.toISOString().split("T")[0]
}

async function getDayDataFromBlob(date: string): Promise<DayData | null> {
  try {
    const filename = `milk_records/${date}.json`
    const { blobs } = await list({ prefix: "milk_records/" })
    const file = blobs.find((b) => b.pathname === filename)
    if (!file) return null

    const res = await fetch(file.url)
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    console.error("[TEJA] Error fetching from blob:", err)
    return null
  }
}

async function saveDayDataToBlob(data: DayData): Promise<void> {
  const filename = `milk_records/${data.date}.json`
  await put(filename, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
  })
}

// ---- GET route ----
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url)
    const date = url.searchParams.get("date")
    if (!date) {
      return NextResponse.json({ records: [], totalPaid: 0, carryForward: 0 })
    }

    // Get today's data
    const dayData = await getDayDataFromBlob(date)
    if (dayData) return NextResponse.json(dayData)

    // Otherwise check previous day for carry forward
    const previousDate = getPreviousDateString(date)
    const previousData = await getDayDataFromBlob(previousDate)

    let carryForward = 0
    if (previousData) {
      const previousTotal = previousData.records.reduce((sum, r) => sum + r.total, 0)
      const previousPaid = previousData.totalPaid || 0
      carryForward = previousTotal - previousPaid
    }

    return NextResponse.json({ records: [], totalPaid: 0, carryForward })
  } catch (error) {
    console.error("[TEJA] Error in GET:", error)
    return NextResponse.json({ records: [], totalPaid: 0, carryForward: 0 }, { status: 200 })
  }
}

// ---- POST route ----
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { date, records, totalPaid } = await request.json()
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    const previousDate = getPreviousDateString(date)
    const previousData = await getDayDataFromBlob(previousDate)

    let carryForward = 0
    if (previousData) {
      const previousTotal = previousData.records.reduce((sum, r) => sum + r.total, 0)
      const previousPaid = previousData.totalPaid || 0
      carryForward = previousTotal - previousPaid
    }

    const dayData: DayData = { date, records, totalPaid, carryForward }

    await saveDayDataToBlob(dayData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[TEJA] Error in POST:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
