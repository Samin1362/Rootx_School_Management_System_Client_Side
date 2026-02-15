import { createContext, useCallback, useContext, useState } from "react";
import Notification from "../components/Notification";

const NotificationContext = createContext();

let notificationId = 0;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback(
    ({
      type = "info",
      message,
      title,
      duration = 5000,
      position = "top-right",
    }) => {
      const id = ++notificationId;

      setNotifications((prev) => [
        ...prev,
        { id, type, message, title, position },
      ]);

      if (duration > 0) {
        setTimeout(() => removeNotification(id), duration);
      }

      return id;
    },
    [removeNotification]
  );

  const success = useCallback(
    (message, title = "Success") =>
      showNotification({ type: "success", message, title }),
    [showNotification]
  );

  const error = useCallback(
    (message, title = "Error") =>
      showNotification({ type: "error", message, title, duration: 7000 }),
    [showNotification]
  );

  const warning = useCallback(
    (message, title = "Warning") =>
      showNotification({ type: "warning", message, title }),
    [showNotification]
  );

  const info = useCallback(
    (message, title = "Info") =>
      showNotification({ type: "info", message, title }),
    [showNotification]
  );

  const value = {
    showNotification,
    success,
    error,
    warning,
    info,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            {...notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export default NotificationContext;
