import { useState, useEffect } from "react";
import { Link } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import ConfirmModal from "../../components/ConfirmModal";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import { FaPlus, FaEye, FaTrash, FaChalkboardTeacher, FaSearch } from "react-icons/fa";

const Teachers = () => {
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const limit = 10;

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await axiosSecure.get("/teachers", { params });
      if (res.data.success) {
        setTeachers(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showError("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(); }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTeachers();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await axiosSecure.delete(`/teachers/${deleteTarget._id}`);
      success("Teacher removed successfully");
      setDeleteTarget(null);
      fetchTeachers();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to remove teacher");
    } finally {
      setDeleteLoading(false);
    }
  };

  const defaultImg = "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Teachers</h1>
          <p className="text-base-content/60 text-sm mt-1">Manage teachers and their assignments</p>
        </div>
        <Link to="/dashboard/teachers/add" className="btn btn-primary btn-sm gap-2">
          <FaPlus /> Add Teacher
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-xs" />
            <input
              type="text"
              className="input input-bordered input-sm w-full pl-8"
              placeholder="Search by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-ghost btn-sm">Search</button>
        </form>
        <select
          className="select select-bordered select-sm"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On Leave</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <Loader />
      ) : teachers.length === 0 ? (
        <EmptyState
          icon={FaChalkboardTeacher}
          title="No teachers yet"
          message="Add teachers to assign them to classes and subjects."
          action={() => window.location.href = "/dashboard/teachers/add"}
          actionLabel="Add Teacher"
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-sm bg-base-100 border border-base-300/50 rounded-xl">
              <thead>
                <tr className="bg-base-200/50">
                  <th>Teacher</th>
                  <th>Employee ID</th>
                  <th>Qualification</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-base-200/30 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img
                              src={teacher.user?.photoURL || defaultImg}
                              alt={teacher.user?.name}
                              onError={(e) => { e.target.src = defaultImg; }}
                            />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-base-content text-sm">{teacher.user?.name || "Unknown"}</p>
                          <p className="text-xs text-base-content/50">{teacher.user?.email || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-ghost badge-xs">{teacher.employeeId || "—"}</span>
                    </td>
                    <td className="text-sm text-base-content/60">{teacher.qualification || "—"}</td>
                    <td>
                      <span className={`badge badge-xs ${
                        teacher.status === "active" ? "badge-success" :
                        teacher.status === "on_leave" ? "badge-warning" : "badge-error"
                      }`}>
                        {teacher.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Link to={`/dashboard/teachers/${teacher._id}`} className="btn btn-ghost btn-xs text-info">
                          <FaEye />
                        </Link>
                        <button onClick={() => setDeleteTarget(teacher)} className="btn btn-ghost btn-xs text-error">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center">
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pagination.pages)
                  .map((p) => (
                    <button
                      key={p}
                      className={`join-item btn btn-sm ${p === page ? "btn-primary" : ""}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  className="join-item btn btn-sm"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Teacher?"
        message={`This will deactivate "${deleteTarget?.user?.name || "this teacher"}" and unassign them from all subjects and sections.`}
        confirmText="Remove"
        loading={deleteLoading}
        variant="danger"
      />
    </div>
  );
};

export default Teachers;
