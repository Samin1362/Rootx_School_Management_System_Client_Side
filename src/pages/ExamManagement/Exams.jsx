import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ConfirmModal from "../../components/ConfirmModal";
import { FaFileAlt, FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router";

const Exams = () => {
  const axiosSecure = useAxiosSecure();
  const { userRole } = useAuth();
  const { success: showSuccess, error: showError } = useNotification();
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterClass, setFilterClass] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchExams();
  }, [filterClass, filterYear, filterStatus, page]);

  const fetchClasses = async () => {
    try {
      const res = await axiosSecure.get("/classes");
      if (res.data.success) {
        setClasses(res.data.data.filter((c) => c.status === "active"));
      }
    } catch {
      showError("Failed to load classes");
    }
  };

  const fetchExams = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterClass) params.append("classId", filterClass);
      if (filterYear) params.append("academicYear", filterYear);
      if (filterStatus) params.append("status", filterStatus);
      params.append("page", page);
      params.append("limit", 10);

      const res = await axiosSecure.get(`/exams?${params.toString()}`);
      if (res.data.success) {
        setExams(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch {
      showError("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await axiosSecure.delete(`/exams/${deleteTarget._id}`);
      if (res.data.success) {
        showSuccess(res.data.message);
        fetchExams();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete exam");
    } finally {
      setDeleteTarget(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      upcoming: "badge-info",
      ongoing: "badge-warning",
      completed: "badge-success",
    };
    return `badge ${styles[status] || "badge-ghost"} badge-sm`;
  };

  if (loading && exams.length === 0) return <Loader />;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Exam Management</h1>
          <p className="text-base-content/60 text-sm">
            Create and manage examinations
          </p>
        </div>
        {["org_owner", "admin", "teacher"].includes(userRole) && (
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/dashboard/exams/add")}>
            <FaPlus className="mr-1" /> Create Exam
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          className="select select-bordered select-sm"
          value={filterClass}
          onChange={(e) => { setFilterClass(e.target.value); setPage(1); }}
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select
          className="select select-bordered select-sm"
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
        <input
          type="text"
          className="input input-bordered input-sm w-24"
          placeholder="Year"
          value={filterYear}
          onChange={(e) => { setFilterYear(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      {exams.length === 0 ? (
        <EmptyState icon={FaFileAlt} title="No Exams" message="No exams found. Create one to get started." />
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Academic Year</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Submissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => {
                const subStatus = exam.submissionStatus || {};
                const total = Object.values(subStatus).reduce((a, b) => a + b, 0);
                const published = subStatus.published || 0;
                return (
                  <tr key={exam._id}>
                    <td className="font-medium">{exam.name}</td>
                    <td>{exam.className}</td>
                    <td>{exam.academicYear}</td>
                    <td>{new Date(exam.startDate).toLocaleDateString()}</td>
                    <td>{new Date(exam.endDate).toLocaleDateString()}</td>
                    <td><span className={getStatusBadge(exam.status)}>{exam.status}</span></td>
                    <td>
                      <span className="text-xs">
                        {published}/{total} published
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => navigate(`/dashboard/exams/${exam._id}`)}
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {["org_owner", "admin"].includes(userRole) && (
                          <>
                            <button className="btn btn-ghost btn-xs" onClick={() => navigate(`/dashboard/exams/edit/${exam._id}`)} title="Edit">
                              <FaEdit />
                            </button>
                            <button className="btn btn-ghost btn-xs text-error" onClick={() => setDeleteTarget(exam)} title="Delete">
                              <FaTrash />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span className="btn btn-sm btn-disabled">
            {page} / {pagination.pages}
          </span>
          <button className="btn btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={true}
          title="Delete Exam"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This will also remove all associated grade submissions.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Exams;
