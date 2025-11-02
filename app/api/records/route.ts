import { NextResponse } from "next/server"

const JSONBIN_URL = `https://api.jsonbin.io/v3/b/6906dd1b80b27952c6e764c2`
const HEADERS = {
  "Content-Type": "application/json",
  "X-Master-Key": process.env.JSONBIN_KEY!,
}

function getPreviousDateString(dateString: string): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() - 1)
  return date.toISOString().split("T")[0]
}

// Fetch all records
async function getAllData() {
  const res = await fetch(JSONBIN_URL, { headers: HEADERS })
  const json = await res.json()
  return json.record || {}
}

// Save all records
async function saveAllData(data: any) {
  await fetch(JSONBIN_URL, {
    method: "PUT",
    headers: HEADERS,
    body: JSON.stringify(data),
  })
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const date = url.searchParams.get("date")
    const allData = await getAllData()

    if (!date) {
      return NextResponse.json({ records: [], totalPaid: 0, carryForward: 0 })
    }

    const dayData = allData[date]

    if (!dayData) {
      const prevDate = getPreviousDateString(date)
      const prevData = allData[prevDate]

      let carryForward = 0
      if (prevData) {
        const prevTotal = prevData.records.reduce((s: number, r: any) => s + r.total, 0)
        const prevPaid = prevData.totalPaid || 0
        carryForward = prevTotal - prevPaid
      }

      return NextResponse.json({ records: [], totalPaid: 0, carryForward })
    }

    return NextResponse.json(dayData)
  } catch (error) {
    console.error("[TEJA] Error in GET:", error)
    return NextResponse.json({ records: [], totalPaid: 0, carryForward: 0 }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const { date, records, totalPaid } = await request.json()

    if (!date) {
      return NextResponse.json({ error: "Date required" }, { status: 400 })
    }

    const allData = await getAllData()
    const prevDate = getPreviousDateString(date)
    const prevData = allData[prevDate]

    let carryForward = 0
    if (prevData) {
      const prevTotal = prevData.records.reduce((s: number, r: any) => s + r.total, 0)
      const prevPaid = prevData.totalPaid || 0
      carryForward = prevTotal - prevPaid
    }

    allData[date] = {
      date,
      records,
      totalPaid,
      carryForward,
    }

    await saveAllData(allData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[TEJA] Error in POST:", error)
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 })
  }
}
