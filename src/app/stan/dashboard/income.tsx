"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface IncomeData {
  bulan: string
  total_pemasukan: number
  data_transaksi: Array<{
    id: number
    tanggal: string
    grandtTotal: number
    detailTrans: Array<{
      id: number
      id_menu: number
      qty: number
      harga_beli: number
      subtotal: number
    }>
  }>
}

const Income = () => {
  const [incomeData, setIncomeData] = useState<IncomeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth())
  const { toast } = useToast()

  useEffect(() => {
    fetchIncomeData()
  }, [selectedMonth])

  const fetchIncomeData = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    setLoading(true)
    try {
      const response = await axios.get(
        `https://ukk-p2.smktelkom-mlg.sch.id/api/showpemasukanbybulan/${selectedMonth}-01`,
        {
          headers: { Authorization: `Bearer ${token}`, makerID: "3" },
        },
      )
      setIncomeData(response.data.data)
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to fetch income data. Please try again.",
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
            <span>Income for {incomeData?.bulan || "N/A"}</span>
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
          <p className="text-2xl font-bold">Rp {incomeData?.total_pemasukan?.toLocaleString() || "0"}</p>
        </CardContent>
      </Card>
      {incomeData?.data_transaksi && incomeData.data_transaksi.length > 0 ? (
        incomeData.data_transaksi.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="p-4">
              <p className="font-semibold">Date: {new Date(transaction.tanggal).toLocaleDateString()}</p>
              <p>Total: Rp {transaction.grandtTotal.toLocaleString()}</p>
              {transaction.detailTrans.map((detail) => (
                <div key={detail.id} className="mt-2 pl-4">
                  <p>Menu ID: {detail.id_menu}</p>
                  <p>Quantity: {detail.qty}</p>
                  <p>Price: Rp {detail.harga_beli.toLocaleString()}</p>
                  <p>Subtotal: Rp {detail.subtotal.toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="p-4">
            <p>No transaction data available for the selected month.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Income

