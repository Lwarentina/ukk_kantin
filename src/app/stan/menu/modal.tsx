import type React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface MenuItemDialogProps {
  isOpen: boolean
  onClose: () => void
  item: {
    nama_makanan: string
    harga: string
    deskripsi: string
    foto: string
  }
}

const MenuItemDialog: React.FC<MenuItemDialogProps> = ({ isOpen, onClose, item }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item.nama_makanan}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <img
            src={`https://ukk-p2.smktelkom-mlg.sch.id/${item.foto}`}
            alt={item.nama_makanan}
            className="w-full h-48 object-cover rounded-md"
          />
          <p className="text-lg font-bold">Rp{item.harga}</p>
          <DialogDescription>{item.deskripsi}</DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MenuItemDialog

