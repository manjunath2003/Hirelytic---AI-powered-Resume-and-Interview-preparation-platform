import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If user is not logged in
  if (!token || !role) {
    return <Navigate to="/" replace />;
  }

  // If logged in but role is not allowed
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
