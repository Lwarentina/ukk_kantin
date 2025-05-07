"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { format, parseISO } from "date-fns"
import { Plus, Trash, Edit, Search, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import Navbar from "@/app/stan/navbar"
import { Checkbox } from "@/components/ui/checkbox"

const API_BASE_URL = "https://ukk-p2.smktelkom-mlg.sch.id/api"

const DiscountManagement = () => {
  const [search, setSearch] = useState("")
  const [discounts, setDiscounts] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [menuLoading, setMenuLoading] = useState(false)
  const [openForm, setOpenForm] = useState(false)
  const [openMenuForm, setOpenMenuForm] = useState(false)
  const [formMode, setFormMode] = useState<"add" | "edit" | "view">("add")
  const [selectedDiscount, setSelectedDiscount] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    id: "",
    nama_diskon: "",
    persentase_diskon: "",
    tanggal_awal: "",
    tanggal_akhir: "",
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([])
  const [discountedMenus, setDiscountedMenus] = useState<any[]>([])

  const fetchDiscounts = useCallback(async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    setLoading(true)
    try {
      const response = await axios.post(
        `${API_BASE_URL}/getmenudiskon`,
        { search },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            makerID: "3",
          },
        },
      )
      setDiscounts(response.data.data || [])
    } catch (err: any) {
      console.error("Error fetching discounts:", err)
      toast({
        title: "Error",
        description: "Failed to fetch discount data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [search])

  const fetchMenuItems = useCallback(async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    setMenuLoading(true)
    try {
      const response = await axios.post(
        `${API_BASE_URL}/showmenu`,
        { search: "" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            makerID: "3",
          },
        },
      )
      setMenuItems(response.data.data || [])
    } catch (err: any) {
      console.error("Error fetching menu items:", err)
      toast({
        title: "Error",
        description: "Failed to fetch menu items. Please try again.",
        variant: "destructive",
      })
    } finally {
      setMenuLoading(false)
    }
  }, [])

  const fetchDiscountedMenus = useCallback(async (discountId: string) => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      const response = await axios.get(`${API_BASE_URL}/getmenubydiskon/${discountId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          makerID: "3",
        },
      })

      // Extract menu IDs from the response
      const menuIds = (response.data.data || []).map((item: any) => item.id_menu.toString())
      setDiscountedMenus(response.data.data || [])
      setSelectedMenuItems(menuIds)
    } catch (err: any) {
      console.error("Error fetching discounted menus:", err)
      toast({
        title: "Error",
        description: "Failed to fetch discounted menus. Please try again.",
        variant: "destructive",
      })
    }
  }, [])

  useEffect(() => {
    fetchDiscounts()
  }, [fetchDiscounts])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    // Validate form data
    if (!formData.nama_diskon || !formData.persentase_diskon || !formData.tanggal_awal || !formData.tanggal_akhir) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      })
      return
    }

    // Validate percentage is a number between 1 and 100
    const percentage = Number(formData.persentase_diskon)
    if (isNaN(percentage) || percentage < 1 || percentage > 100) {
      toast({
        title: "Error",
        description: "Discount percentage must be between 1 and 100.",
        variant: "destructive",
      })
      return
    }

    setSubmitLoading(true)

    const data = new FormData()
    data.append("nama_diskon", formData.nama_diskon)
    data.append("persentase_diskon", formData.persentase_diskon)
    data.append("tanggal_awal", formData.tanggal_awal)
    data.append("tanggal_akhir", formData.tanggal_akhir)

    try {
      const url = formMode === "add" ? `${API_BASE_URL}/tambahdiskon` : `${API_BASE_URL}/updatediskon/${formData.id}`

      await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          makerID: "3",
        },
      })

      setFormData({
        id: "",
        nama_diskon: "",
        persentase_diskon: "",
        tanggal_awal: "",
        tanggal_akhir: "",
      })
      setOpenForm(false)
      toast({
        title: "Success",
        description: `Discount ${formMode === "add" ? "added" : "updated"} successfully!`,
      })
      fetchDiscounts()
    } catch (err) {
      console.error(`Error ${formMode === "add" ? "adding" : "updating"} discount:`, err)
      toast({
        title: "Error",
        description: `There was an error while ${formMode === "add" ? "adding" : "updating"} the discount. Please try again.`,
        variant: "destructive",
      })
    }

    setSubmitLoading(false)
  }

  const handleDeleteDiscount = async (id: string) => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      await axios.delete(`${API_BASE_URL}/hapus_diskon/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          makerID: "3",
        },
      })

      setDeleteDialogOpen(false)
      setItemToDelete(null)
      toast({
        title: "Success",
        description: "Discount deleted successfully!",
      })
      fetchDiscounts()
    } catch (err) {
      console.error("Error deleting discount:", err)
      toast({
        title: "Error",
        description: "Failed to delete discount. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleManageMenus = async (discount: any) => {
    setSelectedDiscount(discount)
    await fetchMenuItems()
    await fetchDiscountedMenus(discount.id)
    setOpenMenuForm(true)
  }

  const handleToggleMenuItem = (menuId: string) => {
    setSelectedMenuItems((prev) => {
      if (prev.includes(menuId)) {
        return prev.filter((id) => id !== menuId)
      } else {
        return [...prev, menuId]
      }
    })
  }

  const handleSaveDiscountedMenus = async () => {
    const token = localStorage.getItem("authToken")
    if (!token || !selectedDiscount) return

    setSubmitLoading(true)

    try {
      // First, remove all existing menu-discount associations
      const currentMenuIds = discountedMenus.map((item) => item.id_menu.toString())

      // Add new menu-discount associations
      for (const menuId of selectedMenuItems) {
        if (!currentMenuIds.includes(menuId)) {
          // This is a new menu to add
          const formData = new FormData()
          formData.append("id_diskon", selectedDiscount.id)
          formData.append("id_menu", menuId)

          await axios.post(`${API_BASE_URL}/insert_menu_diskon`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              makerID: "3",
            },
          })
        }
      }

      // Remove menus that were deselected
      for (const menuId of currentMenuIds) {
        if (!selectedMenuItems.includes(menuId)) {
          // Find the menu_diskon id to delete
          const menuDiskonItem = discountedMenus.find((item) => item.id_menu.toString() === menuId)
          if (menuDiskonItem && menuDiskonItem.id) {
            await axios.delete(`${API_BASE_URL}/hapus_menu_diskon/${menuDiskonItem.id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                makerID: "3",
              },
            })
          }
        }
      }

      toast({
        title: "Success",
        description: "Discounted menus updated successfully!",
      })

      setOpenMenuForm(false)
      fetchDiscounts()
    } catch (err) {
      console.error("Error updating discounted menus:", err)
      toast({
        title: "Error",
        description: "Failed to update discounted menus. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd MMM yyyy")
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Discount Management</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search discounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
            <Button
              onClick={() => {
                setFormData({
                  id: "",
                  nama_diskon: "",
                  persentase_diskon: "",
                  tanggal_awal: "",
                  tanggal_akhir: "",
                })
                setFormMode("add")
                setOpenForm(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Discount
            </Button>
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              {discounts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Discount %</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Discounted Items</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {discounts.map((discount) => (
                        <TableRow key={discount.id}>
                          <TableCell className="font-medium">{discount.nama_diskon}</TableCell>
                          <TableCell>{discount.persentase_diskon}%</TableCell>
                          <TableCell>{formatDate(discount.tanggal_awal)}</TableCell>
                          <TableCell>{formatDate(discount.tanggal_akhir)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{discount.menu_diskon?.length || 0} items</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleManageMenus(discount)}>
                                Manage Items
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSelectedDiscount(discount)
                                  setFormData({
                                    id: discount.id,
                                    nama_diskon: discount.nama_diskon,
                                    persentase_diskon: discount.persentase_diskon,
                                    tanggal_awal: discount.tanggal_awal.split(" ")[0],
                                    tanggal_akhir: discount.tanggal_akhir.split(" ")[0],
                                  })
                                  setFormMode("edit")
                                  setOpenForm(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => {
                                  setItemToDelete(discount.id)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-xl text-gray-500">No discounts found.</p>
                  <p className="text-gray-400 mt-2">Add a new discount to get started.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Add/Edit Discount Dialog */}
        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogContent className="w-[95vw] sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{formMode === "add" ? "Add New Discount" : "Edit Discount"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="nama_diskon" className="text-sm font-medium">
                  Discount Name
                </label>
                <Input
                  id="nama_diskon"
                  name="nama_diskon"
                  placeholder="Enter discount name"
                  value={formData.nama_diskon}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="persentase_diskon" className="text-sm font-medium">
                  Discount Percentage (%)
                </label>
                <Input
                  id="persentase_diskon"
                  name="persentase_diskon"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Enter percentage (1-100)"
                  value={formData.persentase_diskon}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <label htmlFor="tanggal_awal" className="text-sm font-medium">
                    Start Date
                  </label>
                  <Input
                    id="tanggal_awal"
                    name="tanggal_awal"
                    type="date"
                    value={formData.tanggal_awal}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <label htmlFor="tanggal_akhir" className="text-sm font-medium">
                    End Date
                  </label>
                  <Input
                    id="tanggal_akhir"
                    name="tanggal_akhir"
                    type="date"
                    value={formData.tanggal_akhir}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="w-full sm:w-auto order-2 sm:order-1"
                onClick={() => setOpenForm(false)}
              >
                Cancel
              </Button>
              <Button className="w-full sm:w-auto order-1 sm:order-2" onClick={handleSubmit} disabled={submitLoading}>
                {submitLoading ? (
                  <motion.div
                    className="rounded-full h-4 w-4 border-t-2 border-b-2 border-white"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  ></motion.div>
                ) : formMode === "edit" ? (
                  "Update"
                ) : (
                  "Add"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Menu Items Dialog */}
        <Dialog open={openMenuForm} onOpenChange={setOpenMenuForm}>
          <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Discounted Items</DialogTitle>
              <DialogDescription>
                Select menu items to apply the "{selectedDiscount?.nama_diskon}" discount (
                {selectedDiscount?.persentase_diskon}%)
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="mb-4">
                <Input
                  placeholder="Search menu items..."
                  onChange={(e) => {
                    // Local search within already fetched menu items
                    // This doesn't trigger a new API call
                  }}
                />
              </div>

              {menuLoading ? (
                <div className="flex justify-center py-8">
                  <motion.div
                    className="rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  ></motion.div>
                </div>
              ) : (
                <div className="border rounded-md divide-y max-h-[400px] overflow-y-auto">
                  {menuItems.length > 0 ? (
                    menuItems.map((menu) => (
                      <div key={menu.id_menu || menu.id} className="flex items-center p-3 hover:bg-gray-50">
                        <Checkbox
                          id={`menu-${menu.id_menu || menu.id}`}
                          checked={selectedMenuItems.includes((menu.id_menu || menu.id).toString())}
                          onCheckedChange={() => handleToggleMenuItem((menu.id_menu || menu.id).toString())}
                          className="mr-3"
                        />
                        <div className="flex items-center flex-1">
                          <img
                            src={`${API_BASE_URL}/${menu.foto}`}
                            alt={menu.nama_makanan}
                            className="w-12 h-12 object-cover rounded-md mr-3"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=48&width=48"
                            }}
                          />
                          <div>
                            <label htmlFor={`menu-${menu.id_menu || menu.id}`} className="font-medium cursor-pointer">
                              {menu.nama_makanan}
                            </label>
                            <p className="text-sm text-gray-500">Rp{Number(menu.harga).toLocaleString()}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{menu.jenis === "makanan" ? "Food" : "Drink"}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">No menu items found</div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 text-sm text-gray-500">{selectedMenuItems.length} items selected</div>
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setOpenMenuForm(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button className="w-full sm:w-auto" onClick={handleSaveDiscountedMenus} disabled={submitLoading}>
                {submitLoading ? (
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
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="w-[95vw] sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this discount? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto order-2 sm:order-1"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto order-1 sm:order-2"
                onClick={() => itemToDelete && handleDeleteDiscount(itemToDelete)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default DiscountManagement
