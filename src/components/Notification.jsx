import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";

const typeConfig = {
  success: {
    icon: FaCheckCircle,
    bg: "bg-emerald-50",
    border: "border-emerald-400",
    text: "text-emerald-800",
    iconColor: "text-emerald-500",
    progress: "bg-emerald-500",
  },
  error: {
    icon: FaExclamationCircle,
    bg: "bg-red-50",
    border: "border-red-400",
    text: "text-red-800",
    iconColor: "text-red-500",
    progress: "bg-red-500",
  },
  warning: {
    icon: FaExclamationTriangle,
    bg: "bg-amber-50",
    border: "border-amber-400",
    text: "text-amber-800",
    iconColor: "text-amber-500",
    progress: "bg-amber-500",
  },
  info: {
    icon: FaInfoCircle,
    bg: "bg-blue-50",
    border: "border-blue-400",
    text: "text-blue-800",
    iconColor: "text-blue-500",
    progress: "bg-blue-500",
  },
};

const Notification = ({ type = "info", title, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 200);
  };

  return (
    <div
      className={`w-80 border-l-4 ${config.border} ${config.bg} rounded-r-lg shadow-lg p-4 transition-all duration-200 ${
        isVisible
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`${config.iconColor} text-lg mt-0.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          {title && (
            <p className={`${config.text} font-semibold text-sm`}>
              {title}
            </p>
          )}
          <p className={`${config.text} text-sm mt-0.5 opacity-90`}>
            {message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
