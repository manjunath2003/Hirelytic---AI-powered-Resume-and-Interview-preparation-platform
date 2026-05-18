import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If not logged in → go to login
  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  // If wrong role → block access
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
