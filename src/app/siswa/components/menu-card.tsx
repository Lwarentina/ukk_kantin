"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MinusCircle, PlusCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface MenuCardProps {
  menu: {
    id_menu: string
    nama_makanan: string
    harga: number
    jenis: string
    foto: string
    deskripsi: string
    persentase_diskon?: number
    nama_diskon?: string
    id_stan?: string
  }
}

const API_BASE_URL = "https://ukk-p2.smktelkom-mlg.sch.id"

const MenuCard: React.FC<MenuCardProps> = ({ menu }) => {
  const [quantity, setQuantity] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [cartItems, setCartItems] = useState<any[]>([])

  useEffect(() => {
    // Load cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    setCartItems(cart)

    // Check if this item is already in the cart
    const existingItem = cart.find((item: any) => item.id_menu === menu.id_menu)
    if (existingItem) {
      setQuantity(existingItem.quantity)
    }
  }, [menu.id_menu])

  // Calculate discounted price if applicable
  const originalPrice = Number(menu.harga)
  const discountPercentage = menu.persentase_diskon || 0
  const discountedPrice = originalPrice - originalPrice * (discountPercentage / 100)

  const handleAddToCart = () => {
    if (quantity <= 0) return

    // Get current cart from localStorage
    const currentCart = [...cartItems]

    // Check if item already exists in cart
    const existingItemIndex = currentCart.findIndex((item: any) => item.id_menu === menu.id_menu)

    // Ensure we have the stan ID
    const stanId = menu.id_stan ? menu.id_stan.toString() : ""

    if (!stanId) {
      console.error("Missing stan ID for menu item:", menu)
      toast({
        title: "Error",
        description: "Could not add item to cart. Missing stan information.",
        variant: "destructive",
      })
      return
    }

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      currentCart[existingItemIndex].quantity = quantity
    } else {
      // Add new item to cart
      currentCart.push({
        id_menu: menu.id_menu,
        nama_makanan: menu.nama_makanan,
        harga: menu.harga,
        jenis: menu.jenis,
        foto: menu.foto,
        quantity: quantity,
        persentase_diskon: menu.persentase_diskon || 0,
        id_stan: stanId,
        deskripsi: menu.deskripsi || "",
      })
    }

    // Save updated cart to localStorage
    localStorage.setItem("cart", JSON.stringify(currentCart))
    setCartItems(currentCart)

    // Dispatch storage event to update cart count in navbar
    window.dispatchEvent(new Event("storage"))

    toast({
      title: "Added to cart",
      description: `${quantity} x ${menu.nama_makanan} added to your cart.`,
    })
  }

  const incrementQuantity = () => setQuantity((prev) => prev + 1)
  const decrementQuantity = () => setQuantity((prev) => Math.max(0, prev - 1))

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="overflow-hidden h-full flex flex-col">
          <CardHeader className="p-0">
            <div className="relative cursor-pointer" onClick={() => setIsDialogOpen(true)}>
              <img
                src={`${API_BASE_URL}/${menu.foto}`}
                alt={menu.nama_makanan}
                className="w-full h-48 object-cover"
                
              />
              {discountPercentage > 0 && (
                <Badge className="absolute top-2 right-2 bg-red-500">{discountPercentage}% OFF</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-grow">
            <CardTitle className="line-clamp-1 cursor-pointer" onClick={() => setIsDialogOpen(true)}>
              {menu.nama_makanan}
            </CardTitle>
            <div className="mt-2">
              {discountPercentage > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">Rp{discountedPrice.toLocaleString()}</span>
                  <span className="text-sm text-gray-500 line-through">Rp{originalPrice.toLocaleString()}</span>
                </div>
              ) : (
                <span className="text-lg font-bold text-primary">Rp{originalPrice.toLocaleString()}</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2 cursor-pointer" onClick={() => setIsDialogOpen(true)}>
              {menu.deskripsi}
            </p>
            {menu.nama_diskon && (
              <Badge variant="outline" className="mt-2">
                {menu.nama_diskon}
              </Badge>
            )}
          </CardContent>
          <CardFooter className="p-4 border-t">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity === 0}>
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={incrementQuantity}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleAddToCart} disabled={quantity === 0}>
                Add to Cart
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Menu Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl p-0 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 max-h-[80vh] md:max-h-[70vh] overflow-hidden">
            <div className="relative h-48 sm:h-56 md:h-full overflow-hidden">
              <img
                src={`${API_BASE_URL}/${menu.foto}`}
                alt={menu.nama_makanan}
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=400&width=600"
                }}
              />
              {discountPercentage > 0 && (
                <Badge className="absolute top-2 right-2 bg-red-500">{discountPercentage}% OFF</Badge>
              )}
            </div>
            <div className="p-4 sm:p-6 flex flex-col overflow-y-auto max-h-[50vh] md:max-h-[70vh]">
              <DialogHeader className="pb-2">
                <DialogTitle className="text-xl sm:text-2xl font-bold line-clamp-2">{menu.nama_makanan}</DialogTitle>
              </DialogHeader>

              <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                {menu.jenis && <Badge variant="outline">{menu.jenis === "makanan" ? "Food" : "Beverage"}</Badge>}
                {menu.nama_diskon && (
                  <Badge variant="outline" className="bg-primary/10">
                    {menu.nama_diskon}
                  </Badge>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  {discountPercentage > 0 ? (
                    <>
                      <span className="text-lg sm:text-xl font-bold text-primary">
                        Rp{discountedPrice.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 line-through">Rp{originalPrice.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="text-lg sm:text-xl font-bold text-primary">
                      Rp{originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-grow">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Description</h3>
                <p className="text-sm sm:text-base text-gray-700">{menu.deskripsi}</p>
              </div>

              <div className="pt-4 mt-auto border-t">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity === 0}>
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{quantity}</span>
                    <Button variant="outline" size="icon" onClick={incrementQuantity}>
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={handleAddToCart} disabled={quantity === 0}>
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MenuCard
