"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import axios from "axios";

const DashboardSiswa = () => {
  const [siswaData, setSiswaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/"; // Redirect to login if no token
      return;
    }

    // Fetch siswa data
    const fetchSiswaData = async () => {
      try {
        const response = await axios.get(
          "https://ukk-p2.smktelkom-mlg.sch.id/api/get_profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              makerID: "3", // Add the required makerID here
            },
          }
        );
        setSiswaData(response.data.data);
        setSnackbar({
          open: true,
          message: "Welcome back!",
          severity: "success",
        });
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

    fetchSiswaData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Remove token
    window.location.href = "/"; // Redirect to login page
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: 3,
    }}
  >
    <Typography variant="h4">Welcome, {siswaData?.username}!</Typography>
    <Button
      variant="contained"
      color="error"
      onClick={handleLogout}
      sx={{ textTransform: "none" }}
    >
      Logout
    </Button>
  </Box>

  <Grid container spacing={3}>
    <Grid item xs={12} sm={6} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Nama Siswa:
          </Typography>
          <Typography>{siswaData?.nama_siswa}</Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Alamat:
          </Typography>
          <Typography>{siswaData?.alamat}</Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Telepon:
          </Typography>
          <Typography>{siswaData?.telp}</Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Username:
          </Typography>
          <Typography>{siswaData?.username}</Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Role:
          </Typography>
          <Typography>{siswaData?.role}</Typography>
        </CardContent>
      </Card>
    </Grid>
  </Grid>

  {/* Snackbar */}
  <Snackbar
    open={snackbar.open}
    autoHideDuration={4000}
    onClose={handleSnackbarClose}
    anchorOrigin={{ vertical: "top", horizontal: "center" }}
  >
    <Alert
      onClose={handleSnackbarClose}
      severity={snackbar.severity as "info" | "success" | "error"}
      sx={{ width: "100%" }}
    >
      {snackbar.message}
    </Alert>
  </Snackbar>
</Box>

  );
};

export default DashboardSiswa;
