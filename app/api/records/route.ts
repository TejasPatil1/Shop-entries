import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

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

interface StorageData {
  [key: string]: DayData
}

const DATA_FILE = path.join(process.cwd(), "data", "records.json")

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE)
  } catch {
    const dir = path.dirname(DATA_FILE)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(DATA_FILE, JSON.stringify({}, null, 2))
  }
}

async function getAllData(): Promise<StorageData> {
  await ensureDataFile()
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8")
    return JSON.parse(content)
  } catch {
    return {}
  }
}

async function saveAllData(data: StorageData): Promise<void> {
  await ensureDataFile()
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2))
}

function getPreviousDateString(dateString: string): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() - 1)
  return date.toISOString().split("T")[0]
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const date = request.nextUrl.searchParams.get("date")

    if (!date) {
      return NextResponse.json({ records: [], totalPaid: 0, carryForward: 0 })
    }

    const allData = await getAllData()
    const dayData = allData[date]

    // If no data for today, calculate carry forward from yesterday
    if (!dayData) {
      const previousDate = getPreviousDateString(date)
      const previousData = allData[previousDate]

      let carryForward = 0
      if (previousData) {
        const previousTotal = previousData.records.reduce((sum, r) => sum + r.total, 0)
        const previousPaid = previousData.totalPaid || 0
        const previousRemaining = previousTotal - previousPaid
        carryForward = previousRemaining
      }

      return NextResponse.json({ records: [], totalPaid: 0, carryForward })
    }

    return NextResponse.json(dayData)
  } catch (error) {
    console.error("[v0] Error in GET:", error)
    return NextResponse.json(
      { records: [], totalPaid: 0, carryForward: 0 },
      { status: 200 }, // Return 200 to avoid client errors
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { date, records, totalPaid } = body

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    const allData = await getAllData()

    // Calculate carry forward
    const previousDate = getPreviousDateString(date)
    const previousData = allData[previousDate]

    let carryForward = 0
    if (previousData) {
      const previousTotal = previousData.records.reduce((sum, r) => sum + r.total, 0)
      const previousPaid = previousData.totalPaid || 0
      const previousRemaining = previousTotal - previousPaid
      carryForward = previousRemaining
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
    console.error("[v0] Error in POST:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
