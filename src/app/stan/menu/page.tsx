"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { Plus, Trash, Edit } from "lucide-react"
import axios from "axios"
import debounce from "lodash.debounce"
import { FileDrop } from "react-file-drop"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import Navbar from "../navbar"
import MenuItemDialog from "./modal"

const MotionCard = motion(Card)

const MenuList = () => {
  const [search, setSearch] = useState("")
  const [menuData, setMenuData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [openForm, setOpenForm] = useState(false)
  const [filterType, setFilterType] = useState("all")
  const [addLoading, setAddLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    id: "",
    nama_makanan: "",
    jenis: "makanan",
    harga: "",
    deskripsi: "",
    foto: null as File | null,
  })
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMenu, setNewMenu] = useState({
    nama_makanan: "",
    jenis: "",
    harga: "",
    deskripsi: "",
    foto: null as File | null,
  })
  const [editMenu, setEditMenu] = useState({
    id: "",
    nama_makanan: "",
    jenis: "",
    harga: "",
    deskripsi: "",
    foto: null as File | null,
  })
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    return () => {
      // Clean up any object URLs when component unmounts
      if (formData.foto) {
        URL.revokeObjectURL(URL.createObjectURL(formData.foto))
      }
    }
  }, [formData.foto])

  const fetchMenu = useCallback(async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    setLoading(true)
    try {
      const response = await axios.post(
        "https://ukk-p2.smktelkom-mlg.sch.id/api/showmenu",
        { search },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            makerID: "3",
          },
        },
      )
      setMenuData(response.data.data)
    } catch (err: any) {
      console.error("Error fetching menu:", err)
      toast({
        title: "Error",
        description: "Failed to fetch menu items. Please try again.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }, [search])

  const debouncedSearch = useCallback(
    debounce(() => {
      fetchMenu()
    }, 500),
    [fetchMenu],
  )

  useEffect(() => {
    debouncedSearch()
    return () => debouncedSearch.cancel()
  }, [debouncedSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, foto: e.target.files[0] })
    }
  }

  const handleDeleteMenu = async (id: string) => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      await axios.delete(`https://ukk-p2.smktelkom-mlg.sch.id/api/hapus_menu/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          makerID: "3",
        },
      })

      setDeleteDialogOpen(false)
      setItemToDelete(null)
      toast({
        title: "Success",
        description: "Menu item deleted successfully!",
      })
      fetchMenu()
    } catch (err) {
      console.error("Error deleting menu:", err)
      toast({
        title: "Error",
        description: "Failed to delete menu item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    if (!formData.nama_makanan || !formData.harga || !formData.deskripsi || (!isEditMode && !formData.foto)) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      })
      return
    }

    setAddLoading(true)

    const data = new FormData()
    data.append("nama_makanan", formData.nama_makanan)
    data.append("jenis", formData.jenis)
    data.append("harga", formData.harga)
    data.append("deskripsi", formData.deskripsi)
    if (formData.foto) data.append("foto", formData.foto)
    if (!isEditMode) {
      data.append("maker_id", "3")
      data.append("id_stan", "8")
    }

    try {
      const url = isEditMode
        ? `https://ukk-p2.smktelkom-mlg.sch.id/api/updatemenu/${formData.id}`
        : "https://ukk-p2.smktelkom-mlg.sch.id/api/tambahmenu"

      await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          makerID: "3",
          "Content-Type": "multipart/form-data",
        },
      })

      setFormData({
        id: "",
        nama_makanan: "",
        jenis: "makanan",
        harga: "",
        deskripsi: "",
        foto: null,
      })
      setOpenForm(false)
      setIsEditMode(false)
      toast({
        title: "Success",
        description: `Menu item ${isEditMode ? "updated" : "added"} successfully!`,
      })
      fetchMenu()
    } catch (err) {
      console.error(`Error ${isEditMode ? "updating" : "adding"} menu:`, err)
      toast({
        title: "Error",
        description: `There was an error while ${isEditMode ? "updating" : "adding"} the menu item. Please try again.`,
        variant: "destructive",
      })
    }

    setAddLoading(false)
  }

  const handleDragOver = () => setIsDragging(true)
  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (files: FileList | null, event: React.DragEvent<HTMLDivElement> | null) => {
    setIsDragging(false)
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("image/")) {
        setFormData({ ...formData, foto: file })
      } else {
        toast({
          title: "Error",
          description: "Please upload an image file",
          variant: "destructive",
        })
      }
    }
  }

  const handleEditMenu = (menu: any) => {
    setFormData({
      id: menu.id,
      nama_makanan: menu.nama_makanan,
      jenis: menu.jenis,
      harga: menu.harga,
      deskripsi: menu.deskripsi,
      foto: null,
    })
    setIsEditMode(true)
    setOpenForm(true)
  }

  const handleOpenDialog = (item: any) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }

  const DeleteButton = ({
    onClick,
  }: {
    onClick: (e: React.MouseEvent) => void
  }) => (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <Button variant="destructive" size="icon" className="rounded-full p-2" onClick={onClick}>
        <Trash className="h-4 w-4" />
      </Button>
    </motion.div>
  )

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search Menu"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow"
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="makanan">Makanan</SelectItem>
              <SelectItem value="minuman">Minuman</SelectItem>
            </SelectContent>
          </Select>
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
              {menuData.length > 0 ? (
                menuData
                  .filter((menu) => (filterType !== "all" ? menu.jenis === filterType : true))
                  .map((menu) => (
                    <MotionCard
                      key={menu.id}
                      className="overflow-hidden cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handleOpenDialog(menu)}
                    >
                      <CardHeader className="p-0">
                        <img
                          src={`https://ukk-p2.smktelkom-mlg.sch.id/${menu.foto}`}
                          alt={menu.nama_makanan}
                          className="w-full h-36 object-cover"
                        />
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle>{menu.nama_makanan}</CardTitle>
                        <p className="text-md font-bold text-primary mt-2">Rp{menu.harga}</p>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{menu.deskripsi}</p>
                      </CardContent>
                      <CardFooter className="flex justify-end p-4">
                        <Button
                          variant="outline"
                          size="icon"
                          className="mr-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditMenu(menu)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DeleteButton
                          onClick={(e) => {
                            e.stopPropagation()
                            setItemToDelete(menu.id)
                            setDeleteDialogOpen(true)
                          }}
                        />
                      </CardFooter>
                    </MotionCard>
                  ))
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

              <Dialog open={openForm} onOpenChange={setOpenForm}>
                <DialogTrigger asChild>
                  <MotionCard
                    className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <motion.div initial={{ rotate: 0 }} whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}>
                        <Plus className="h-12 w-12 text-gray-400 mb-2" />
                      </motion.div>
                      <p className="text-lg font-medium text-gray-600">Add Menu</p>
                    </CardContent>
                  </MotionCard>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Menu" : "Add New Menu"}</DialogTitle>
                  </DialogHeader>
                  <motion.div
                    className="grid gap-4 py-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Input
                      name="nama_makanan"
                      placeholder="Name"
                      value={formData.nama_makanan}
                      onChange={handleInputChange}
                    />
                    <Input
                      name="harga"
                      type="number"
                      placeholder="Price"
                      value={formData.harga}
                      onChange={handleInputChange}
                    />
                    <Select
                      name="jenis"
                      value={formData.jenis}
                      onValueChange={(value) => setFormData({ ...formData, jenis: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="makanan">Makanan</SelectItem>
                        <SelectItem value="minuman">Minuman</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      name="deskripsi"
                      placeholder="Description"
                      value={formData.deskripsi}
                      onChange={handleInputChange}
                    />
                    <FileDrop
                      onDrop={(files, event) => handleDrop(files, event)}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <div
                        className={`border-2 border-dashed p-8 rounded-lg text-center cursor-pointer transition-colors ${
                          isDragging ? "border-primary bg-primary/10" : "border-gray-300"
                        }`}
                      >
                        <p className="text-sm text-gray-500 mb-2">
                          {isDragging ? "Release to upload!" : "Drag & Drop an image here or click below"}
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          id="fileUpload"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <label htmlFor="fileUpload">
                          <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => document.getElementById("fileUpload")?.click()}
                          >
                            Select Image
                          </Button>
                        </label>
                        {formData.foto && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-500">{formData.foto.name}</p>
                            <img
                              src={URL.createObjectURL(formData.foto) || "/placeholder.svg"}
                              alt="Preview"
                              className="mt-2 max-h-[150px] object-cover rounded-md shadow-sm"
                              onLoad={() => {
                                // Revoke the object URL after the image has loaded to avoid memory leaks
                                URL.revokeObjectURL(URL.createObjectURL(formData.foto!))
                              }}
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="mt-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                setFormData({ ...formData, foto: null })
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </FileDrop>
                  </motion.div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOpenForm(false)
                        setIsEditMode(false)
                        setFormData({
                          id: "",
                          nama_makanan: "",
                          jenis: "makanan",
                          harga: "",
                          deskripsi: "",
                          foto: null,
                        })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={addLoading}>
                      {addLoading ? (
                        <motion.div
                          className="rounded-full h-4 w-4 border-t-2 border-b-2 border-white"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                        ></motion.div>
                      ) : isEditMode ? (
                        "Update"
                      ) : (
                        "Add"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this menu item? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="sm:justify-end">
                    <Button type="button" variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => itemToDelete && handleDeleteMenu(itemToDelete)}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </motion.div>
          </AnimatePresence>
        )}
        {selectedItem && (
          <MenuItemDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} item={selectedItem} />
        )}
      </div>
    </div>
  )
}

export default MenuList
