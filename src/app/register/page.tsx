"use client";
import {
  Grid,
  CssBaseline,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import axios from "axios";
import { Coffee } from "lucide-react";

const defaultTheme = createTheme();

const Register = () => {
  const [activeTab, setActiveTab] = useState(0); // 0 for Siswa, 1 for Stan
  const [formData, setFormData] = useState({
    nama_siswa: "",
    alamat: "",
    telp: "",
    username: "",
    password: "",
    nama_stan: "",
    nama_pemilik: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setFormData({
      nama_siswa: "",
      alamat: "",
      telp: "",
      username: "",
      password: "",
      nama_stan: "",
      nama_pemilik: "",
    }); // Reset form data when switching tabs
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const baseUrl = "https://ukk-p2.smktelkom-mlg.sch.id/api/";
    const apiUrl =
      activeTab === 0 ? `${baseUrl}register_siswa` : `${baseUrl}register_stan`;

    const dataToSend =
      activeTab === 0
        ? {
            nama_siswa: formData.nama_siswa,
            alamat: formData.alamat,
            telp: formData.telp,
            username: formData.username,
            password: formData.password,
          }
        : {
            nama_pemilik: formData.nama_pemilik,
            nama_stan: formData.nama_stan,
            telp: formData.telp,
            username: formData.username,
            password: formData.password,
          };

    try {
      const response = await axios.post(apiUrl, dataToSend, {
        headers: {
          "Content-Type": "application/json", // Using JSON instead of FormData
          makerID: "3",
        },
      });

      if (response.status === 200) {
        setSuccess(true);
      } else {
        throw new Error(response.data.message || "Failed to register");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    window.location.href = "/login";
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid
        container
        component="main"
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CssBaseline />
        <Box
          sx={{
            width: "100%",
            maxWidth: 600,
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 4,
            }}
          >
            <Coffee size={84} color="#000" />
            <Typography
              variant="h4"
              component="div"
              fontSize={64}
              sx={{ ml: 2, fontWeight: "bold" }}
            >
              Kantin
            </Typography>
          </Box>
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{ mb: 3 }}
          >
            <Tab label="Siswa" />
            <Tab label="Stan" />
          </Tabs>
          {/* Form Section */}
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
              Register as {activeTab === 0 ? "Siswa" : "Pemilik Stan"}
            </Typography>
            {activeTab === 0 ? (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="nama_siswa"
                  label="Nama Siswa"
                  name="nama_siswa"
                  value={formData.nama_siswa}
                  onChange={handleChange}
                  sx={{ mb: 1 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="alamat"
                  label="Alamat"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  sx={{ mb: 1 }}
                />
              </>
            ) : (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="nama_pemilik"
                  label="Nama Pemilik"
                  name="nama_pemilik"
                  value={formData.nama_pemilik}
                  onChange={handleChange}
                  sx={{ mb: 1 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="nama_stan"
                  label="Nama Stan"
                  name="nama_stan"
                  value={formData.nama_stan}
                  onChange={handleChange}
                  sx={{ mb: 1 }}
                />
              </>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="telp"
              label="No Telepon"
              name="telp"
              type="tel"
              value={formData.telp}
              onChange={handleChange}
              sx={{ mb: 1 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              sx={{ mb: 1 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="password"
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 1 }}
            />
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {typeof error === "string" ? error : JSON.stringify(error)}
              </Typography>
            )}

            {success && (
              <Typography color="success.main" sx={{ mt: 2 }}>
                {typeof success === "string"
                  ? success
                  : JSON.stringify(success)}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Register"
              )}
            </Button>
            <Typography variant="body2">
              Already have an account?{" "}
              <Link
                onClick={handleLoginRedirect}
                variant="body2"
                underline="hover"
                sx={{ cursor: "pointer" }}
              >
                Login
              </Link>
            </Typography>
          </Box>
        </Box>
      </Grid>
    </ThemeProvider>
  );
};

export default Register;
