import { Navigate, Outlet } from "react-router-dom";
import { getDashboardPath, getStoredUser } from "../auth";

function RequireStudent() {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "student") {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
}

export default RequireStudent;
