"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  FormControl,
  Fab,
  Modal,
  IconButton,
  Snackbar,
} from "@mui/material";
import { Plus, Trash } from "lucide-react";
import axios from "axios";
import debounce from "lodash.debounce";
import Navbar from "../navbar";
import { FileDrop } from "react-file-drop";

const MenuList = () => {
  const [search, setSearch] = useState("");
  const [menuData, setMenuData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [newMenu, setNewMenu] = useState({
    nama_makanan: "",
    jenis: "makanan",
    harga: "",
    deskripsi: "",
    foto: null as File | null,
  });

  const fetchMenu = async () => {
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
  };

  const debouncedSearch = debounce(fetchMenu, 500);

  useEffect(() => {
    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [search]);

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

      // Refresh menu list
      fetchMenu();
    } catch (err) {
      console.error("Error deleting menu:", err);
    }
  };

  const handleAddMenu = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    // Validate form fields
    if (
      !newMenu.nama_makanan ||
      !newMenu.harga ||
      !newMenu.deskripsi ||
      !newMenu.foto
    ) {
      alert("Please fill all fields before adding the menu.");
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

      // Reset form and close modal
      setNewMenu({
        nama_makanan: "",
        jenis: "makanan",
        harga: "",
        deskripsi: "",
        foto: null,
      });
      setOpenForm(false);
      setSnackbarOpen(true);
      fetchMenu();
    } catch (err) {
      console.error("Error adding menu:", err);
      alert("There was an error while adding the menu. Please try again.");
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
        alert("Please upload an image file");
      }
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      <Navbar />

      {/* Search & Filter */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Search Menu"
          variant="outlined"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">all</MenuItem>
            <MenuItem value="makanan">Makanan</MenuItem>
            <MenuItem value="minuman">Minuman</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Menu List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {menuData.length > 0 ? (
            menuData
              .filter((menu) => (filterType ? menu.jenis === filterType : true))
              .map((menu, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={menu.id}>
                  <Card
                    sx={{
                      position: "relative",
                      height: 340,
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: 4,
                      transition: "0.3s",
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    {/* Delete Button */}
                    <IconButton
                      onClick={() => handleDeleteMenu(menu.id)}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "red",
                        color: "white",
                        "&:hover": { bgcolor: "darkred" },
                      }}
                    >
                      <Trash size={20} />
                    </IconButton>

                    <Box sx={{ width: "100%", height: "180px" }}>
                      <img
                        src={`https://ukk-p2.smktelkom-mlg.sch.id/${menu.foto}`}
                        alt={menu.nama_makanan}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h6">{menu.nama_makanan}</Typography>
                      <Typography
                        sx={{ color: "primary.main", fontWeight: 700 }}
                      >
                        Rp{menu.harga}
                      </Typography>
                      <Typography
                        sx={{
                          color: "text.secondary",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          WebkitLineClamp: 2,
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {menu.deskripsi}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
          ) : (
            <Box sx={{ textAlign: "center", width: "100%", mt: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No menu items found.
              </Typography>
            </Box>
          )}

          {/* Blank Card for Add Menu */}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Card
              sx={{
                position: "relative",
                height: 340,
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: 4,
                transition: "0.3s",
                "&:hover": {
                  boxShadow: 6,
                  bgcolor: "#f0f8ff", // Background change on hover
                },
                bgcolor: "#f9f9f9", // Light background color for the add menu card
                cursor: "pointer",
                padding: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={() => setOpenForm(true)} // Open the add menu form when clicked
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 56,
                  height: 56,
                }}
              >
                <Plus size={36} color="black" />
              </Box>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ textAlign: "center", fontWeight: 500 }}
              >
                Add Menu
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Add Menu Modal */}
      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Box sx={{ bgcolor: "white", p: 4, borderRadius: 3, width: 600 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add New Menu
          </Typography>

          <TextField
            label="Name"
            fullWidth
            name="nama_makanan"
            value={newMenu.nama_makanan}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Price"
            fullWidth
            name="harga"
            type="number"
            value={newMenu.harga}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          <TextField
            select
            label="Type"
            fullWidth
            name="jenis"
            value={newMenu.jenis}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          >
            <MenuItem value="makanan">Makanan</MenuItem>
            <MenuItem value="minuman">Minuman</MenuItem>
          </TextField>

          <TextField
            label="Description"
            fullWidth
            name="deskripsi"
            multiline
            rows={2}
            value={newMenu.deskripsi}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          {/* File Drop Area */}
          <FileDrop
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Box
              sx={{
                border: isDragging ? "2px dashed #007bff" : "2px dashed #ccc",
                padding: "40px",
                borderRadius: "10px",
                textAlign: "center",
                cursor: "pointer",
                marginBottom: "15px",
                transition: "border 0.3s ease",
                backgroundColor: isDragging ? "#f0f8ff" : "transparent",
                width: "100%",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, fontSize: "14px" }}
              >
                {isDragging
                  ? "Release to upload!"
                  : "Drag & Drop an image here or click below"}
              </Typography>

              {/* File Upload Button */}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                id="fileUpload"
                onChange={handleFileChange}
              />
              <label htmlFor="fileUpload">
                <Button
                  variant="contained"
                  component="span"
                  sx={{
                    textTransform: "none",
                    bgcolor: "#007bff",
                    "&:hover": { bgcolor: "#0056b3" },
                  }}
                >
                  Select Image
                </Button>
              </label>

              {/* Show File Name or Preview */}
              {newMenu.foto && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {newMenu.foto.name}
                  </Typography>
                  <img
                    src={URL.createObjectURL(newMenu.foto)}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: "150px",
                      objectFit: "cover",
                      marginTop: "10px",
                      borderRadius: "5px",
                      boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
                    }}
                  />

                  {/* Remove File Button */}
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ mt: 1 }}
                    onClick={() => {
                      // Remove the file
                      setNewMenu({ ...newMenu, foto: null });
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>
          </FileDrop>

          <Box sx={{ display: "flex", justifyContent: "right", mt: 2, gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setOpenForm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddMenu}
              disabled={addLoading}
            >
              {addLoading ? <CircularProgress size={24} /> : "Add"}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Menu added successfully!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default MenuList;
