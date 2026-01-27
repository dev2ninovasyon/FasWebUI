"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginPageClient from "./auth/LoginPageClient";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector((state: AppState) => state.userReducer);

  useEffect(() => {
    // Redux state PersistGate sayesinde hazır olduğunda çalışır
    if (user && user.token) {
      // Token varsa direkt Anasayfa'ya yönlendir
      router.push("/Anasayfa");
    } else {
      setIsLoading(false);
    }
  }, [router, user]);

  if (isLoading) {
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
