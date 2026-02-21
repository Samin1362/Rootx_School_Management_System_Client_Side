import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router";
import Logo from "./Logo";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import {
  FaBars,
  FaTimes,
  FaSignInAlt,
  FaHome,
  FaEnvelope,
} from "react-icons/fa";

const PublicNavbar = ({ theme, toggleTheme }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navLinks = [
    { to: "/", label: "Home", icon: FaHome, end: true },
    { to: "/contact", label: "Contact", icon: FaEnvelope },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 border-b border-base-300/50 ${
        scrolled
          ? "bg-base-100/95 backdrop-blur-md shadow-lg shadow-base-300/20"
          : "bg-base-100/80 backdrop-blur-sm shadow-sm"
      }`}
    >
      {/* Gradient accent line at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="md" showText={true} linkTo="/" />
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-base-content/70 hover:text-primary hover:bg-primary/5"
                  }`
                }
              >
                <Icon className="text-sm group-hover:scale-110 transition-transform duration-200" />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-circle btn-ghost btn-sm hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
              title={
                theme === "rootxlight"
                  ? "Switch to Dark Mode"
                  : "Switch to Light Mode"
              }
            >
              {theme === "rootxlight" ? (
                <MdDarkMode className="text-xl group-hover:scale-110 transition-transform" />
              ) : (
                <MdLightMode className="text-xl group-hover:scale-110 transition-transform" />
              )}
            </button>

            {/* Login Button — desktop only */}
            <Link
              to="/login"
              className="hidden md:flex btn btn-primary btn-sm gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300"
            >
              <FaSignInAlt className="text-xs" />
              Login
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden btn btn-circle btn-ghost btn-sm hover:bg-primary/10 hover:text-primary transition-all"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? (
                <FaTimes className="text-lg" />
              ) : (
                <FaBars className="text-lg" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-base-300/50 bg-base-100/97 backdrop-blur-md px-4 py-4 space-y-1 animate-fadeInUp">
          {navLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-base-content/70 hover:bg-primary/5 hover:text-primary"
                }`
              }
            >
              <Icon className="text-sm" />
              {label}
            </NavLink>
          ))}
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 btn btn-primary btn-sm w-full mt-3"
          >
            <FaSignInAlt className="text-xs" />
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
