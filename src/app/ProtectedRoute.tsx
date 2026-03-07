import { ReactNode, useEffect, useState } from "react";
import { useAuthSession } from "@/contexts/AuthSessionContext";
import Forbidden from "./forbidden";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { status } = useAuthSession();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      setShouldRedirect(true);
    }
  }, [status]);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/");
    }
  }, [shouldRedirect, router]);

  if (status === "loading") {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        width="100vw"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (status === "unauthenticated") {
    return null; // Redirecting...
  }

  // user yetkisi için redux'tan kontrol hala geçerli olabilir ama status 'authenticated' ise user nesnesi doludur.
  // Not: AuthSessionContext authenticated derse redux userReducer da doludur.
  return <>{children}</>;
};

export default ProtectedRoute;
