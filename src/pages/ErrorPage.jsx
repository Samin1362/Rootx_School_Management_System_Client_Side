import { Link, useRouteError } from "react-router";
import { FaHome, FaExclamationCircle } from "react-icons/fa";

const ErrorPage = () => {
  const error = useRouteError?.();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
          <FaExclamationCircle className="text-blue-500 text-3xl" />
        </div>

        <h1 className="text-6xl font-bold text-gray-200 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
          {error?.statusText || error?.message || "The page you are looking for doesn't exist or has been moved."}
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
        >
          <FaHome />
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
