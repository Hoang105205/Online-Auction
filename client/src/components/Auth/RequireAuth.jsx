import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const RequireAuth = ({ allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();

  const hasRequiredRole = allowedRoles
    ? auth.roles?.some((role) => allowedRoles.includes(role))
    : true;

  if (auth?.accessToken && hasRequiredRole) {
    return <Outlet />;
  }
  if (auth?.accessToken && !hasRequiredRole) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default RequireAuth;
