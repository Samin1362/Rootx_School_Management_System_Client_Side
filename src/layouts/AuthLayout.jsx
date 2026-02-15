import { Navigate, Outlet } from "react-router";
import useAuth from "../hooks/useAuth";
import Loader from "../components/Loader";

const AuthLayout = () => {
  const { user, dbUser, loader } = useAuth();

  // Show loader while checking auth
  if (loader) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-primary/5 to-base-100 flex items-center justify-center">
        <div className="text-center animate-fadeInUp">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/60 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to appropriate dashboard
  if (user && dbUser) {
    // Super admin redirect
    if (dbUser.isSuperAdmin || dbUser.role === "super_admin") {
      return <Navigate to="/dashboard/super-admin" replace />;
    }

    // Users without organization
    if (!dbUser.organizationId) {
      return <Navigate to="/waiting-for-organization" replace />;
    }

    // All roles use the same dashboard layout
    return <Navigate to="/dashboard/overview" replace />;
  }

  // Render auth pages (Login/Register handle their own layouts)
  return <Outlet />;
};

export default AuthLayout;
