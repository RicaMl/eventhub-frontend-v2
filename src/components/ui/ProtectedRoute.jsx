import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";

export default function ProtectedRoute({ children, adminOnly = false, redirectTo = "/" }) {
  const { user, isAdmin } = useApp();
  const location = useLocation();

  // Si l'utilisateur n'est pas connecté
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si admin et essaie d'accéder à une page non-admin
  if (isAdmin && !adminOnly && redirectTo !== "/dashboard") {
    return <Navigate to="/dashboard" replace />;
  }

  // Si route admin mais user non-admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
