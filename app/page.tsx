"use client"

import { useState, useEffect } from "react"
import { Dashboard } from "@/components/dashboard"
import { AddRecord } from "@/components/add-record"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"dashboard" | "add">("dashboard")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-background">
      {currentPage === "dashboard" && <Dashboard onAddRecord={() => setCurrentPage("add")} />}
      {currentPage === "add" && <AddRecord onBack={() => setCurrentPage("dashboard")} />}
    </main>
  )
}
