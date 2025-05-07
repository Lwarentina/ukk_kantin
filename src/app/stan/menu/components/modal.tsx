"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface MenuItemDialogProps {
  isOpen: boolean
  onClose: () => void
  item: {
    nama_makanan: string
    harga: string
    deskripsi: string
    foto: string
    jenis?: string
  }
}

const MenuItemDialog: React.FC<MenuItemDialogProps> = ({ isOpen, onClose, item }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[80vh] md:max-h-[70vh] overflow-hidden">
          <div className="relative h-48 sm:h-56 md:h-full overflow-hidden">
            <img
              src={`https://ukk-p2.smktelkom-mlg.sch.id/${item.foto}`}
              alt={item.nama_makanan}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4 sm:p-6 flex flex-col overflow-y-auto max-h-[50vh] md:max-h-[70vh]">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl sm:text-2xl font-bold line-clamp-2">{item.nama_makanan}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
              {item.jenis && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  {item.jenis === "makanan" ? "Food" : "Beverage"}
                </span>
              )}
              <span className="text-lg sm:text-xl font-bold text-primary">Rp{item.harga}</span>
            </div>

            <div className="flex-grow">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Description</h3>
              <p className="text-sm sm:text-base text-gray-700">{item.deskripsi}</p>
            </div>

            <DialogFooter className="pt-4 mt-auto">
              <Button className="w-full sm:w-auto" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MenuItemDialog
