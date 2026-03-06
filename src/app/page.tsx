"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginPageClient from "./auth/LoginPageClient";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuthSession } from "@/contexts/AuthSessionContext";

export default function Page() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const { status } = useAuthSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/Anasayfa");
      return;
    }

    if (status === "unauthenticated") {
      setShowLogin(true);
    }
  }, [router, status]);

  if (status === "loading" || !showLogin) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <LoginPageClient />;
}
