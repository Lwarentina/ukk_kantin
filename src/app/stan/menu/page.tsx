"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { Plus, Trash } from "lucide-react";
import axios from "axios";
import debounce from "lodash.debounce";
import { FileDrop } from "react-file-drop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import Navbar from "../navbar";

const MenuList = () => {
  const [search, setSearch] = useState("");
  const [menuData, setMenuData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [addLoading, setAddLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [newMenu, setNewMenu] = useState({
    nama_makanan: "",
    jenis: "makanan",
    harga: "",
    deskripsi: "",
    foto: null as File | null,
  });

  const fetchMenu = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setLoading(true);
    try {
      const response = await axios.post(
        "https://ukk-p2.smktelkom-mlg.sch.id/api/showmenu",
        { search },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            makerID: "3",
          },
        }
      );
      setMenuData(response.data.data);
    } catch (err: any) {
      console.error("Error fetching menu:", err);
    }
    setLoading(false);
  }, [search]);

  const debouncedSearch = useCallback(
    debounce(() => {
      fetchMenu();
    }, 500),
    [fetchMenu]
  );

  useEffect(() => {
    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [debouncedSearch, search]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewMenu({ ...newMenu, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewMenu({ ...newMenu, foto: e.target.files[0] });
    }
  };

  const handleDeleteMenu = async (id: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    if (!window.confirm("Are you sure you want to delete this menu item?")) {
      return;
    }

    try {
      await axios.delete(
        `https://ukk-p2.smktelkom-mlg.sch.id/api/hapus_menu/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            makerID: "3",
          },
        }
      );

      fetchMenu();
    } catch (err) {
      console.error("Error deleting menu:", err);
    }
  };

  const handleAddMenu = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    if (
      !newMenu.nama_makanan ||
      !newMenu.harga ||
      !newMenu.deskripsi ||
      !newMenu.foto
    ) {
      toast({
        title: "Error",
        description: "Please fill all fields before adding the menu.",
        variant: "destructive",
      });
      return;
    }

    setAddLoading(true);

    const formData = new FormData();
    formData.append("nama_makanan", newMenu.nama_makanan);
    formData.append("jenis", newMenu.jenis);
    formData.append("harga", newMenu.harga);
    formData.append("deskripsi", newMenu.deskripsi);
    if (newMenu.foto) formData.append("foto", newMenu.foto);
    formData.append("maker_id", "3");
    formData.append("id_stan", "8");

    try {
      await axios.post(
        "https://ukk-p2.smktelkom-mlg.sch.id/api/tambahmenu",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            makerID: "3",
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setNewMenu({
        nama_makanan: "",
        jenis: "makanan",
        harga: "",
        deskripsi: "",
        foto: null,
      });
      setOpenForm(false);
      toast({
        title: "Success",
        description: "Menu added successfully!",
      });
      fetchMenu();
    } catch (err) {
      console.error("Error adding menu:", err);
      toast({
        title: "Error",
        description:
          "There was an error while adding the menu. Please try again.",
        variant: "destructive",
      });
    }

    setAddLoading(false);
  };

  const handleDragOver = () => setIsDragging(true);
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (files: FileList | null) => {
    setIsDragging(false);
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setNewMenu({ ...newMenu, foto: file });
      } else {
        toast({
          title: "Error",
          description: "Please upload an image file",
          variant: "destructive",
        });
      }
    }
  };

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
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {menuData.length > 0 ? (
              menuData
                .filter((menu) =>
                  filterType !== "all" ? menu.jenis === filterType : true
                )
                .map((menu) => (
                  <Card key={menu.id} className="overflow-hidden">
                    <CardHeader className="p-0">
                      <img
                        src={`https://ukk-p2.smktelkom-mlg.sch.id/${menu.foto}`}
                        alt={menu.nama_makanan}
                        className="w-full h-48 object-cover"
                      />
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle>{menu.nama_makanan}</CardTitle>
                      <p className="text-md font-bold text-primary mt-2">
                        Rp{menu.harga}
                      </p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {menu.deskripsi}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end p-4">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="rounded-full p-2"
                        onClick={() => handleDeleteMenu(menu.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            ) : (
              <div className="col-span-full text-center mt-8">
                <p className="text-xl text-gray-500">No menu items found.</p>
              </div>
            )}

            <Dialog open={openForm} onOpenChange={setOpenForm}>
              <DialogTrigger asChild>
                <Card className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Plus className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-lg font-medium text-gray-600">
                      Add Menu
                    </p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Menu</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    name="nama_makanan"
                    placeholder="Name"
                    value={newMenu.nama_makanan}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="harga"
                    type="number"
                    placeholder="Price"
                    value={newMenu.harga}
                    onChange={handleInputChange}
                  />
                  <Select
                    name="jenis"
                    value={newMenu.jenis}
                    onValueChange={(value) =>
                      setNewMenu({ ...newMenu, jenis: value })
                    }
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
                    value={newMenu.deskripsi}
                    onChange={handleInputChange}
                  />
                  <FileDrop
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <div
                      className={`border-2 border-dashed p-8 rounded-lg text-center cursor-pointer transition-colors ${
                        isDragging
                          ? "border-primary bg-primary/10"
                          : "border-gray-300"
                      }`}
                    >
                      <p className="text-sm text-gray-500 mb-2">
                        {isDragging
                          ? "Release to upload!"
                          : "Drag & Drop an image here or click below"}
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
                          onClick={() =>
                            document.getElementById("fileUpload")?.click()
                          }
                        >
                          Select Image
                        </Button>
                      </label>
                      {newMenu.foto && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">
                            {newMenu.foto.name}
                          </p>
                          <img
                            src={
                              URL.createObjectURL(newMenu.foto) ||
                              "/placeholder.svg"
                            }
                            alt="Preview"
                            className="mt-2 max-h-[150px] object-cover rounded-md shadow-sm"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="mt-2"
                            onClick={() =>
                              setNewMenu({ ...newMenu, foto: null })
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </FileDrop>
                </div>
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setOpenForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMenu} disabled={addLoading}>
                    {addLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuList;
