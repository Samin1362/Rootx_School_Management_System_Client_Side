import { useState, useEffect } from "react";
import { Link } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import {
  FaBullhorn,
  FaPlus,
  FaFilter,
  FaEdit,
  FaTrash,
  FaSchool,
  FaLayerGroup,
  FaClipboardList,
  FaUsers,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaInfoCircle,
  FaCalendarAlt,
  FaUserCircle,
} from "react-icons/fa";

const Announcements = () => {
  const axiosSecure = useAxiosSecure();
  const { userRole } = useAuth();
  const { success, error: showError } = useNotification();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  // Filters
  const [targetFilter, setTargetFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const canCreate = ["org_owner", "admin", "teacher"].includes(userRole);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (targetFilter) params.target = targetFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const res = await axiosSecure.get("/announcements", { params });
      if (res.data.success) {
        setAnnouncements(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, targetFilter, priorityFilter]);

  useEffect(() => {
    setPage(1);
  }, [targetFilter, priorityFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    setDeleting(id);
    try {
      const res = await axiosSecure.delete(`/announcements/${id}`);
      if (res.data.success) {
        success("Announcement deleted successfully");
        fetchAnnouncements();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete announcement");
    } finally {
      setDeleting(null);
    }
  };

  const getTargetIcon = (target) => {
    switch (target) {
      case "school": return <FaSchool className="text-primary" />;
      case "class": return <FaLayerGroup className="text-secondary" />;
      case "section": return <FaClipboardList className="text-accent" />;
      case "role": return <FaUsers className="text-info" />;
      default: return <FaBullhorn className="text-primary" />;
    }
  };

  const getTargetBadge = (target, targetRole) => {
    const labels = {
      school: "School-wide",
      class: "Class",
      section: "Section",
      role: targetRole ? targetRole.charAt(0).toUpperCase() + targetRole.slice(1) + "s" : "Role",
    };
    const colors = {
      school: "badge-primary",
      class: "badge-secondary",
      section: "badge-accent",
      role: "badge-info",
    };
    return (
      <span className={`badge badge-sm ${colors[target] || "badge-ghost"}`}>
        {labels[target] || target}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="badge badge-sm badge-error gap-1">
            <FaExclamationTriangle className="text-xs" /> Urgent
          </span>
        );
      case "important":
        return (
          <span className="badge badge-sm badge-warning gap-1">
            <FaExclamationCircle className="text-xs" /> Important
          </span>
        );
      default:
        return (
          <span className="badge badge-sm badge-ghost gap-1">
            <FaInfoCircle className="text-xs" /> Normal
          </span>
        );
    }
  };

  if (loading && announcements.length === 0) return <Loader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-info/20 via-success/20 to-warning/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <FaBullhorn className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Announcements</h1>
              <p className="text-white/70 text-sm">School notices and updates</p>
            </div>
          </div>
          {canCreate && (
            <Link
              to="/dashboard/announcements/create"
              className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-none gap-2"
            >
              <FaPlus /> New Announcement
            </Link>
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
          <select
            className="select select-bordered select-sm"
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
          >
            <option value="">All Targets</option>
            <option value="school">School-wide</option>
            <option value="class">Class</option>
            <option value="section">Section</option>
            <option value="role">Role</option>
          </select>
          <select
            className="select select-bordered select-sm"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="normal">Normal</option>
            <option value="important">Important</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <Loader />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={FaBullhorn}
          title="No Announcements"
          message="There are no announcements to display."
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((ann, index) => (
            <div
              key={ann._id}
              className={`bg-gradient-to-br from-base-100 to-base-200/50 border rounded-2xl shadow-md p-5 hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom ${
                ann.priority === "urgent"
                  ? "border-error/30"
                  : ann.priority === "important"
                  ? "border-warning/30"
                  : "border-base-300/50"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    {getTargetIcon(ann.target)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-base-content text-lg">{ann.title}</h3>
                      {getPriorityBadge(ann.priority)}
                      {getTargetBadge(ann.target, ann.targetRole)}
                    </div>
                    <p className="text-base-content/70 text-sm mt-1 whitespace-pre-wrap">
                      {ann.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-base-content/50">
                      <span className="flex items-center gap-1">
                        <FaUserCircle />
                        {ann.createdByName || "Unknown"}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt />
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                      {ann.expiresAt && (
                        <span className="flex items-center gap-1">
                          Expires: {new Date(ann.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {canCreate && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/dashboard/announcements/edit/${ann._id}`}
                      className="btn btn-ghost btn-sm btn-square hover:bg-primary/10 hover:text-primary"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => handleDelete(ann._id)}
                      className="btn btn-ghost btn-sm btn-square hover:bg-error/10 hover:text-error"
                      disabled={deleting === ann._id}
                    >
                      {deleting === ann._id ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                )}
              </div>
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

export default Announcements;
