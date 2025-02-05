"use client";
import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, CircularProgress } from "@mui/material";
import axios from "axios";
import { Store, LogOut } from "lucide-react"; // Icons for better UX

const Navbar = () => {
  const [stanData, setStanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/";
      return;
    }

    const fetchStanData = async () => {
      try {
        const response = await axios.get(
          "https://ukk-p2.smktelkom-mlg.sch.id/api/get_stan",
          {
            headers: { Authorization: `Bearer ${token}`, makerID: "3" },
          }
        );
        setStanData(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchStanData();
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  return (
    <AppBar position="static" sx={{ mb: 3, p: 1, bgcolor: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(10px)", boxShadow: 3 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        {/* Left Side (App Name) */}
        <Typography variant="h6" sx={{ fontWeight: "bold", letterSpacing: 1 }}>
          Kantin
        </Typography>

        {/* Stan Profile (Show loading if still fetching) */}
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : stanData ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 2 }}>
            <Store size={20} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{stanData.nama_stan}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Owned by: {stanData.nama_pemilik}</Typography>
            </Box>
          </Box>
        ) : (
          <Typography variant="caption" color="error">{error}</Typography>
        )}

        {/* Navigation & Logout */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button 
            color="inherit" 
            onClick={() => (window.location.href = "/stan")}
            sx={{ textTransform: "none", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
          >
            Dashboard
          </Button>
          <Button 
            color="inherit" 
            onClick={() => (window.location.href = "/stan/menu")}
            sx={{ textTransform: "none", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
          >
            Menu List
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleLogout} 
            sx={{ textTransform: "none", display: "flex", alignItems: "center", gap: 1 }}
          >
            <LogOut size={18} />
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
