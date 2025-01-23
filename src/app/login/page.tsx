"use client";
import {
  Grid,
  CssBaseline,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import { Coffee } from "lucide-react";
import axios from "axios";

const defaultTheme = createTheme();

const SignInSide = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Ensure both fields are filled
    if (!formData.username || !formData.password) {
      setSnackbar({
        open: true,
        message: "Please fill in both username and password.",
        severity: "error",
      });
      setLoading(false);
      return;
    }

    try {
      // Attempt login
      const response = await axios.post(
        "https://ukk-p2.smktelkom-mlg.sch.id/api/login_siswa",
        {
          username: formData.username,
          password: formData.password,
        },
        {
          headers: {
            makerID: "3", // Add the makerID required by the API
          },
        }
      );

      // Save token and redirect based on role
      const { access_token, user } = response.data;
      localStorage.setItem("authToken", access_token);

      // Redirect based on the user's role
      if (user.role === "siswa") {
        window.location.href = "/siswa";
      } else if (user.role === "admin_stan") {
        window.location.href = "/stan";
      } else {
        setError("Unrecognized user role. Please contact support.");
      }
    } catch (err: any) {
      // Handle login error
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    window.location.href = "/register";
  };

  const handleForgotPassword = () => {
    setSnackbar({
      open: true,
      message: "This feature is still under maintenance",
      severity: "info",
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        {/* Background Image Section */}
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
              'url("https://images.adsttc.com/media/images/50aa/e71e/b3fc/4b0b/5400/007d/slideshow/RocheCanteen-14.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
          }}
        />
        {/* Main Content Section */}
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={6}
          square
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            position: "fixed",
            top: 0,
            right: 0,
            width: "100%",
            height: "100vh",
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 4,
              position: "absolute",
              top: "15%",
              left: "50%",
              transform: "translateX(-50%)",
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
          {/* Form Section */}
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{
              width: "100%",
              maxWidth: 400,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
              Login
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              autoFocus
              sx={{ mb: 1 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 1 }}
            />
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
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
                "Sign In"
              )}
            </Button>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                mt: 2,
              }}
            >
              <Typography variant="body2">
                Don't have an account?{" "}
                <Link
                  onClick={handleRegister}
                  variant="body2"
                  underline="hover"
                  sx={{ cursor: "pointer" }}
                >
                  Register.
                </Link>
              </Typography>
              <Link
                onClick={handleForgotPassword}
                variant="body2"
                underline="hover"
                sx={{ cursor: "pointer" }}
              >
                Forgot password?
              </Link>
            </Box>
          </Box>
          {/* Copyright */}
          <Box
            sx={{
              position: "absolute",
              bottom: 32,
              width: "100%",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary" align="center">
              {"Copyright © "}
              <Link
                color="inherit"
                href="https://youtu.be/fWH-p4zCWTk?si=K3Wn2j7dqsMu2FPd"
              >
                JAWA
              </Link>{" "}
              {new Date().getFullYear()}
            </Typography>
          </Box>
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
      </Grid>
    </ThemeProvider>
  );
};

export default SignInSide;
