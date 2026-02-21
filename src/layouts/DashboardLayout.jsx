import React, { useState, useEffect } from "react";
import { Link, Outlet, Navigate, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import useAuth from "../hooks/useAuth";
import { useOrganization } from "../contexts/organization/OrganizationContext";
import Logo from "../components/Logo";
import Loader from "../components/Loader";
import LanguageSwitcher from "../components/LanguageSwitcher";
import {
  FaHome,
  FaUsers,
  FaSchool,
  FaCog,
  FaCreditCard,
  FaSignOutAlt,
  FaUserCircle,
  FaCrown,
  FaBell,
  FaSearch,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaLayerGroup,
  FaBookOpen,
  FaClipboardList,
  FaClipboardCheck,
  FaCalendarCheck,
  FaChartBar,
  FaFileAlt,
  FaPencilAlt,
  FaPaperPlane,
  FaSearchPlus,
  FaBullhorn,
  FaTrophy,
  FaMoneyBillWave,
  FaReceipt,
  FaHandHoldingUsd,
  FaExclamationCircle,
  FaChartLine,
  FaWallet,
  FaChild,
  FaChevronRight,
} from "react-icons/fa";
import { RiSidebarUnfoldFill } from "react-icons/ri";
import { MdLightMode, MdDarkMode } from "react-icons/md";

// ─── Standalone top-level items (no section wrapper) ────────────────────────
const standaloneItems = [
  {
    key: "overview",
    label: "Overview",
    path: "/dashboard/overview",
    icon: FaHome,
    roles: ["org_owner", "admin", "moderator"],
  },
];

// ─── Grouped navigation sections ────────────────────────────────────────────
const navSections = [
  {
    key: "people",
    label: "People",
    icon: FaUsers,
    items: [
      { key: "students", label: "Students", path: "/dashboard/students", icon: FaUserGraduate, roles: ["org_owner", "admin"] },
      { key: "teachers", label: "Teachers", path: "/dashboard/teachers", icon: FaChalkboardTeacher, roles: ["org_owner", "admin"] },
    ],
  },
  {
    key: "academics",
    label: "Academics",
    icon: FaSchool,
    items: [
      { key: "classes", label: "Classes", path: "/dashboard/classes", icon: FaLayerGroup, roles: ["org_owner", "admin"] },
      { key: "sections", label: "Sections", path: "/dashboard/sections", icon: FaClipboardList, roles: ["org_owner", "admin"] },
      { key: "subjects", label: "Subjects", path: "/dashboard/subjects", icon: FaBookOpen, roles: ["org_owner", "admin"] },
    ],
  },
  {
    key: "attendance",
    label: "Attendance",
    icon: FaCalendarCheck,
    items: [
      { key: "mark-attendance", label: "Mark Attendance", path: "/dashboard/attendance/mark", icon: FaClipboardCheck, roles: ["org_owner", "admin", "moderator", "teacher"] },
      { key: "attendance-history", label: "History", path: "/dashboard/attendance/history", icon: FaCalendarCheck, roles: ["org_owner", "admin", "moderator", "teacher"] },
      { key: "attendance-reports", label: "Reports", path: "/dashboard/attendance/reports", icon: FaChartBar, roles: ["org_owner", "admin", "moderator"] },
    ],
  },
  {
    key: "exams-grades",
    label: "Exams & Grades",
    icon: FaFileAlt,
    items: [
      { key: "exams", label: "Exams", path: "/dashboard/exams", icon: FaFileAlt, roles: ["org_owner", "admin", "teacher"] },
      { key: "grade-entry", label: "Grade Entry", path: "/dashboard/grade-entry", icon: FaPencilAlt, roles: ["teacher"] },
      { key: "my-submissions", label: "My Submissions", path: "/dashboard/my-submissions", icon: FaPaperPlane, roles: ["teacher"] },
      { key: "pending-reviews", label: "Pending Reviews", path: "/dashboard/pending-reviews", icon: FaSearchPlus, roles: ["org_owner", "admin", "moderator"] },
      { key: "grade-approval", label: "Publish Grades", path: "/dashboard/grade-approval", icon: FaBullhorn, roles: ["org_owner", "admin"] },
      { key: "results", label: "Results", path: "/dashboard/results", icon: FaTrophy, roles: ["org_owner", "admin", "moderator", "teacher"] },
      { key: "my-results", label: "My Results", path: "/dashboard/my-results", icon: FaTrophy, roles: ["student", "parent"] },
    ],
  },
  {
    key: "finance",
    label: "Finance",
    icon: FaMoneyBillWave,
    items: [
      { key: "fee-structures", label: "Fee Structures", path: "/dashboard/fee-structures", icon: FaCreditCard, roles: ["org_owner", "admin"] },
      { key: "student-fees", label: "Student Fees", path: "/dashboard/student-fees", icon: FaMoneyBillWave, roles: ["org_owner", "admin"] },
      { key: "collect-payment", label: "Collect Payment", path: "/dashboard/collect-payment", icon: FaHandHoldingUsd, roles: ["org_owner", "admin"] },
      { key: "fee-dues", label: "Fee Dues", path: "/dashboard/fee-dues", icon: FaExclamationCircle, roles: ["org_owner", "admin"] },
      { key: "fee-reports", label: "Fee Reports", path: "/dashboard/fee-reports", icon: FaChartBar, roles: ["org_owner", "admin"] },
      { key: "my-fees", label: "My Fees", path: "/dashboard/my-fees", icon: FaWallet, roles: ["student"] },
      { key: "child-fees", label: "Child Fees", path: "/dashboard/child-fees", icon: FaChild, roles: ["parent"] },
      { key: "expenses", label: "Expenses", path: "/dashboard/expenses", icon: FaReceipt, roles: ["org_owner", "admin"] },
      { key: "salaries", label: "Salaries", path: "/dashboard/salaries", icon: FaMoneyBillWave, roles: ["org_owner", "admin"] },
      { key: "finance-reports", label: "Finance Reports", path: "/dashboard/finance-reports", icon: FaChartLine, roles: ["org_owner", "admin"] },
    ],
  },
  {
    key: "communication",
    label: "Communication",
    icon: FaBullhorn,
    items: [
      { key: "announcements", label: "Announcements", path: "/dashboard/announcements", icon: FaBullhorn, roles: ["org_owner", "admin", "moderator", "teacher", "student", "parent"] },
      { key: "notifications", label: "Notifications", path: "/dashboard/notifications", icon: FaBell, roles: ["org_owner", "admin", "moderator", "teacher", "student", "parent"] },
    ],
  },
  {
    key: "administration",
    label: "Administration",
    icon: FaCog,
    items: [
      { key: "users", label: "Users", path: "/dashboard/users", icon: FaUsers, roles: ["org_owner", "admin"] },
      { key: "reports", label: "Reports", path: "/dashboard/reports", icon: FaChartBar, roles: ["org_owner", "admin", "moderator", "teacher"] },
      { key: "activity-logs", label: "Activity Logs", path: "/dashboard/activity-logs", icon: FaClipboardList, roles: ["org_owner", "admin"] },
      { key: "settings", label: "Settings", path: "/dashboard/settings", icon: FaCog, roles: ["org_owner", "admin"] },
    ],
  },
];

// ─── Organization section items (shown after divider) ───────────────────────
const orgItems = [
  {
    key: "subscription",
    label: "Subscription",
    path: "/dashboard/subscription",
    icon: FaCrown,
    roles: ["org_owner"],
  },
];

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, dbUser, loader, dbUserLoading, logoutUser, userRole, isSuperAdmin } =
    useAuth();
  const { organization, loading: orgLoading } = useOrganization();
  const { t } = useTranslation(["navbar", "common"]);

  // Default profile image
  const defaultProfileImage =
    "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

  // Theme state with localStorage persistence
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("rootx-theme") || "rootxlight";
  });

  // Section expand/collapse state — default all closed, auto-open active section
  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    navSections.forEach((section) => {
      // Auto-open the section that contains the current active route
      const hasActiveChild = section.items.some(
        (item) => location.pathname === item.path
      );
      initial[section.key] = hasActiveChild;
    });
    return initial;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Close all sections when clicking outside (for collapsed sidebar popups)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the sidebar
      const sidebar = document.querySelector('.drawer-side');
      if (sidebar && !sidebar.contains(event.target)) {
        // Close all sections
        setOpenSections((prev) => {
          const next = {};
          Object.keys(prev).forEach((k) => {
            next[k] = false;
          });
          return next;
        });
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "rootxlight" ? "rootxdark" : "rootxlight";
    setTheme(newTheme);
    localStorage.setItem("rootx-theme", newTheme);
  };

  // Helper to check active route
  const isRouteActive = (path) => location.pathname === path;

  // Accordion behavior — only one section open at a time
  const toggleSection = (key) => {
    setOpenSections((prev) => {
      const isCurrentlyOpen = prev[key];
      // Close all sections, then toggle the clicked one
      const next = {};
      Object.keys(prev).forEach((k) => {
        next[k] = false;
      });
      next[key] = !isCurrentlyOpen;
      return next;
    });
  };

  // Handle logout
  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  // Loading states with stunning animation
  if (loader || dbUserLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-base-100 via-primary/5 to-base-100 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float-reverse"></div>
        </div>

        <div className="text-center animate-fadeInUp relative z-10">
          <div className="relative inline-block">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <div className="absolute inset-0 loading loading-spinner loading-lg text-primary/20 scale-150"></div>
          </div>
          <p className="mt-6 text-base-content/70 font-medium animate-pulse">
            {dbUserLoading ? "Verifying your account..." : "Loading your workspace..."}
          </p>
          <div className="flex gap-1 justify-center mt-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Auth guards
  if (!user || !dbUser) {
    return <Navigate to="/login" replace />;
  }

  // Redirect super admins to their dedicated dashboard
  if (isSuperAdmin) {
    return <Navigate to="/dashboard/super-admin" replace />;
  }

  if (!dbUser.organizationId) {
    return <Navigate to="/waiting-for-organization" replace />;
  }

  // Role-based filtering
  const filteredStandaloneItems = standaloneItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.roles || item.roles.includes(userRole)
      ),
    }))
    .filter((section) => section.items.length > 0);

  const filteredOrgItems = orgItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  // Check if a section has an active child
  const isSectionActive = (section) =>
    section.items.some((item) => isRouteActive(item.path));

  // Role badge colors
  const roleBadgeColors = {
    org_owner: "bg-primary/15 text-primary border border-primary/20",
    admin: "bg-success/15 text-success border border-success/20",
    moderator: "bg-warning/15 text-warning border border-warning/20",
    teacher: "bg-secondary/15 text-secondary border border-secondary/20",
    student: "bg-info/15 text-info border border-info/20",
    parent: "bg-accent/15 text-accent border border-accent/20",
  };

  // ─── Render a standalone nav item (Dashboard, Subscription) ─────────────
  const renderStandaloneItem = (item, index) => (
    <Link to={item.path} key={item.key}>
      <li
        className="animate-slideInLeft"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <button
          className={`is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-3.5 w-full px-4 py-3.5 rounded-xl transition-all duration-300 active:scale-95 group ${
            isRouteActive(item.path)
              ? "bg-linear-to-r from-primary to-primary/80 text-primary-content font-semibold shadow-lg shadow-primary/20"
              : "text-base-content/70 hover:bg-gradient-to-r hover:from-primary/15 hover:to-primary/5 hover:text-primary hover:shadow-md"
          }`}
          data-tip={item.label}
        >
          <div className={`p-1.5 rounded-lg transition-all duration-300 ${
            isRouteActive(item.path)
              ? "bg-white/20"
              : "group-hover:bg-primary/10 group-hover:scale-110"
          }`}>
            <item.icon className="text-xl shrink-0" />
          </div>
          <span className="is-drawer-close:hidden text-base font-semibold tracking-wide">
            {item.label}
          </span>
        </button>
      </li>
    </Link>
  );

  // ─── Render a sub-item within a section (for expanded sidebar only) ──────────────
  const renderSubItem = (item) => (
    <Link to={item.path} key={item.key}>
      <li>
        <button
          className={`pl-12 pr-4 flex items-center gap-3 w-full py-3 rounded-lg transition-all duration-300 group relative ${
            isRouteActive(item.path)
              ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-semibold shadow-sm border-l-3 border-primary"
              : "text-base-content/70 hover:bg-gradient-to-r hover:from-base-200 hover:to-transparent hover:text-primary hover:pl-14 hover:border-l-3 hover:border-primary/30"
          }`}
        >
          <div className={`transition-transform duration-300 ${
            isRouteActive(item.path) ? "" : "group-hover:scale-125 group-hover:rotate-12"
          }`}>
            <item.icon className="text-base shrink-0" />
          </div>
          <span className="text-sm font-medium tracking-wide">{item.label}</span>
          {isRouteActive(item.path) && (
            <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
          )}
        </button>
      </li>
    </Link>
  );

  // ─── Render a collapsible section ───────────────────────────────────────
  const renderSection = (section, sectionIndex) => {
    const isOpen = openSections[section.key];
    const hasActiveChild = isSectionActive(section);

    return (
      <React.Fragment key={section.key}>
        {/* ── EXPANDED SIDEBAR: Vertical accordion (sub-items below) ── */}
        <li
          className="is-drawer-close:hidden animate-slideInLeft"
          style={{
            animationDelay: `${(sectionIndex + filteredStandaloneItems.length) * 50}ms`,
          }}
        >
          {/* Section header button */}
          <button
            onClick={() => toggleSection(section.key)}
            className={`flex items-center gap-3.5 w-full px-4 py-3.5 rounded-xl transition-all duration-300 active:scale-95 mb-2 group ${
              hasActiveChild || isOpen
                ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-bold shadow-md"
                : "text-base-content/70 hover:bg-gradient-to-r hover:from-base-200 hover:to-transparent hover:text-primary hover:shadow-sm"
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-all duration-300 ${
              hasActiveChild || isOpen
                ? "bg-primary/20 text-primary"
                : "group-hover:bg-primary/10 group-hover:scale-110"
            }`}>
              <section.icon className="text-xl shrink-0" />
            </div>
            <span className="flex-1 text-left text-base font-semibold tracking-wide">{section.label}</span>
            <FaChevronRight
              className={`size-4 transition-all duration-300 ${
                isOpen ? "rotate-90 text-primary" : "group-hover:translate-x-1"
              }`}
            />
          </button>

          {/* Sub-items — slide down below the section header */}
          {isOpen && (
            <ul className="space-y-1 mb-3 pl-2 animate-[slideDown_0.3s_ease-out]">
              {section.items.map((item) => renderSubItem(item))}
            </ul>
          )}
        </li>

        {/* ── COLLAPSED SIDEBAR: Horizontal popup (tooltip style) ── */}
        <li
          className="is-drawer-open:hidden animate-slideInLeft relative"
          style={{
            animationDelay: `${(sectionIndex + filteredStandaloneItems.length) * 50}ms`,
          }}
        >
          <button
            onClick={() => toggleSection(section.key)}
            className={`flex items-center justify-center w-full p-3.5 rounded-xl transition-all duration-300 active:scale-95 group ${
              hasActiveChild || isOpen
                ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-lg shadow-primary/20"
                : "text-base-content/70 hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent hover:text-primary hover:shadow-md"
            }`}
            title={section.label}
          >
            <div className={`transition-all duration-300 ${
              hasActiveChild || isOpen ? "" : "group-hover:scale-125 group-hover:rotate-12"
            }`}>
              <section.icon className="text-2xl shrink-0" />
            </div>
          </button>

          {/* Popup menu when section is open in collapsed mode */}
          {isOpen && (
            <div className="absolute left-full top-0 ml-3 z-50 animate-[scaleIn_0.2s_ease-out]">
              <div className="bg-base-100 shadow-2xl rounded-2xl border border-primary/20 p-3 min-w-56 backdrop-blur-xl bg-opacity-95">
                <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-gradient-to-r from-primary/10 to-transparent rounded-lg">
                  <section.icon className="text-primary text-sm" />
                  <span className="font-bold text-sm text-primary uppercase tracking-wider">
                    {section.label}
                  </span>
                </div>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <Link to={item.path} key={item.key}>
                      <li>
                        <button
                          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-300 group ${
                            isRouteActive(item.path)
                              ? "bg-linear-to-r from-primary to-primary/80 text-primary-content font-semibold shadow-md"
                              : "hover:bg-linear-to-r hover:from-primary/10 hover:to-transparent hover:text-primary text-base-content/70 hover:pl-4"
                          }`}
                        >
                          <item.icon className={`text-base shrink-0 transition-transform duration-300 ${
                            isRouteActive(item.path) ? "" : "group-hover:scale-110"
                          }`} />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      </li>
                    </Link>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </li>
      </React.Fragment>
    );
  };

  return (
    <div className="drawer lg:drawer-open">
      {/* Drawer Toggle Checkbox */}
      <input id="school-drawer" type="checkbox" className="drawer-toggle" />

      {/* ===== DRAWER CONTENT (Main Area) ===== */}
      <div className="drawer-content flex flex-col min-h-screen">
        {/* Enhanced Glassmorphism Navbar */}
        <nav className="navbar w-full bg-base-100/95 backdrop-blur-md sticky top-0 z-40 shadow-lg border-b border-base-300/50 px-2 sm:px-4 min-h-16 animate-slideDown">
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>

          <div className="flex items-center gap-2 sm:gap-3 relative z-10 w-full">
            {/* Left: Sidebar Toggle */}
            <div className="flex-none">
              <label
                htmlFor="school-drawer"
                aria-label="open sidebar"
                className="btn btn-square btn-ghost hover:bg-primary/10 hover:text-primary transition-all duration-300 active:scale-95 group hover:shadow-md"
              >
                <RiSidebarUnfoldFill className="text-xl sm:text-2xl group-hover:scale-110 group-hover:translate-x-0.5 transition-all duration-300" />
              </label>
            </div>

            {/* Organization Name Badge */}
            {organization && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-base-200/50 border border-base-300/50 animate-fadeIn">
                <FaSchool className="text-primary text-sm" />
                <span className="text-sm font-medium text-base-content truncate max-w-[150px] lg:max-w-[200px]">
                  {organization.name}
                </span>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Center-Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Button (placeholder) */}
              <button className="btn btn-circle btn-ghost btn-sm hover:bg-primary/10 hover:text-primary transition-all duration-300 group hidden sm:flex hover:shadow-md">
                <FaSearch className="text-base group-hover:scale-110 transition-transform" />
              </button>

              {/* Notifications (placeholder) */}
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

              {/* Language Switcher */}
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>

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
                      onError={(e) => {
                        e.target.src = defaultProfileImage;
                      }}
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
                            onError={(e) => {
                              e.target.src = defaultProfileImage;
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-base-content text-sm sm:text-base truncate">
                          {dbUser?.name || user?.displayName || "User"}
                        </span>
                        <span className="text-xs text-base-content/60 truncate">
                          {user?.email}
                        </span>
                        <span
                          className={`inline-block mt-1.5 px-2 py-1 rounded-lg text-xs font-semibold w-fit ${
                            roleBadgeColors[userRole] || "bg-base-300 text-base-content"
                          }`}
                        >
                          {userRole?.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  </li>

                  <div className="divider my-1"></div>

                  {/* Profile Link */}
                  <li>
                    <Link
                      to="/dashboard/overview"
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl group"
                    >
                      <FaUserCircle className="text-lg group-hover:scale-110 transition-transform" />
                      <span className="text-base">My Profile</span>
                    </Link>
                  </li>

                  {/* Settings Link */}
                  <li>
                    <Link
                      to="/dashboard/settings"
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl group"
                    >
                      <FaCog className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                      <span className="text-base">{t("navbar:settings")}</span>
                    </Link>
                  </li>

                  <div className="divider my-1"></div>

                  {/* Logout Button */}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-error/10 hover:text-error transition-all duration-200 rounded-xl font-medium group"
                    >
                      <FaSignOutAlt className="text-lg group-hover:translate-x-1 transition-transform" />
                      <span className="text-base">{t("navbar:logout")}</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content with subtle background pattern */}
        <div className="flex-1 p-4 lg:p-6 bg-base-100 relative">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 animate-fadeInUp">
            {orgLoading && !organization && <Loader />}
            {(!orgLoading || organization) && <Outlet />}
          </div>
        </div>

        {/* Enhanced Footer */}
        <footer className="bg-linear-to-r from-base-200 via-base-100 to-base-200 border-t border-base-300/50 py-6 px-4 lg:px-6 backdrop-blur-sm">
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
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ===== DRAWER SIDE (Enhanced Sidebar) ===== */}
      <div className="drawer-side is-drawer-close:overflow-visible z-50">
        <label
          htmlFor="school-drawer"
          aria-label="close sidebar"
          className="drawer-overlay backdrop-blur-sm"
        ></label>

        <div className="flex min-h-full flex-col items-start bg-base-100 border-r-2 border-primary/10 shadow-2xl is-drawer-close:w-16 is-drawer-open:w-72 is-drawer-close:overflow-visible is-drawer-open:overflow-x-hidden transition-all duration-300 relative">
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>

          {/* Logo in sidebar (when expanded) */}
          <div className="w-full px-4 py-5 border-b-2 border-primary/10 is-drawer-close:hidden bg-gradient-to-r from-primary/5 to-transparent relative z-10">
            <div className="flex items-center justify-center animate-fadeIn">
              <Logo size="md" showText={true} />
            </div>
          </div>

          {/* Sidebar Menu */}
          <ul className="menu w-full grow px-3 py-4 sidebar-scroll overflow-y-auto is-drawer-close:overflow-visible space-y-1 relative z-10">
            {/* Standalone items (Dashboard) */}
            {filteredStandaloneItems.map((item, index) =>
              renderStandaloneItem(item, index)
            )}

            {/* Section groups */}
            {filteredSections.map((section, index) =>
              renderSection(section, index)
            )}

            {/* Organization Section Divider */}
            {filteredOrgItems.length > 0 && (
              <div className="is-drawer-close:hidden my-4 px-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-secondary/10 to-transparent border-l-3 border-secondary">
                  <FaCrown className="text-secondary text-sm" />
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                    Organization
                  </span>
                </div>
              </div>
            )}

            {/* Organization Items */}
            {filteredOrgItems.map((item, index) =>
              renderStandaloneItem(
                item,
                filteredStandaloneItems.length + filteredSections.length + index
              )
            )}
          </ul>

          {/* Sidebar Bottom: Logout with style */}
          <div className="w-full px-3 py-4 border-t-2 border-error/10 bg-gradient-to-t from-error/5 to-transparent backdrop-blur-sm relative z-10">
            <button
              onClick={handleLogout}
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-3.5 w-full px-4 py-3.5 rounded-xl text-base-content/70 hover:bg-gradient-to-r hover:from-error/15 hover:to-error/5 hover:text-error transition-all duration-300 active:scale-95 group shadow-sm hover:shadow-md"
              data-tip={t("navbar:logout")}
            >
              <div className="p-1.5 rounded-lg group-hover:bg-error/10 transition-all duration-300">
                <FaSignOutAlt className="text-lg group-hover:translate-x-1 transition-transform" />
              </div>
              <span className="is-drawer-close:hidden text-sm font-semibold tracking-wide">
                {t("navbar:logout")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Animations — only define classes NOT in index.css */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }

        @keyframes float-reverse {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(20px) scale(1.05); }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 10s ease-in-out infinite; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
