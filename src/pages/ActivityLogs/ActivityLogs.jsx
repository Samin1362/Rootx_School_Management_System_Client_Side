import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import {
  FaHistory,
  FaFilter,
  FaUserCircle,
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaPaperPlane,
  FaSearch,
  FaEye,
  FaGlobe,
} from "react-icons/fa";

const ActivityLogs = () => {
  const axiosSecure = useAxiosSecure();
  const { error: showError } = useNotification();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  // Expanded log
  const [expandedLog, setExpandedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (action) params.action = action;
      if (resource) params.resource = resource;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axiosSecure.get("/activity-logs", { params });
      if (res.data.success) {
        setLogs(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, action, resource, startDate, endDate]);

  useEffect(() => {
    setPage(1);
  }, [action, resource, startDate, endDate]);

  const getActionIcon = (act) => {
    switch (act) {
      case "created": return <FaPlus className="text-success" />;
      case "updated": return <FaEdit className="text-info" />;
      case "deleted": return <FaTrash className="text-error" />;
      case "submitted": return <FaPaperPlane className="text-primary" />;
      case "approved": return <FaCheckCircle className="text-success" />;
      case "rejected": return <FaTimesCircle className="text-error" />;
      case "published": return <FaGlobe className="text-secondary" />;
      default: return <FaEye className="text-base-content/50" />;
    }
  };

  const getActionBadge = (act) => {
    const colors = {
      created: "badge-success",
      updated: "badge-info",
      deleted: "badge-error",
      submitted: "badge-primary",
      approved: "badge-success",
      rejected: "badge-error",
      published: "badge-secondary",
    };
    return `badge badge-sm ${colors[act] || "badge-ghost"}`;
  };

  const actions = ["created", "updated", "deleted", "submitted", "approved", "rejected", "published"];
  const resources = [
    "student", "teacher", "parent", "class", "section", "subject",
    "attendance", "exam", "grade_submission", "fee_structure",
    "student_monthly_fees", "payment", "expense", "salary", "announcement",
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-info/20 via-success/20 to-warning/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <FaHistory className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
            <p className="text-white/70 text-sm">Audit trail of all system actions</p>
          </div>
          {pagination.total > 0 && (
            <span className="ml-auto badge bg-white/20 text-white border-none">
              {pagination.total} entries
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5">
        <div className="flex items-center gap-2 mb-3">
          <FaFilter className="text-primary text-sm" />
          <span className="font-bold text-sm text-base-content">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <select className="select select-bordered select-sm" value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">All Actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
            ))}
          </select>
          <select className="select select-bordered select-sm" value={resource} onChange={(e) => setResource(e.target.value)}>
            <option value="">All Resources</option>
            {resources.map((r) => (
              <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
            ))}
          </select>
          <input
            type="date"
            className="input input-bordered input-sm"
            placeholder="From"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="input input-bordered input-sm"
            placeholder="To"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Logs */}
      {loading && logs.length === 0 ? (
        <Loader />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={FaHistory}
          title="No Activity Logs"
          message="No activity logs found for the selected filters."
        />
      ) : (
        <div className="space-y-3">
          {logs.map((log, index) => (
            <div
              key={log._id}
              className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden animate-in slide-in-from-bottom"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div
                className="p-4 cursor-pointer hover:bg-primary/5 transition-colors"
                onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-base-200/50 flex items-center justify-center flex-shrink-0">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-base-content">
                        {log.userName || "Unknown"}
                      </span>
                      <span className={getActionBadge(log.action)}>
                        {log.action}
                      </span>
                      <span className="badge badge-sm badge-ghost">
                        {log.resource?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-base-content/50">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-[10px]" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                      {log.resourceId && (
                        <span className="truncate max-w-[150px]">
                          ID: {log.resourceId}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-base-content/30 text-xs">
                    {expandedLog === log._id ? "▲" : "▼"}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedLog === log._id && (
                <div className="border-t border-base-300/50 bg-base-200/20 p-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-base-content/50 font-semibold mb-1">User</p>
                      <p className="flex items-center gap-1">
                        <FaUserCircle className="text-primary" />
                        {log.userName} ({log.userId})
                      </p>
                    </div>
                    {log.ipAddress && (
                      <div>
                        <p className="text-xs text-base-content/50 font-semibold mb-1">IP Address</p>
                        <p>{log.ipAddress}</p>
                      </div>
                    )}
                    {log.userAgent && (
                      <div className="md:col-span-2">
                        <p className="text-xs text-base-content/50 font-semibold mb-1">User Agent</p>
                        <p className="text-xs truncate">{log.userAgent}</p>
                      </div>
                    )}
                    {log.changes && (
                      <div className="md:col-span-2">
                        <p className="text-xs text-base-content/50 font-semibold mb-1">Changes</p>
                        <div className="bg-base-300/20 rounded-lg p-3 overflow-x-auto max-h-48">
                          <pre className="text-xs whitespace-pre-wrap">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <button className="join-item btn btn-sm btn-disabled">...</button>
                      )}
                      <button
                        className={`join-item btn btn-sm ${page === p ? "btn-primary" : ""}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
