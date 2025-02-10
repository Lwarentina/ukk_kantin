"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Navbar from "./navbar"
import Order from "./dashboardcomp/order"
import Income from "./dashboardcomp/income"
import History from "./dashboardcomp/history"

interface StanData {
  id: number
  nama_stan: string
  nama_pemilik: string
  telp: string
  username: string
}

const DashboardStan = () => {
  const [stanData, setStanData] = useState<StanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [editData, setEditData] = useState<StanData | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      window.location.href = "/"
      return
    }

    const fetchStanData = async () => {
      try {
        const response = await axios.get("https://ukk-p2.smktelkom-mlg.sch.id/api/get_stan", {
          headers: { Authorization: `Bearer ${token}`, makerID: "3" },
        })
        setStanData(response.data.data)
        setEditData(response.data.data)
      } catch (err: any) {
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStanData()
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editData) {
      setEditData({ ...editData, [e.target.name]: e.target.value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    const token = localStorage.getItem("authToken")
    if (!token || !editData) return

    try {
      await axios.post(
        `https://ukk-p2.smktelkom-mlg.sch.id/api/update_stan/${editData.id}`,
        {
          nama_stan: editData.nama_stan,
          nama_pemilik: editData.nama_pemilik,
          telp: editData.telp,
          username: editData.username,
        },
        {
          headers: { Authorization: `Bearer ${token}`, makerID: "3" },
        },
      )
      setStanData(editData)
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
      setDialogOpen(false)
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div
          className="h-16 w-16 rounded-full border-t-2 border-b-2 border-gray-900"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your stan profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label>Stan Name</Label>
                  <p className="text-lg">{stanData?.nama_stan}</p>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label>Owner Name</Label>
                  <p className="text-lg">{stanData?.nama_pemilik}</p>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label>Phone Number</Label>
                  <p className="text-lg">{stanData?.telp}</p>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label>Username</Label>
                  <p className="text-lg">{stanData?.username}</p>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Edit Profile</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="nama_stan" className="text-right">
                            Stan Name
                          </Label>
                          <Input
                            id="nama_stan"
                            name="nama_stan"
                            value={editData?.nama_stan || ""}
                            onChange={handleInputChange}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="nama_pemilik" className="text-right">
                            Owner Name
                          </Label>
                          <Input
                            id="nama_pemilik"
                            name="nama_pemilik"
                            value={editData?.nama_pemilik || ""}
                            onChange={handleInputChange}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="telp" className="text-right">
                            Phone
                          </Label>
                          <Input
                            id="telp"
                            name="telp"
                            value={editData?.telp || ""}
                            onChange={handleInputChange}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="username" className="text-right">
                            Username
                          </Label>
                          <Input
                            id="username"
                            name="username"
                            value={editData?.username || ""}
                            onChange={handleInputChange}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={updating}>
                          {updating ? (
                            <motion.div
                              className="h-5 w-5 rounded-full border-t-2 border-b-2 border-white"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            />
                          ) : (
                            "Save changes"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Manage your orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Order />
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Income</CardTitle>
              <CardDescription>View your income</CardDescription>
            </CardHeader>
            <CardContent>
              <Income />
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>View your order history</CardDescription>
            </CardHeader>
            <CardContent>
              <History />
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

export default DashboardStan

