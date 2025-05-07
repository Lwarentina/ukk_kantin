"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HistoryData {
  id: number
  nama_siswa: string
  tanggal: string
  status: string
}

const History = () => {
  const [historyData, setHistoryData] = useState<HistoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth())
  const { toast } = useToast()

  useEffect(() => {
    fetchHistoryData()
  }, [selectedMonth]) // Removed toast from dependencies

  const fetchHistoryData = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    setLoading(true)
    try {
      const response = await axios.get(`https://ukk-p2.smktelkom-mlg.sch.id/api/showorderbymonth/${selectedMonth}-01`, {
        headers: { Authorization: `Bearer ${token}`, makerID: "3" },
      })
      setHistoryData(response.data.data || [])
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to fetch order history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function getCurrentYearMonth() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`
  }

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="h-16 w-16 rounded-full border-t-2 border-b-2 border-gray-900"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Order History</span>
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date(new Date().getFullYear(), i, 1)
                  return (
                    <SelectItem key={i} value={date.toISOString().slice(0, 7)}>
                      {date.toLocaleString("default", { month: "long", year: "numeric" })}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyData.length === 0 ? (
            <p>No order history available for the selected month.</p>
          ) : (
            historyData.map((order) => (
              <Card key={order.id} className="mb-4">
                <CardContent className="p-4">
                  <p className="font-semibold">{order.nama_siswa || "N/A"}</p>
                  <p>Date: {order.tanggal ? new Date(order.tanggal).toLocaleDateString() : "N/A"}</p>
                  <p>Status: {order.status || "N/A"}</p>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default History

