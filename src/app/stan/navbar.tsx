"use client";
import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

const Navbar = () => {
  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          My App
        </Typography>
        <Box>
          <Button color="inherit" onClick={() => (window.location.href = "/stan")}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => (window.location.href = "/stan/menu")}>
            Menu List
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
