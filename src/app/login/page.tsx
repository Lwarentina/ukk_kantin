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
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import { Coffee } from "lucide-react";

const defaultTheme = createTheme();

const SignInSide = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = () => {
    window.location.href = "/register";
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
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
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
              id="id"
              label="ID Number"
              name="id"
              autoComplete="id"
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
              autoComplete="current-password"
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
              <Link href="#" variant="body2" underline="hover">
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
      </Grid>
    </ThemeProvider>
  );
};

export default SignInSide;
