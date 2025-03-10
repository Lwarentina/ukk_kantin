"use client"

import type React from "react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { Plus, Trash, Edit } from "lucide-react"
import axios from "axios"
import debounce from "lodash.debounce"
import { motion, AnimatePresence } from "framer-motion"
import { FileDrop } from "react-file-drop"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import Navbar from "../navbar"

const API_BASE_URL = "https://ukk-p2.smktelkom-mlg.sch.id/api"
const MAKER_ID = "3"

const MotionCard = motion(Card)

const SiswaList = () => {
  const [search, setSearch] = useState("")
  const [siswaData, setSiswaData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [openForm, setOpenForm] = useState(false)
  const [formMode, setFormMode] = useState<"add" | "edit">("add")
  const [selectedSiswa, setSelectedSiswa] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    nama_siswa: "",
    alamat: "",
    telp: "",
    username: "",
    password: "",
    foto: null as File | null,
  })
  const [isDragging, setIsDragging] = useState(false)

  const fetchSiswa = useCallback(async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    setLoading(true)
    try {
      const response = await axios.post(
        `${API_BASE_URL}/get_siswa`,
        { search },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            makerID: MAKER_ID,
          },
        },
      )
      setSiswaData(response.data.data || [])
    } catch (err: any) {
      console.error("Error fetching siswa:", err)
      toast({
        title: "Error",
        description: "Failed to fetch student data. Please try again.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }, [search])

  const debouncedSearch = useMemo(() => debounce(() => fetchSiswa(), 500), [fetchSiswa])

  useEffect(() => {
    debouncedSearch()
    return () => debouncedSearch.cancel()
  }, [debouncedSearch])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, foto: e.target.files![0] }))
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) {
        data.append(key, value)
      }
    })

    try {
      const endpoint = formMode === "add" ? "tambah_siswa" : `ubah_siswa/${selectedSiswa?.id}`
      await axios.post(`${API_BASE_URL}/${endpoint}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          makerID: MAKER_ID,
          "Content-Type": "multipart/form-data",
        },
      })
      toast({
        title: "Success",
        description: `Student ${formMode === "add" ? "added" : "updated"} successfully!`,
      })
      setOpenForm(false)
      fetchSiswa()
    } catch (err) {
      console.error("Error submitting form:", err)
      toast({
        title: "Error",
        description: `Failed to ${formMode === "add" ? "add" : "update"} student. Please try again.`,
        variant: "destructive",
      })
    }
  }, [formMode, formData, selectedSiswa, fetchSiswa])

  const handleDelete = useCallback(
    async (id: string) => {
      const token = localStorage.getItem("authToken")
      if (!token) return

      try {
        await axios.delete(`${API_BASE_URL}/hapus_siswa/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            makerID: MAKER_ID,
          },
        })
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
    },
    [fetchSiswa],
  )

  const openEditForm = useCallback((siswa: any) => {
    setSelectedSiswa(siswa)
    setFormData({
      nama_siswa: siswa.nama_siswa,
      alamat: siswa.alamat,
      telp: siswa.telp,
      username: siswa.username,
      password: "",
      foto: null,
    })
    setFormMode("edit")
    setOpenForm(true)
  }, [])

  const handleDragOver = useCallback(() => setIsDragging(true), [])
  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const handleDrop = useCallback((files: FileList | null) => {
    setIsDragging(false)
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("image/")) {
        setFormData((prev) => ({ ...prev, foto: file }))
      } else {
        toast({
          title: "Error",
          description: "Please upload an image file",
          variant: "destructive",
        })
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Input
            placeholder="Search Students"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
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
                  <p className="text-lg font-medium text-gray-600">Add Student</p>
                </CardContent>
              </MotionCard>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{formMode === "add" ? "Add New Student" : "Edit Student"}</DialogTitle>
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
                <Input name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} />
                <FileDrop onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
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
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mt-2"
                          onClick={() => setFormData({ ...formData, foto: null })}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </FileDrop>
              </motion.div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>{formMode === "add" ? "Add" : "Update"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center mt-8">
            <motion.div
              className="rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            ></motion.div>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {siswaData.map((siswa) => (
                <MotionCard
                  key={siswa.id}
                  className="overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardHeader className="p-0">
                    <img
                      src={siswa.foto ? `${API_BASE_URL}/${siswa.foto}` : "/placeholder.svg"}
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
                    <Button variant="outline" size="icon" className="mr-2" onClick={() => openEditForm(siswa)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(siswa.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </MotionCard>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default SiswaList

