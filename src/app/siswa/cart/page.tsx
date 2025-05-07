"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Trash, ArrowLeft, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

const API_BASE_URL = "https://ukk-p2.smktelkom-mlg.sch.id/api"

interface CartItem {
  id_menu: string
  nama_makanan: string
  harga: number
  jenis: string
  foto: string
  quantity: number
  persentase_diskon: number
  id_stan: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [orderLoading, setOrderLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Load cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    setCartItems(cart)
    setLoading(false)
  }, [])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }

    const updatedCart = cartItems.map((item) => (item.id_menu === id ? { ...item, quantity: newQuantity } : item))

    setCartItems(updatedCart)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
    window.dispatchEvent(new Event("storage"))
  }

  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter((item) => item.id_menu !== id)
    setCartItems(updatedCart)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
    window.dispatchEvent(new Event("storage"))

    toast({
      title: "Item removed",
      description: "Item has been removed from your cart.",
    })
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.setItem("cart", "[]")
    window.dispatchEvent(new Event("storage"))

    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    })
  }

  const calculateItemPrice = (item: CartItem) => {
    const originalPrice = Number(item.harga)
    const discountPercentage = item.persentase_diskon || 0
    const discountedPrice = originalPrice - originalPrice * (discountPercentage / 100)
    return discountedPrice * item.quantity
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + calculateItemPrice(item), 0)
  }

  const handleCheckout = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/")
      return
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      })
      return
    }

    // Group items by stan
    const stanGroups: Record<string, CartItem[]> = {}
    cartItems.forEach((item) => {
      if (!item.id_stan) {
        toast({
          title: "Error",
          description: "Some items are missing stan information. Please try again.",
          variant: "destructive",
        })
        return
      }

      if (!stanGroups[item.id_stan]) {
        stanGroups[item.id_stan] = []
      }
      stanGroups[item.id_stan].push(item)
    })

    setOrderLoading(true)

    try {
      // Place orders for each stan
      for (const stanId in stanGroups) {
        const orderItems = stanGroups[stanId].map((item) => ({
          id_menu: item.id_menu,
          qty: item.quantity,
        }))

        // Create the order data in the format expected by the API
        const orderData = {
          id_stan: stanId,
          pesan: orderItems,
        }

        // Store the current stan ID in localStorage for reference
        localStorage.setItem("currentStanId", stanId)

        // Use axios.get with params instead of data for GET requests
        // The API expects the data as URL parameters or query string
        const response = await axios.get(`${API_BASE_URL}/pesan`, {
          headers: {
            Authorization: `Bearer ${token}`,
            makerID: "3",
            "Content-Type": "application/json",
          },
          params: orderData,
        })

        console.log("Order response:", response.data)
      }

      // Clear cart after successful order
      clearCart()

      toast({
        title: "Order placed successfully!",
        description: "You can track your order in the My Orders page.",
      })

      router.push("/siswa/orders")
    } catch (err: any) {
      console.error("Error placing order:", err)

      // Try alternative approach if the first one fails
      try {
        for (const stanId in stanGroups) {
          const orderItems = stanGroups[stanId].map((item) => ({
            id_menu: item.id_menu,
            qty: item.quantity,
          }))

          // Create the order data
          const orderData = {
            id_stan: stanId,
            pesan: orderItems,
          }

          // Try with axios.post as a fallback
          const response = await axios({
            method: "post",
            url: `${API_BASE_URL}/pesan`,
            headers: {
              Authorization: `Bearer ${token}`,
              makerID: "3",
              "Content-Type": "application/json",
            },
            data: orderData,
          })

          console.log("Order response (fallback):", response.data)
        }

        // Clear cart after successful order
        clearCart()

        toast({
          title: "Order placed successfully!",
          description: "You can track your order in the My Orders page.",
        })

        router.push("/siswa/orders")
      } catch (fallbackErr: any) {
        console.error("Error with fallback approach:", fallbackErr)
        toast({
          title: "Error",
          description: fallbackErr.response?.data?.message || "Failed to place order. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setOrderLoading(false)
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
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <div className="flex gap-2">
            <Link href="/siswa">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            {cartItems.length > 0 && (
              <Button variant="destructive" onClick={clearCart}>
                <Trash className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="border-b">
                    <h2 className="text-lg font-semibold">Cart Items ({cartItems.length})</h2>
                  </CardHeader>
                  <CardContent className="p-0">
                    {cartItems.map((item) => {
                      const originalPrice = Number(item.harga)
                      const discountPercentage = item.persentase_diskon || 0
                      const discountedPrice = originalPrice - originalPrice * (discountPercentage / 100)

                      return (
                        <motion.div
                          key={item.id_menu}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center p-4 border-b last:border-b-0"
                        >
                          <img
                            src={`https://ukk-p2.smktelkom-mlg.sch.id/${item.foto}`}
                            alt={item.nama_makanan}
                            className="w-16 h-16 object-cover rounded-md mr-4"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=64&width=64"
                            }}
                          />
                          <div className="flex-grow">
                            <h3 className="font-medium">{item.nama_makanan}</h3>
                            <div className="flex items-center mt-1">
                              {discountPercentage > 0 ? (
                                <>
                                  <span className="text-primary font-semibold">
                                    Rp{discountedPrice.toLocaleString()}
                                  </span>
                                  <span className="text-sm text-gray-500 line-through ml-2">
                                    Rp{originalPrice.toLocaleString()}
                                  </span>
                                </>
                              ) : (
                                <span className="text-primary font-semibold">Rp{originalPrice.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id_menu, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id_menu, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="font-semibold">Rp{calculateItemPrice(item).toLocaleString()}</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 mt-1 h-auto p-0"
                              onClick={() => removeItem(item.id_menu)}
                            >
                              Remove
                            </Button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader className="border-b">
                    <h2 className="text-lg font-semibold">Order Summary</h2>
                  </CardHeader>
                  <CardContent className="py-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>Rp{calculateTotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span>Rp{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={handleCheckout} disabled={orderLoading}>
                      {orderLoading ? (
                        <motion.div
                          className="rounded-full h-4 w-4 border-t-2 border-b-2 border-white"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                        ></motion.div>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Checkout
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-400" />
              <h2 className="text-xl font-semibold mt-4">Your cart is empty</h2>
              <p className="text-gray-500 mt-2">Add some items to your cart to get started.</p>
              <Link href="/siswa">
                <Button className="mt-6">Browse Menu</Button>
              </Link>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
