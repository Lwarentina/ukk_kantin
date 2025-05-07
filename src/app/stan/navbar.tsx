"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Store, LogOut, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"

const Navbar = () => {
  const [stanData, setStanData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/")
      return
    }

    const fetchStanData = async () => {
      try {
        const response = await axios.get("https://ukk-p2.smktelkom-mlg.sch.id/api/get_stan", {
          headers: { Authorization: `Bearer ${token}`, makerID: "3" },
        })
        setStanData(response.data.data)
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to load profile.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStanData()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    router.push("/")
  }

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo and Links */}
        <div className="flex items-center">
          <Link className="flex items-center space-x-2 mr-6" href="/stan">
            <Store className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block text-primary">Kantin</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link href="/stan" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/stan/menu" className="hover:text-primary transition-colors">
              Menu List
            </Link>
            <Link href="/stan/diskon" className="hover:text-primary transition-colors">
              Discount
            </Link>
            <Link href="/stan/datasiswa" className="hover:text-primary transition-colors">
              Students
            </Link>
          </nav>
        </div>

        {/* User Info and Mobile Menu */}
        <div className="flex items-center space-x-4">
          {loading ? (
            <Skeleton className="h-8 w-[200px]" />
          ) : stanData ? (
            <div className="hidden md:flex items-center">
              <Store className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{stanData.nama_stan}</span>
              <span className="ml-2 text-xs text-muted-foreground">Owned by: {stanData.nama_pemilik}</span>
            </div>
          ) : null}

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <User className="h-4 w-4" />
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 rounded-full md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/stan">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/stan/menu">Menu List</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/stan/diskon">Discount</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/stan/datasiswa">Students</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Dropdown Links */}
      {menuOpen && (
        <div className="md:hidden bg-background border-t border-border/40">
          <div className="flex flex-col space-y-2 p-4">
            <Link href="/stan" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/stan/menu" className="hover:text-primary transition-colors">
              Menu List
            </Link>
            <Link href="/stan/diskon" className="hover:text-primary transition-colors">
              Discount
            </Link>
            <Link href="/stan/datasiswa" className="hover:text-primary transition-colors">
              Students
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
