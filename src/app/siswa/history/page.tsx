"use client"

import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Calendar, Search } from "lucide-react"
import { format, subMonths } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const API_BASE_URL = "https://ukk-p2.smktelkom-mlg.sch.id/api"

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM-dd"))

  const fetchOrderHistory = useCallback(async (date: string) => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/showorderbymonthbysiswa/${date}`, {
        headers: { Authorization: `Bearer ${token}`, makerID: "3" },
      })

      // Filter out any duplicate orders based on ID and Stan ID
      // This is important because the API returns multiple entries for the same order ID
      const uniqueOrders = Array.from(
        new Map(response.data.data.map((order: any) => [`${order.id}-${order.id_stan}`, order])).values(),
      )

      // Sort by created_at date (newest first)
      const sortedOrders = uniqueOrders.sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      setOrders(sortedOrders)
    } catch (err: any) {
      console.error("Error fetching order history:", err)
      toast({
        title: "Error",
        description: "Failed to fetch order history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrderHistory(selectedMonth)
  }, [fetchOrderHistory, selectedMonth])

  // Generate month options for the last 12 months
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i)
    return {
      value: format(date, "yyyy-MM-dd"),
      label: format(date, "MMMM yyyy"),
    }
  })

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "belum dikonfirm":
        return <Badge className="bg-gray-500">Pending</Badge>
      case "dimasak":
        return <Badge className="bg-yellow-500">Cooking</Badge>
      case "diantar":
        return <Badge className="bg-purple-500">On the way</Badge>
      case "siap":
        return <Badge className="bg-green-500">Ready</Badge>
      case "sampai":
        return <Badge className="bg-blue-500">Delivered</Badge>
      case "selesai":
        return <Badge className="bg-blue-500">Completed</Badge>
      default:
        return <Badge>Processing</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <motion.div
          className="rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        ></motion.div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Order History</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <select
              className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-[200px]"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={() => fetchOrderHistory(selectedMonth)} variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {orders.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Stan ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => (
                    <TableRow key={`${order.id}-${order.id_stan}-${index}`}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{format(new Date(order.tanggal), "dd MMM yyyy")}</TableCell>
                      <TableCell>{order.id_stan}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{format(new Date(order.created_at), "dd MMM yyyy HH:mm")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Calendar className="h-16 w-16 mx-auto text-gray-400" />
            <h2 className="text-xl font-semibold mt-4">No order history</h2>
            <p className="text-gray-500 mt-2">You don't have any orders for this month.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
