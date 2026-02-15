import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import Logo from "../components/Logo";
import { FaExclamationTriangle, FaSignOutAlt, FaEnvelope } from "react-icons/fa";

const OrganizationSuspended = () => {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/20 to-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        {/* Warning Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
          <FaExclamationTriangle className="text-red-500 text-3xl" />
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Organization Suspended
        </h1>
        <p className="text-gray-500 text-sm mb-4 max-w-sm mx-auto">
          Your organization has been suspended. Access to all features is
          temporarily restricted.
        </p>

        <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8 text-left">
          <h3 className="text-sm font-semibold text-red-700 mb-1">
            What does this mean?
          </h3>
          <ul className="text-xs text-red-600 space-y-1">
            <li>- All users in your organization cannot access the system</li>
            <li>- Your data is safe and will not be deleted</li>
            <li>- Contact the platform administrator for assistance</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <a
            href="mailto:support@rootx.com"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
          >
            <FaEnvelope />
            Contact Support
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm transition-colors"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSuspended;
