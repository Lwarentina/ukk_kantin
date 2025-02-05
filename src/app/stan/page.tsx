"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import Navbar from "./navbar"; // Import Navbar

const DashboardStan = () => {
  const [stanData, setStanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

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
        setError(err.response?.data?.message || "Failed to fetch data.");
        setSnackbar({
          open: true,
          message: "Error loading data. Please try again.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStanData();
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Navbar /> {/* Add Navbar Here */}

      {/* Logout & Welcome */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Welcome, {stanData?.nama_pemilik}!</Typography>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity as "info" | "success" | "error"} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardStan;
