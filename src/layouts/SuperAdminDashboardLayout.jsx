import { useState, useEffect } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import Logo from "../components/Logo";
import {
  FaCrown,
  FaSchool,
  FaUsers,
  FaCreditCard,
  FaExclamationCircle,
  FaCog,
  FaChartLine,
  FaSignOutAlt,
  FaHome,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";
import { RiSidebarUnfoldFill } from "react-icons/ri";
import { MdLightMode, MdDarkMode } from "react-icons/md";

const superAdminNavItems = [
  { key: "sa-dashboard", label: "Dashboard", path: "/dashboard/super-admin", icon: FaHome },
  { key: "sa-organizations", label: "Organizations", path: "/dashboard/super-admin/organizations", icon: FaSchool },
  { key: "sa-users", label: "All Users", path: "/dashboard/super-admin/users", icon: FaUsers },
  { key: "sa-subscriptions", label: "Subscriptions", path: "/dashboard/super-admin/subscriptions", icon: FaCreditCard },
  { key: "sa-sub-requests", label: "Sub Requests", path: "/dashboard/super-admin/subscription-requests", icon: FaExclamationCircle },
  { key: "sa-reactivation", label: "Reactivation", path: "/dashboard/super-admin/reactivation-requests", icon: FaExclamationCircle },
  { key: "sa-plans", label: "Plans", path: "/dashboard/super-admin/plans", icon: FaCrown },
  { key: "sa-settings", label: "Settings", path: "/dashboard/super-admin/settings", icon: FaCog },
  { key: "sa-reports", label: "Reports", path: "/dashboard/super-admin/reports", icon: FaChartLine },
];

const SuperAdminDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, dbUser, loader, dbUserLoading, logoutUser } = useAuth();

  const defaultProfileImage =
    "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("rootx-theme") || "rootxlight";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "rootxlight" ? "rootxdark" : "rootxlight";
    setTheme(newTheme);
    localStorage.setItem("rootx-theme", newTheme);
  };

  const isRouteActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  // Loading state - matches DashboardLayout design
  if (loader || dbUserLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-base-100 via-primary/5 to-base-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl sa-animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl sa-animate-float-reverse"></div>
        </div>

        <div className="text-center animate-fadeInUp relative z-10">
          <div className="relative inline-block">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <div className="absolute inset-0 loading loading-spinner loading-lg text-primary/20 scale-150"></div>
          </div>
          <p className="mt-6 text-base-content/70 font-medium animate-pulse">
            {dbUserLoading ? "Verifying your account..." : "Loading Super Admin..."}
          </p>
          <div className="flex gap-1 justify-center mt-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>

        <style jsx>{`
          @keyframes sa-float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-20px) scale(1.05); }
          }
          @keyframes sa-float-reverse {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(20px) scale(1.05); }
          }
          .sa-animate-float { animation: sa-float 8s ease-in-out infinite; }
          .sa-animate-float-reverse { animation: sa-float-reverse 10s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

  // Auth guard
  if (!user || !dbUser) {
    return <Navigate to="/login" replace />;
  }

  // Render a sidebar nav item with animation (matches DashboardLayout pattern)
  const renderNavItem = (item, index) => (
    <Link to={item.path} key={item.key}>
      <li
        className="sa-animate-slideInLeft"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <button
          className={`group relative overflow-hidden is-drawer-close:tooltip is-drawer-close:tooltip-right rounded-xl transition-all duration-300 active:scale-95 py-3 ${
            isRouteActive(item.path)
              ? "bg-linear-to-r from-primary to-primary/80 text-primary-content font-semibold shadow-lg shadow-primary/30"
              : "hover:bg-primary/10 hover:text-primary hover:translate-x-1 hover:shadow-md"
          }`}
          data-tip={item.label}
        >
          {/* Shimmer effect on active */}
          {isRouteActive(item.path) && (
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          )}

          <item.icon className={`text-2xl transition-transform duration-300 ${
            isRouteActive(item.path) ? "scale-110" : "group-hover:scale-110"
          }`} />
          <span className="is-drawer-close:hidden text-base font-medium relative z-10">
            {item.label}
          </span>

          {/* Active indicator dot */}
          {isRouteActive(item.path) && (
            <span className="is-drawer-close:hidden absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary-content rounded-full animate-ping"></span>
          )}
        </button>
      </li>
    </Link>
  );

  return (
    <div className="drawer lg:drawer-open">
      <input id="super-admin-drawer" type="checkbox" className="drawer-toggle" />

      {/* ===== DRAWER CONTENT (Main Area) ===== */}
      <div className="drawer-content flex flex-col min-h-screen">
        {/* Enhanced Glassmorphism Navbar */}
        <nav className="navbar w-full bg-base-100/95 backdrop-blur-md sticky top-0 z-40 shadow-lg border-b border-base-300/50 px-2 sm:px-4 min-h-16 sa-animate-slideDown">
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>

          <div className="flex items-center gap-2 sm:gap-3 relative z-10 w-full">
            {/* Left: Sidebar Toggle */}
            <div className="flex-none">
              <label
                htmlFor="super-admin-drawer"
                aria-label="open sidebar"
                className="btn btn-square btn-ghost hover:bg-primary/10 hover:text-primary transition-all duration-300 active:scale-95 group hover:shadow-md"
              >
                <RiSidebarUnfoldFill className="text-xl sm:text-2xl group-hover:scale-110 group-hover:translate-x-0.5 transition-all duration-300" />
              </label>
            </div>

            {/* Super Admin Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 animate-fadeIn">
              <FaCrown className="text-primary text-sm" />
              <span className="text-sm font-bold text-primary">SUPER ADMIN</span>
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Right side actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Notifications */}
              <button className="btn btn-circle btn-ghost btn-sm hover:bg-primary/10 hover:text-primary transition-all duration-300 group relative hover:shadow-md">
                <FaBell className="text-lg group-hover:scale-110 transition-all duration-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-pulse"></span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="btn btn-circle btn-ghost btn-sm hover:bg-primary/10 hover:text-primary transition-all duration-300 active:scale-95 hover:shadow-md group"
                title={theme === "rootxlight" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                {theme === "rootxlight" ? (
                  <MdDarkMode className="text-xl sm:text-2xl group-hover:scale-110 transition-all duration-300" />
                ) : (
                  <MdLightMode className="text-xl sm:text-2xl group-hover:scale-110 transition-all duration-300" />
                )}
              </button>

              {/* User Profile Dropdown */}
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar hover:bg-primary/10 transition-all duration-300 group"
                >
                  <div className="w-8 sm:w-10 rounded-full ring-2 ring-primary/20 group-hover:ring-primary/50 group-hover:ring-offset-2 group-hover:ring-offset-base-100 transition-all duration-300">
                    <img
                      alt="User profile"
                      src={user?.photoURL || defaultProfileImage}
                      onError={(e) => { e.target.src = defaultProfileImage; }}
                    />
                  </div>
                </div>

                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content bg-base-100 rounded-2xl z-50 mt-3 w-64 sm:w-72 p-3 shadow-2xl border border-base-300/50 backdrop-blur-xl animate-[scaleIn_0.2s_ease-out]"
                >
                  {/* User Info Header with gradient */}
                  <li className="menu-title px-3 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl mb-2">
                    <div className="flex items-center gap-3 py-2">
                      <div className="avatar">
                        <div className="w-12 sm:w-14 rounded-full ring-2 ring-primary/30 ring-offset-2 ring-offset-base-100">
                          <img
                            src={user?.photoURL || defaultProfileImage}
                            alt="Profile"
                            onError={(e) => { e.target.src = defaultProfileImage; }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-base-content text-sm sm:text-base truncate">
                          {dbUser?.name || user?.displayName || "Super Admin"}
                        </span>
                        <span className="text-xs text-base-content/60 truncate">
                          {user?.email}
                        </span>
                        <span className="inline-block mt-1.5 px-2 py-1 rounded-lg text-xs font-semibold w-fit bg-primary/15 text-primary border border-primary/20">
                          Super Admin
                        </span>
                      </div>
                    </div>
                  </li>

                  <div className="divider my-1"></div>

                  <li>
                    <Link
                      to="/dashboard/super-admin"
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl group"
                    >
                      <FaUserCircle className="text-lg group-hover:scale-110 transition-transform" />
                      <span className="text-base">Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/super-admin/settings"
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl group"
                    >
                      <FaCog className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                      <span className="text-base">Settings</span>
                    </Link>
                  </li>

                  <div className="divider my-1"></div>

                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-error/10 hover:text-error transition-all duration-200 rounded-xl font-medium group"
                    >
                      <FaSignOutAlt className="text-lg group-hover:translate-x-1 transition-transform" />
                      <span className="text-base">Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content with subtle background pattern */}
        <div className="flex-1 p-4 lg:p-6 bg-base-100 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 animate-fadeInUp">
            <Outlet />
          </div>
        </div>

        {/* Enhanced Footer */}
        <footer className="bg-gradient-to-r from-base-200 via-base-100 to-base-200 border-t border-base-300/50 py-6 px-4 lg:px-6 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-base-content/70 flex items-center gap-2">
                <span>&copy; {new Date().getFullYear()}</span>
                <span className="font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer">
                  Rootx Software
                </span>
                <span>•</span>
                <span>All rights reserved</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <a
                  href="https://www.rootxsoftwares.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base-content/70 hover:text-primary transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1 group"
                >
                  <span>Visit Website</span>
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ===== DRAWER SIDE (Enhanced Sidebar) ===== */}
      <div className="drawer-side is-drawer-close:overflow-visible z-50">
        <label
          htmlFor="super-admin-drawer"
          aria-label="close sidebar"
          className="drawer-overlay backdrop-blur-sm"
        ></label>

        <div className="flex min-h-full flex-col items-start bg-gradient-to-b from-base-100 to-base-200/50 border-r border-base-300/50 shadow-2xl is-drawer-close:w-14 is-drawer-open:w-64 is-drawer-close:overflow-visible transition-all duration-300 backdrop-blur-xl relative">
          {/* Decorative gradient overlay on right edge */}
          <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-primary via-secondary to-accent opacity-50"></div>

          {/* Logo in sidebar (when expanded) */}
          <div className="w-full px-2 py-4 border-b border-base-300/50 is-drawer-close:hidden">
            <div className="flex items-center justify-center animate-fadeIn">
              <Logo size="md" showText={true} />
            </div>
          </div>

          {/* Sidebar Menu */}
          <ul className="menu w-full grow px-2 py-4 sidebar-scroll overflow-y-auto is-drawer-close:overflow-visible space-y-1">
            {superAdminNavItems.map((item, index) => renderNavItem(item, index))}

            {/* Platform Section Divider */}
            <div className="divider is-drawer-close:hidden my-3 text-xs text-base-content/40 uppercase tracking-wider font-bold">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Platform
              </span>
            </div>

            {/* Super Admin Info Card (shown in expanded sidebar) */}
            <li className="is-drawer-close:hidden">
              <div className="bg-primary/10 rounded-xl p-3 border border-primary/20 cursor-default hover:bg-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <FaCrown className="text-primary text-sm" />
                  <span className="font-semibold text-xs text-primary">Super Admin Access</span>
                </div>
                <p className="text-xs text-base-content/60">Full platform control & management.</p>
              </div>
            </li>
          </ul>

          {/* Sidebar Bottom: Logout */}
          <div className="w-full px-2 py-3 border-t border-base-300/50 backdrop-blur-sm">
            <button
              onClick={handleLogout}
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-base-content/70 hover:bg-gradient-to-r hover:from-error/10 hover:to-error/5 hover:text-error transition-all duration-300 active:scale-95 group"
              data-tip="Logout"
            >
              <FaSignOutAlt className="text-xl group-hover:translate-x-1 transition-transform" />
              <span className="is-drawer-close:hidden text-sm font-medium">
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Animations - ONLY define classes NOT in index.css to avoid cascade conflicts */}
      <style jsx>{`
        @keyframes sa-slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sa-slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .sa-animate-slideDown { animation: sa-slideDown 0.3s ease-out; }
        .sa-animate-slideInLeft { animation: sa-slideInLeft 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default SuperAdminDashboardLayout;
