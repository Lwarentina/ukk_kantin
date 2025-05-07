"use client"

import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Clock, Download } from "lucide-react"
import { format } from "date-fns"

const API_BASE_URL = "https://ukk-p2.smktelkom-mlg.sch.id/api"

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null)

  // Define the status options we want to fetch
  const statusOptions = ["belum dikonfirm", "dimasak", "diantar", "siap", "selesai", "sampai"]

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    setLoading(true)
    try {
      // Fetch orders for all status options in parallel
      const responses = await Promise.all(
        statusOptions.map((status) =>
          axios
            .get(`${API_BASE_URL}/showorder/${status}`, {
              headers: { Authorization: `Bearer ${token}`, makerID: "3" },
            })
            .catch((error) => {
              console.warn(`Error fetching orders with status ${status}:`, error)
              return { data: { data: [] } } // Return empty data on error
            }),
        ),
      )

      // Combine all orders from different statuses
      const allOrders = responses.flatMap((response) => response.data.data || [])

      // Sort orders by creation date (newest first)
      const sortedOrders = allOrders.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      setOrders(sortedOrders)
    } catch (err: any) {
      console.error("Error fetching orders:", err)
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleDownloadReceipt = async (orderId: string) => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    setDownloadingReceipt(orderId)

    try {
      // Step 1: Fetch receipt data
      const receiptResponse = await axios.get(`${API_BASE_URL}/cetaknota/${orderId}`, {
        headers: { Authorization: `Bearer ${token}`, makerID: "3" },
      })
      const receiptData = receiptResponse.data.data

      // Step 2: Fetch customer profile data
      let customerData = { nama_siswa: "Customer", alamat: "", telp: "" }
      try {
        const profileResponse = await axios.get(`${API_BASE_URL}/get_profile`, {
          headers: { Authorization: `Bearer ${token}`, makerID: "3" },
        })
        if (profileResponse.data && profileResponse.data.data) {
          customerData = profileResponse.data.data
        }
      } catch (profileErr) {
        console.warn("Error fetching customer profile:", profileErr)
        // Continue with default customer data
      }

      // Step 3: Fetch menu details for each item
      const menuDetailsPromises = receiptData.detail_trans.map(async (item: any) => {
        const menuId = item.id_menu
        let menuName = `Menu #${menuId}`

        try {
          // Try to fetch from different menu endpoints
          const endpoints = [
            `${API_BASE_URL}/getmenudiskon`,
            `${API_BASE_URL}/getmenufood`,
            `${API_BASE_URL}/getmenudrink`,
          ]

          for (const endpoint of endpoints) {
            try {
              const menuResponse = await axios.post(
                endpoint,
                { search: "" },
                { headers: { Authorization: `Bearer ${token}`, makerID: "3" } },
              )

              if (menuResponse.data && menuResponse.data.data) {
                const foundMenu = menuResponse.data.data.find((menu: any) => (menu.id_menu || menu.id) == menuId)

                if (foundMenu) {
                  menuName = foundMenu.nama_makanan
                  break
                }
              }
            } catch (endpointErr) {
              console.warn(`Error fetching menu from ${endpoint}:`, endpointErr)
              // Continue to next endpoint
            }
          }
        } catch (menuErr) {
          console.warn(`Error fetching menu details for ID ${menuId}:`, menuErr)
          // Continue with default menu name
        }

        return {
          ...item,
          nama_makanan: menuName,
        }
      })

      // Wait for all menu detail requests to complete
      const menuDetailsResults = await Promise.allSettled(menuDetailsPromises)
      const menuDetails = menuDetailsResults.map((result, index) => {
        if (result.status === "fulfilled") {
          return result.value
        } else {
          // Return original item with default name if fetch failed
          return {
            ...receiptData.detail_trans[index],
            nama_makanan: `Menu #${receiptData.detail_trans[index].id_menu}`,
          }
        }
      })

      // Step 4: Create enhanced receipt data
      const enhancedReceiptData = {
        ...receiptData,
        customer: customerData,
        detail_trans: menuDetails,
      }

      // Step 5: Generate and download receipt
      const receiptContent = generateReceiptHTML(enhancedReceiptData, orderId)
      const blob = new Blob([receiptContent], { type: "text/html" })

      // Create a temporary link and trigger download
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `receipt-order-${orderId}.html`
      document.body.appendChild(link)
      link.click()

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)

      toast({
        title: "Success",
        description: "Receipt downloaded successfully!",
      })
    } catch (err) {
      console.error("Error downloading receipt:", err)
      toast({
        title: "Error",
        description: "Failed to download receipt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDownloadingReceipt(null)
    }
  }

  // Function to generate receipt HTML
  const generateReceiptHTML = (receiptData: any, orderId: string) => {
    // Format date
    const orderDate = format(new Date(receiptData.created_at), "dd MMM yyyy HH:mm")

    // Calculate total if needed
    const total = receiptData.grandtTotal || 0

    // Generate items HTML
    let itemsHTML = ""
    if (receiptData.detail_trans && receiptData.detail_trans.length > 0) {
      receiptData.detail_trans.forEach((item: any) => {
        const unitPrice = Number(item.harga_beli) / Number(item.qty)
        itemsHTML += `
          <tr>
            <td>${item.nama_makanan || `Menu #${item.id_menu}`}</td>
            <td style="text-align: center;">${item.qty}</td>
            <td style="text-align: right;">Rp${unitPrice.toLocaleString()}</td>
            <td style="text-align: right;">Rp${Number(item.harga_beli).toLocaleString()}</td>
          </tr>
        `
      })
    }

    // Return complete HTML
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Receipt #${orderId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .receipt { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; }
          .header { text-align: center; margin-bottom: 20px; }
          .info { margin-bottom: 20px; }
          .info-row { display: flex; margin-bottom: 5px; }
          .info-label { width: 120px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 8px; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; text-align: left; }
          .total { font-weight: bold; text-align: right; font-size: 1.2em; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
          @media print {
            body { margin: 0; }
            .receipt { border: none; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>Order Receipt</h1>
            <p>Order #${orderId}</p>
            <p>${orderDate}</p>
          </div>
          
          <div class="info">
            <div class="info-row">
              <div class="info-label">Customer:</div>
              <div>${receiptData.customer?.nama_siswa || "N/A"}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Phone:</div>
              <div>${receiptData.customer?.telp || "N/A"}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Address:</div>
              <div>${receiptData.customer?.alamat || "N/A"}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Status:</div>
              <div>${receiptData.status || "Processing"}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Stan ID:</div>
              <div>${receiptData.id_stan || "N/A"}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div class="total">
            Total: Rp${Number(total).toLocaleString()}
          </div>
          
          <div class="footer">
            <p>Thank you for your order!</p>
            <button class="no-print" onclick="window.print()">Print Receipt</button>
          </div>
        </div>
      </body>
      </html>
    `
  }

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

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "belum dikonfirm":
        return "Waiting for confirmation"
      case "dimasak":
        return "Cooking in progress"
      case "diantar":
        return "On the way to you"
      case "siap":
        return "Ready for pickup"
      case "sampai":
        return "Order delivered"
      case "selesai":
        return "Order completed"
      default:
        return "Processing"
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <Button onClick={fetchOrders} variant="outline">
          Refresh
        </Button>
      </div>

      <AnimatePresence>
        {orders.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Order #{order.id}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {order.created_at ? format(new Date(order.created_at), "dd MMM yyyy HH:mm") : "N/A"}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Items</h3>
                      <ul className="mt-1 space-y-1">
                        {order.detail_pesanan?.map((item: any, index: number) => (
                          <li key={index} className="flex justify-between text-sm">
                            <span>
                              {item.qty}x {item.nama_makanan}
                            </span>
                            <span>Rp{Number(item.harga).toLocaleString()}</span>
                          </li>
                        )) ||
                          order.detail_trans?.map((item: any, index: number) => (
                            <li key={index} className="flex justify-between text-sm">
                              <span>
                                {item.qty}x Menu #{item.id_menu}
                              </span>
                              <span>Rp{Number(item.harga_beli).toLocaleString()}</span>
                            </li>
                          )) || <li className="text-sm text-gray-500">No items</li>}
                      </ul>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>
                          {order.total_harga
                            ? `Rp${Number(order.total_harga).toLocaleString()}`
                            : order.detail_trans && order.detail_trans.length > 0
                              ? `Rp${order.detail_trans
                                  .reduce((sum: number, item: any) => sum + Number(item.harga_beli), 0)
                                  .toLocaleString()}`
                              : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between pt-2 border-t">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{getStatusText(order.status)}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReceipt(order.id)}
                        disabled={downloadingReceipt === order.id}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {downloadingReceipt === order.id ? "Downloading..." : "Download Receipt"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Clock className="h-16 w-16 mx-auto text-gray-400" />
            <h2 className="text-xl font-semibold mt-4">No active orders</h2>
            <p className="text-gray-500 mt-2">You don't have any active orders at the moment.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
