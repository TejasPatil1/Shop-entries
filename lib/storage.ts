export interface MilkRecord {
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

const STORAGE_KEY_PREFIX = "milk_shop_"

export function getCurrentDateString(): string {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

export function getPreviousDateString(dateString: string): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() - 1)
  return date.toISOString().split("T")[0]
}

export async function getDayData(
  dateString: string,
): Promise<{ records: MilkRecord[]; totalPaid: number; carryForward: number }> {
  try {
    const response = await fetch(`/api/records?date=${encodeURIComponent(dateString)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      console.error("[TEJA] API response not ok:", response.status, response.statusText)
      // Fallback to localStorage
      const cached = localStorage.getItem(`${STORAGE_KEY_PREFIX}${dateString}`)
      if (cached) {
        return JSON.parse(cached)
      }
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const data = await response.json()
    // Cache in localStorage as backup
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${dateString}`, JSON.stringify(data))
    return data
  } catch (error) {
    console.error("[v0] Error fetching day data:", error)
    // Try localStorage as fallback
    const cached = localStorage.getItem(`${STORAGE_KEY_PREFIX}${dateString}`)
    if (cached) {
      console.log("[v0] Using cached data from localStorage")
      return JSON.parse(cached)
    }
    return { records: [], totalPaid: 0, carryForward: 0 }
  }
}

export async function saveDayData(dateString: string, records: MilkRecord[], totalPaid = 0): Promise<void> {
  const dataToSave = { date: dateString, records, totalPaid }

  try {
    // Always cache in localStorage first
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${dateString}`, JSON.stringify(dataToSave))

    const response = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSave),
    })

    if (!response.ok) {
      console.error("[v0] Failed to save to API:", response.status, response.statusText)
      console.log("[v0] Data saved to localStorage as backup")
      return
    }

    console.log("[v0] Data saved successfully to API and localStorage")
  } catch (error) {
    console.error("[v0] Error saving day data:", error)
    console.log("[v0] Data saved to localStorage as backup")
  }
}
