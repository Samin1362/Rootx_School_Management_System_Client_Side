import { FaInbox } from "react-icons/fa";

const EmptyState = ({
  icon: Icon = FaInbox,
  title = "No data found",
  message = "There are no items to display.",
  action,
  actionLabel,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="text-2xl text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 max-w-sm">{message}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="btn btn-primary btn-sm mt-4"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
