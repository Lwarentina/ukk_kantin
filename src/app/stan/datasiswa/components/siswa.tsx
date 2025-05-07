"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { Plus, Trash, Edit } from "lucide-react"
import axios from "axios"
import debounce from "lodash.debounce"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card"
import Navbar from "@/app/stan/navbar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

const MotionCard = motion(Card)

const SiswaList = () => {
  const [search, setSearch] = useState("")
  const [siswaData, setSiswaData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [openForm, setOpenForm] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    id: "",
    nama_siswa: "",
    alamat: "",
    telp: "",
    username: "",
    password: "",
    foto: null as File | null,
  })
  const [isEditMode, setIsEditMode] = useState(false)

  const fetchSiswa = useCallback(async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    setLoading(true)
    try {
      const response = await axios.post(
        "https://ukk-p2.smktelkom-mlg.sch.id/api/get_siswa",
        { search },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            makerID: "3",
          },
        },
      )
      setSiswaData(response.data.data || [])
    } catch (err) {
      console.error("Error fetching siswa:", err)
      toast({
        title: "Error",
        description: "Failed to fetch student data. Please try again.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }, [search])

  const debouncedSearch = useCallback(
    debounce(() => {
      fetchSiswa()
    }, 500),
    [fetchSiswa],
  )

  useEffect(() => {
    debouncedSearch()
    return () => debouncedSearch.cancel()
  }, [debouncedSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, foto: e.target.files[0] })
    }
  }

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    if (!formData.nama_siswa || !formData.alamat || !formData.telp || !formData.username) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      })
      return
    }

    setAddLoading(true)

    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) {
        data.append(key, value)
      }
    })

    try {
      const url = isEditMode
        ? `https://ukk-p2.smktelkom-mlg.sch.id/api/ubah_siswa/${formData.id}`
        : "https://ukk-p2.smktelkom-mlg.sch.id/api/tambah_siswa"

      await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          makerID: "3",
          "Content-Type": "multipart/form-data",
        },
      })

      setFormData({
        id: "",
        nama_siswa: "",
        alamat: "",
        telp: "",
        username: "",
        password: "",
        foto: null,
      })
      setOpenForm(false)
      setIsEditMode(false)
      toast({
        title: "Success",
        description: `Student ${isEditMode ? "updated" : "added"} successfully!`,
      })
      fetchSiswa()
    } catch (err) {
      console.error(`Error ${isEditMode ? "updating" : "adding"} student:`, err)
      toast({
        title: "Error",
        description: `There was an error while ${isEditMode ? "updating" : "adding"} the student. Please try again.`,
        variant: "destructive",
      })
    }

    setAddLoading(false)
  }

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      await axios.delete(`https://ukk-p2.smktelkom-mlg.sch.id/api/hapus_siswa/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          makerID: "3",
        },
      })

      setDeleteDialogOpen(false)
      setItemToDelete(null)
      toast({
        title: "Success",
        description: "Student deleted successfully!",
      })
      fetchSiswa()
    } catch (err) {
      console.error("Error deleting student:", err)
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (siswa: any) => {
    setFormData({
      id: siswa.id,
      nama_siswa: siswa.nama_siswa,
      alamat: siswa.alamat,
      telp: siswa.telp,
      username: siswa.username,
      password: "",
      foto: null,
    })
    setIsEditMode(true)
    setOpenForm(true)
  }

  const handleAdd = () => {
    setFormData({
      id: "",
      nama_siswa: "",
      alamat: "",
      telp: "",
      username: "",
      password: "",
      foto: null,
    })
    setIsEditMode(false)
    setOpenForm(true)
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Search Students"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow"
          />
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
              {siswaData.length > 0 ? (
                siswaData.map((siswa) => (
                  <MotionCard
                    key={siswa.id}
                    className="overflow-hidden cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardHeader className="p-0">
                      <img
                        src={siswa.foto ? `https://ukk-p2.smktelkom-mlg.sch.id/${siswa.foto}` : "/placeholder.svg"}
                        alt={siswa.nama_siswa}
                        className="w-full h-36 object-cover"
                      />
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle>{siswa.nama_siswa}</CardTitle>
                      <p className="text-sm text-gray-600 mt-2">{siswa.alamat}</p>
                      <p className="text-sm text-gray-600">{siswa.telp}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end p-4">
                      <Button
                        variant="outline"
                        size="icon"
                        className="mr-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(siswa)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setItemToDelete(siswa.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
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
                  <p className="text-xl text-gray-500">No students found.</p>
                </motion.div>
              )}

              <Dialog open={openForm} onOpenChange={setOpenForm}>
                <DialogTrigger asChild>
                  <MotionCard
                    className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAdd}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <motion.div initial={{ rotate: 0 }} whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}>
                        <Plus className="h-12 w-12 text-gray-400 mb-2" />
                      </motion.div>
                      <p className="text-lg font-medium text-gray-600">Add Student</p>
                    </CardContent>
                  </MotionCard>
                </DialogTrigger>
                <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Student" : "Add New Student"}</DialogTitle>
                  </DialogHeader>
                  <motion.div
                    className="grid gap-4 py-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Input
                      name="nama_siswa"
                      placeholder="Full Name"
                      value={formData.nama_siswa}
                      onChange={handleInputChange}
                    />
                    <Input name="alamat" placeholder="Address" value={formData.alamat} onChange={handleInputChange} />
                    <Input name="telp" placeholder="Phone Number" value={formData.telp} onChange={handleInputChange} />
                    <Input
                      name="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                    <Input
                      name="password"
                      type="password"
                      placeholder={isEditMode ? "New Password (optional)" : "Password"}
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input"
                    />
                  </motion.div>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto order-2 sm:order-1"
                      onClick={() => {
                        setOpenForm(false)
                        setIsEditMode(false)
                        setFormData({
                          id: "",
                          nama_siswa: "",
                          alamat: "",
                          telp: "",
                          username: "",
                          password: "",
                          foto: null,
                        })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="w-full sm:w-auto order-1 sm:order-2"
                      onClick={handleSubmit}
                      disabled={addLoading}
                    >
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
                <DialogContent className="w-[95vw] sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this student? This action cannot be undone.
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
                      onClick={() => itemToDelete && handleDelete(itemToDelete)}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default SiswaList