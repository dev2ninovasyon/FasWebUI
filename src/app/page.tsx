"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginPageClient from "./auth/LoginPageClient";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // localStorage'dan token kontrolü - Redux yüklenmeden önce kontrol eder
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("fas_token");
      if (token) {
        // Token varsa direkt Anasayfa'ya yönlendir
        router.push("/Anasayfa");
      }
    }
  }, [router]);

  return <LoginPageClient />;
}
