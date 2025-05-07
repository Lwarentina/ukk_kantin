"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import axios from "axios"
import { Store, LogOut, Menu, ShoppingCart, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"

const API_BASE_URL = "https://ukk-p2.smktelkom-mlg.sch.id/api"

const SiswaNavbar = () => {
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    nama_siswa: "",
    alamat: "",
    telp: "",
    username: "",
    foto: null as File | null,
  })
  const [updateLoading, setUpdateLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState(0)

  const fetchProfileData = useCallback(async () => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/")
      return
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/get_profile`, {
        headers: { Authorization: `Bearer ${token}`, makerID: "3" },
      })

      if (response.data && response.data.data) {
        setProfileData(response.data.data)
        setFormData({
          nama_siswa: response.data.data.nama_siswa || "",
          alamat: response.data.data.alamat || "",
          telp: response.data.data.telp || "",
          username: response.data.data.username || "",
          foto: null,
        })
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load profile.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchProfileData()

    // Get cart count from localStorage
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      setCartCount(cart.reduce((total: number, item: any) => total + item.quantity, 0))
    }

    updateCartCount()
    window.addEventListener("storage", updateCartCount)

    return () => {
      window.removeEventListener("storage", updateCartCount)
    }
  }, [fetchProfileData])

  const handleLogout = () => {
    // Clear cart when logging out
    localStorage.removeItem("cart")
    localStorage.removeItem("authToken")
    router.push("/")
  }

  const getInitials = (name: string) => {
    if (!name) return "US"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, foto: e.target.files[0] })
    }
  }

  const handleUpdateProfile = async () => {
    if (!profileData) return

    const token = localStorage.getItem("authToken")
    if (!token) return

    // Validate form data
    if (!formData.nama_siswa || !formData.alamat || !formData.telp || !formData.username) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      })
      return
    }

    setUpdateLoading(true)

    const data = new FormData()
    data.append("nama_siswa", formData.nama_siswa)
    data.append("alamat", formData.alamat)
    data.append("telp", formData.telp)
    data.append("username", formData.username)
    if (formData.foto) {
      data.append("foto", formData.foto)
    }

    try {
      // Use the ID from the profile data
      const userId = profileData.id

      if (!userId) {
        toast({
          title: "Error",
          description: "User ID not found. Please try again later.",
          variant: "destructive",
        })
        setUpdateLoading(false)
        return
      }

      await axios.post(`${API_BASE_URL}/update_siswa/${userId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          makerID: "3",
          "Content-Type": "multipart/form-data",
        },
      })

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })

      // Refresh profile data
      await fetchProfileData()
      setEditMode(false)
      setProfileOpen(false)
    } catch (err: any) {
      console.error("Error updating profile:", err)
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdateLoading(false)
    }
  }

  const closeProfileDialog = () => {
    setProfileOpen(false)
    setEditMode(false)
  }

  return (
    <>
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link className="flex items-center space-x-2 mr-6" href="/siswa">
              <Store className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">Kantin Sekolah</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
              <Link
                href="/siswa"
                className={`transition-colors ${pathname === "/siswa" ? "text-primary font-semibold" : "hover:text-primary"}`}
              >
                Menu
              </Link>
              <Link
                href="/siswa/orders"
                className={`transition-colors ${pathname === "/siswa/orders" ? "text-primary font-semibold" : "hover:text-primary"}`}
              >
                My Orders
              </Link>
              <Link
                href="/siswa/history"
                className={`transition-colors ${pathname === "/siswa/history" ? "text-primary font-semibold" : "hover:text-primary"}`}
              >
                History
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/siswa/cart">
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {loading ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : profileData ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 overflow-hidden">
                    {profileData && profileData.foto ? (
                      <img
                        src={`https://ukk-p2.smktelkom-mlg.sch.id/${profileData.foto}`}
                        alt={profileData.nama_siswa || "Profile"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(profileData?.nama_siswa || "User")}</AvatarFallback>
                      </Avatar>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{profileData?.nama_siswa || "User"}</span>
                      <span className="text-xs text-muted-foreground">{profileData?.username || ""}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setProfileOpen(true)
                      setEditMode(false)
                    }}
                  >
                    <div className="h-4 w-4 mr-2 rounded-full overflow-hidden">
                      {profileData && profileData.foto ? (
                        <img
                          src={`https://ukk-p2.smktelkom-mlg.sch.id/${profileData.foto}`}
                          alt={profileData.nama_siswa || "Profile"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Avatar className="h-4 w-4">
                          <AvatarFallback>{getInitials(profileData?.nama_siswa || "User")}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>US</AvatarFallback>
                </Avatar>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full md:hidden">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/siswa">Menu</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/siswa/orders">My Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/siswa/history">History</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Profile Dialog */}
      {profileData && (
        <Dialog open={profileOpen} onOpenChange={(isOpen) => setProfileOpen(isOpen)}>
          <DialogContent className="w-[95vw] sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editMode ? "Edit Profile" : "My Profile"}</DialogTitle>
            </DialogHeader>

            {editMode ? (
              <div className="grid gap-4 py-4">
                <div className="flex flex-col items-center mb-4">
                  <div className="relative mb-4">
                    {formData.foto ? (
                      <img
                        src={URL.createObjectURL(formData.foto) || "/placeholder.svg"}
                        alt="Profile Preview"
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : profileData.foto ? (
                      <img
                        src={`https://ukk-p2.smktelkom-mlg.sch.id/${profileData.foto}`}
                        alt={profileData.nama_siswa || "Profile"}
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <Avatar className="h-24 w-24">
                        <AvatarFallback className="text-2xl">
                          {getInitials(profileData?.nama_siswa || "User")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  <div className="w-full">
                    <Input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="nama_siswa" className="text-sm font-medium mb-1 block">
                      Full Name
                    </label>
                    <Input id="nama_siswa" name="nama_siswa" value={formData.nama_siswa} onChange={handleInputChange} />
                  </div>

                  <div>
                    <label htmlFor="username" className="text-sm font-medium mb-1 block">
                      Username
                    </label>
                    <Input id="username" name="username" value={formData.username} onChange={handleInputChange} />
                  </div>

                  <div>
                    <label htmlFor="alamat" className="text-sm font-medium mb-1 block">
                      Address
                    </label>
                    <Input id="alamat" name="alamat" value={formData.alamat} onChange={handleInputChange} />
                  </div>

                  <div>
                    <label htmlFor="telp" className="text-sm font-medium mb-1 block">
                      Phone Number
                    </label>
                    <Input id="telp" name="telp" value={formData.telp} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="relative">
                  {profileData && profileData.foto ? (
                    <img
                      src={`https://ukk-p2.smktelkom-mlg.sch.id/${profileData.foto}`}
                      alt={profileData.nama_siswa || "Profile"}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-2xl">
                        {getInitials(profileData?.nama_siswa || "User")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="grid w-full gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm font-medium">Name:</span>
                    <span className="col-span-2">{profileData?.nama_siswa || "N/A"}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm font-medium">Username:</span>
                    <span className="col-span-2">{profileData?.username || "N/A"}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm font-medium">Address:</span>
                    <span className="col-span-2">{profileData?.alamat || "N/A"}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm font-medium">Phone:</span>
                    <span className="col-span-2">{profileData?.telp || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {editMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setEditMode(false)}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={updateLoading}
                    className="w-full sm:w-auto order-1 sm:order-2"
                  >
                    {updateLoading ? "Updating..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setProfileOpen(false); // Close the modal
                      setEditMode(false); // Reset edit mode
                    }}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Close
                  </Button>
                  <Button onClick={() => setEditMode(true)} className="w-full sm:w-auto order-1 sm:order-2">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default SiswaNavbar
