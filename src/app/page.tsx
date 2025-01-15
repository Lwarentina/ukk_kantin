"use client";

import { useEffect } from "react";

export default function RedirectPage() {
  useEffect(() => {
    window.location.href = "/login"; // Redirect to /login
  }, []);

  return <div>Redirecting to login...</div>;
}
