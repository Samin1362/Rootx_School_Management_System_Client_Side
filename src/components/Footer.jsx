import { Link } from "react-router";
import Logo from "./Logo";
import {
  FaGlobe,
  FaLinkedin,
  FaGithub,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowRight,
} from "react-icons/fa";

const Footer = () => {
  const quickLinks = [
    { to: "/", label: "Home" },
    { to: "/contact", label: "Contact" },
    { to: "/plans", label: "View Plans" },
    { to: "/login", label: "Login" },
    { to: "/register", label: "Register" },
    { to: "/signup", label: "Create School" },
  ];

  const contactInfo = [
    {
      icon: FaEnvelope,
      label: "Email",
      value: "support@rootxsoftwares.com",
    },
    {
      icon: FaPhone,
      label: "Phone",
      value: "+880 1XXX-XXXXXX",
    },
    {
      icon: FaMapMarkerAlt,
      label: "Location",
      value: "Dhaka, Bangladesh",
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-base-200 to-base-300 border-t border-base-300/50">
      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand Column */}
          <div className="space-y-4">
            <Logo size="md" showText={true} linkTo="/" />
            <p className="text-sm text-base-content/60 leading-relaxed max-w-xs">
              RootX School Management System — a comprehensive, cloud-based platform built for modern educational institutions across Bangladesh and beyond.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.rootxsoftwares.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-base-300/60 hover:bg-primary/10 hover:text-primary text-base-content/50 transition-all duration-200 hover:scale-110"
                title="Website"
              >
                <FaGlobe className="text-base" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-base-300/60 hover:bg-primary/10 hover:text-primary text-base-content/50 transition-all duration-200 hover:scale-110"
                title="LinkedIn"
              >
                <FaLinkedin className="text-base" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-base-300/60 hover:bg-primary/10 hover:text-primary text-base-content/50 transition-all duration-200 hover:scale-110"
                title="GitHub"
              >
                <FaGithub className="text-base" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base-content text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map(({ to, label }) => (
                <li key={`${to}-${label}`}>
                  <Link
                    to={to}
                    className="flex items-center gap-2 text-sm text-base-content/60 hover:text-primary transition-all duration-200 group"
                  >
                    <FaArrowRight className="text-xs opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base-content text-sm uppercase tracking-wider">
              Get In Touch
            </h3>
            <ul className="space-y-3">
              {contactInfo.map(({ icon: Icon, label, value }) => (
                <li key={label} className="flex items-start gap-3 text-sm text-base-content/60">
                  <Icon className="text-primary mt-0.5 flex-shrink-0" />
                  <span>{value}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 btn btn-sm btn-outline btn-primary mt-2"
            >
              <FaEnvelope className="text-xs" />
              Send a Message
            </Link>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-base-300/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-base-content/40">
          <span>
            &copy; {new Date().getFullYear()} Rootx Software Limited. All rights reserved.
          </span>
          <span>
            Powered by{" "}
            <span className="text-primary font-semibold">RootX SMS</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
