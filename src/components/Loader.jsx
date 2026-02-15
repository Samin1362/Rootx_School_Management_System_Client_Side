import { FaGraduationCap } from "react-icons/fa";

const Loader = ({ fullPage = true, message = "Loading..." }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-spin border-t-blue-600" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FaGraduationCap className="text-blue-600 text-lg" />
        </div>
      </div>
      <p className="text-gray-500 text-sm font-medium animate-pulse">
        {message}
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{content}</div>;
};

export default Loader;
