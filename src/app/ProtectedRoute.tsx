import { ReactNode } from "react";

import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import Forbidden from "./forbidden";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  return user && allowedRoles.includes(user?.yetki || "") ? (
    <>{children}</>
  ) : (
    <Forbidden></Forbidden>
  );
};

export default ProtectedRoute;
