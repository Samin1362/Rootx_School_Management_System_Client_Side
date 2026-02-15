import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import useAuth from "../hooks/useAuth";
import Logo from "../components/Logo";
import { FaSchool, FaCreditCard, FaSignOutAlt, FaClock } from "react-icons/fa";

const WaitingForOrganization = () => {
  const { user, logoutUser } = useAuth();
  const { t } = useTranslation("auth");

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
          <FaClock className="text-blue-500 text-3xl" />
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {t("noOrganization")}
        </h1>
        <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
          {t("waitingDescription")}
        </p>

        {user && (
          <p className="text-xs text-gray-400 mb-6">
            Signed in as <span className="font-medium text-gray-600">{user.email}</span>
          </p>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/signup"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
          >
            <FaSchool />
            {t("registerSchool")}
          </Link>

          <Link
            to="/plans"
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm transition-colors"
          >
            <FaCreditCard />
            {t("viewPlans")}
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 text-gray-500 hover:text-gray-700 font-medium rounded-lg text-sm transition-colors"
          >
            <FaSignOutAlt />
            {t("logout")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingForOrganization;
