"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OrderItem {
  id: number
  id_menu: number
  qty: number
  harga_beli: number
}

interface Order {
  id: number
  tanggal: string
  id_siswa: number
  id_stan: number
  status: string
  detail_trans: OrderItem[]
}

const statusOptions = ["belum dikonfirm", "dimasak", "diantar"]

const Order = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchOrders = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    setLoading(true)
    try {
      const responses = await Promise.all(
        statusOptions.map((status) =>
          axios.get(`https://ukk-p2.smktelkom-mlg.sch.id/api/getorder/${status}`, {
            headers: { Authorization: `Bearer ${token}`, makerID: "3" },
          }),
        ),
      )

      const allOrders = responses.flatMap((response) => response.data.data)
      setOrders(allOrders)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, []) //Fixed useEffect dependency

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      await axios.put(
        `https://ukk-p2.smktelkom-mlg.sch.id/api/updatestatus/${orderId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}`, makerID: "3" },
        },
      )

      toast({
        title: "Success",
        description: "Order status updated successfully!",
      })

      // Refresh orders after updating
      fetchOrders()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          className="h-16 w-16 rounded-full border-t-2 border-b-2 border-gray-900"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Orders</h2>
      <AnimatePresence>
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Order #{order.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Date: {new Date(order.tanggal).toLocaleDateString()}</p>
                <p>Status: {order.status}</p>
                <h3 className="font-semibold mt-2">Order Items:</h3>
                <ul className="list-disc list-inside">
                  {order.detail_trans.map((item) => (
                    <li key={item.id}>
                      Menu ID: {item.id_menu}, Quantity: {item.qty}, Price: ${item.harga_beli}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center space-x-2">
                  <Select onValueChange={(value) => handleStatusUpdate(order.id, value)} defaultValue={order.status}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                      <SelectItem value="sampai">sampai</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => handleStatusUpdate(order.id, order.status)}>Update Status</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default Order

