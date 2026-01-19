import { Navigate, Outlet } from "react-router-dom";
import { useAuth, useRole } from "./auth/AuthContext";

export function ProtectedRoute({ allowedRoles }: { allowedRoles: Array<"SUPER_ADMIN" | "ADMIN" | "STUDENT"> }) {
  const { user, loading } = useAuth();
  const role = useRole();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!role || !allowedRoles.includes(role)) return <Navigate to="/login" replace />;
  return <Outlet />;
}

