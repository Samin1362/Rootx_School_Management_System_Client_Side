import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/Footer";

const PublicLayout = () => {
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

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <PublicNavbar theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
