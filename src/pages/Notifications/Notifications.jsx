import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import { FaBell, FaCheckDouble, FaCheck } from "react-icons/fa";

const Notifications = () => {
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterRead, setFilterRead] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });

  useEffect(() => { fetchNotifications(); }, [filterRead, page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterRead !== "") params.append("isRead", filterRead);
      params.append("page", page);
      params.append("limit", 20);
      const res = await axiosSecure.get(`/notifications?${params.toString()}`);
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
        setPagination(res.data.pagination);
      }
    } catch { showError("Failed to load notifications"); }
    finally { setLoading(false); }
  };

  const markAsRead = async (id) => {
    try {
      await axiosSecure.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch { showError("Failed to mark as read"); }
  };

  const markAllAsRead = async () => {
    try {
      const res = await axiosSecure.patch("/notifications/read-all");
      if (res.data.success) {
        success(res.data.message);
        fetchNotifications();
      }
    } catch { showError("Failed to mark all as read"); }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "grade_submitted": return "bg-accent/10 text-accent";
      case "grade_approved": return "bg-info/10 text-info";
      case "grade_rejected": return "bg-error/10 text-error";
      case "grade_published": return "bg-success/10 text-success";
      default: return "bg-base-200 text-base-content";
    }
  };

  if (loading && notifications.length === 0) return <Loader />;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-base-content/60 text-sm">{unreadCount} unread notification(s)</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline btn-sm" onClick={markAllAsRead}>
            <FaCheckDouble className="mr-1" /> Mark All Read
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <select className="select select-bordered select-sm" value={filterRead} onChange={(e) => { setFilterRead(e.target.value); setPage(1); }}>
          <option value="">All</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={FaBell} title="No Notifications" message="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`card bg-base-100 shadow-sm ${!n.isRead ? "border-l-4 border-primary" : ""}`}
            >
              <div className="card-body p-4 flex-row items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeIcon(n.type)}`}>
                  <FaBell className="text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-sm ${!n.isRead ? "" : "text-base-content/60"}`}>{n.title}</h3>
                  <p className="text-xs text-base-content/60 mt-1">{n.message}</p>
                  <p className="text-xs text-base-content/40 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <button className="btn btn-ghost btn-xs flex-shrink-0" onClick={() => markAsRead(n._id)} title="Mark as read">
                    <FaCheck />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="btn btn-sm btn-disabled">{page} / {pagination.pages}</span>
          <button className="btn btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
