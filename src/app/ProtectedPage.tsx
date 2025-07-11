import { ReactNode } from "react";
import Forbidden from "./forbidden";

interface ProtectedPageProps {
  children: ReactNode;
  allowed: boolean;
}

const ProtectedPage: React.FC<ProtectedPageProps> = ({ children, allowed }) => {
  return allowed ? <>{children}</> : <Forbidden></Forbidden>;
};

export default ProtectedPage;
