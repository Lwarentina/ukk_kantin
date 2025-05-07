"use client"

import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import MenuCard from "./components/menu-card"

const API_BASE_URL = "https://ukk-p2.smktelkom-mlg.sch.id/api"

export default function SiswaMenuPage() {
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [discountedMenus, setDiscountedMenus] = useState<any[]>([])
  const [foodMenus, setFoodMenus] = useState<any[]>([])
  const [drinkMenus, setDrinkMenus] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMenus = useCallback(async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    setLoading(true)
    try {
      // Fetch all menu types in parallel
      const [discountedResponse, foodResponse, drinkResponse] = await Promise.all([
        axios.post(
          `${API_BASE_URL}/getmenudiskonsiswa`,
          { search },
          {
            headers: { Authorization: `Bearer ${token}`, makerID: "3" },
          },
        ),
        axios.post(
          `${API_BASE_URL}/getmenufood`,
          { search },
          {
            headers: { Authorization: `Bearer ${token}`, makerID: "3" },
          },
        ),
        axios.post(
          `${API_BASE_URL}/getmenudrink`,
          { search },
          {
            headers: { Authorization: `Bearer ${token}`, makerID: "3" },
          },
        ),
      ])

      // Process discounted menus to ensure they have the correct properties
      const processedDiscountedMenus = (discountedResponse.data.data || []).map((menu: any) => {
        // Make sure each menu has the necessary properties
        return {
          ...menu,
          id_menu: menu.id_menu || menu.id,
          persentase_diskon: menu.persentase_diskon || 0,
          nama_diskon: menu.nama_diskon || null,
        }
      })

      setDiscountedMenus(processedDiscountedMenus)
      setFoodMenus(foodResponse.data.data || [])
      setDrinkMenus(drinkResponse.data.data || [])
    } catch (err: any) {
      console.error("Error fetching menus:", err)
      toast({
        title: "Error",
        description: "Failed to fetch menu items. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  // Filter menus based on filter type
  const getFilteredMenus = () => {
    switch (filterType) {
      case "discounted":
        return discountedMenus
      case "makanan":
        return foodMenus
      case "minuman":
        return drinkMenus
      default:
        // Combine all menus for "all" filter
        return [...discountedMenus, ...foodMenus, ...drinkMenus]
    }
  }

  const filteredMenus = getFilteredMenus()

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Menu</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search Menu"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="discounted">Discounted</SelectItem>
                <SelectItem value="makanan">Food</SelectItem>
                <SelectItem value="minuman">Drinks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <motion.div
            className="flex justify-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            ></motion.div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredMenus.length > 0 ? (
                filteredMenus.map((menu) => <MenuCard key={`${menu.id_menu || menu.id}-${menu.jenis}`} menu={menu} />)
              ) : (
                <motion.div
                  className="col-span-full text-center mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-xl text-gray-500">No menu items found.</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
