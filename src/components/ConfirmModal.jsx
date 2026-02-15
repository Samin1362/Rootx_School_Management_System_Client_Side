import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: "btn-error",
    warning: "btn-warning",
    info: "btn-info",
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <div className="flex flex-col items-center text-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              variant === "danger"
                ? "bg-red-100 text-red-500"
                : variant === "warning"
                ? "bg-amber-100 text-amber-500"
                : "bg-blue-100 text-blue-500"
            }`}
          >
            <FaExclamationTriangle className="text-xl" />
          </div>
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <div className="modal-action justify-center gap-3">
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={`btn btn-sm ${variantStyles[variant] || variantStyles.danger}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <span className="loading loading-spinner loading-xs" />}
            {confirmText}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
};

export default ConfirmModal;
